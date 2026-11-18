"""Verify the complete static SEO package without network or inventory writes.

Requires beautifulsoup4 (also used by the live audit). The published sitemap is
the route contract; all links, metadata, JSON-LD and local images are inspected.
"""
import json
import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "dist/static"
ORIGIN = "https://karibugolf.com"
failures = []


def check(condition, message):
    if not condition:
        failures.append(message)


def local_file(url):
    target = (PACKAGE / unquote(urlsplit(url).path).lstrip("/")).resolve()
    if not target.is_relative_to(PACKAGE.resolve()):
        raise ValueError(f"Unsafe package path: {url}")
    return target / "index.html" if target.is_dir() else target


def graph_of(soup):
    graph = []
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            value = json.loads(tag.string or tag.get_text())
            graph.extend(value.get("@graph", [value]) if isinstance(value, dict) else value)
        except (ValueError, TypeError) as error:
            failures.append(f"Invalid JSON-LD: {error}")
    return graph


def main():
    sitemap = ET.fromstring((PACKAGE / "sitemap.xml").read_text(encoding="utf-8"))
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9", "i": "http://www.google.com/schemas/sitemap-image/1.1"}
    urls = [entry.text for entry in sitemap.findall("s:url/s:loc", ns)]
    titles, descriptions = defaultdict(list), defaultdict(list)
    report = []
    for entry in sitemap.findall("s:url", ns):
        url = entry.find("s:loc", ns).text
        path = local_file(url)
        check(path.is_file(), f"{url}: sitemap route is missing")
        if not path.is_file():
            continue
        soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
        head = soup.head
        title = head.title.get_text(strip=True) if head and head.title else ""
        meta = head.find("meta", attrs={"name": "description"}) if head else None
        description = meta.get("content", "") if meta else ""
        check(bool(title), f"{url}: missing initial-head title")
        check(45 <= len(description) <= 160, f"{url}: description length {len(description)}")
        titles[title].append(url)
        descriptions[description].append(url)
        canonicals = head.find_all("link", rel="canonical") if head else []
        check(len(canonicals) == 1, f"{url}: expected exactly one initial-head canonical")
        check(bool(canonicals) and canonicals[0].get("href") == url, f"{url}: wrong canonical")
        check(urlsplit(url).path == urlsplit(url).path.lower(), f"{url}: mixed-case public URL")
        check(len(soup.find_all("h1")) == 1, f"{url}: expected exactly one H1")
        check(not any("noindex" in m.get("content", "").lower() for m in soup.find_all("meta", attrs={"name": "robots"})), f"{url}: public page is noindex")
        for key in ["og:title", "og:description", "og:url", "og:image"]:
            check(bool(head.find("meta", property=key)), f"{url}: missing {key}")
        og_url = head.find("meta", property="og:url")
        check(bool(og_url) and og_url.get("content") == url, f"{url}: wrong Open Graph URL")
        graph = graph_of(soup)
        organization = next((s for s in graph if s.get("@type") == "Organization" and s.get("@id") == ORIGIN + "/#organization"), None)
        check(bool(organization), f"{url}: missing shared business entity")
        if organization:
            check(organization.get("telephone") == "+254116416105", f"{url}: wrong business telephone")
            check(local_file(organization["logo"]).is_file(), f"{url}: missing organization logo")
            check("address" not in organization, f"{url}: do not invent an unverified street address")
        for link in soup.select("a[href]"):
            href = urljoin(url, link["href"])
            parsed = urlsplit(href)
            if parsed.netloc != "karibugolf.com" or parsed.scheme not in ["http", "https"]:
                continue
            if parsed.path.startswith(("/api/", "/admin/")):
                continue
            check(local_file(href).is_file(), f"{url}: broken internal link {href}")
        for image in soup.find_all("img"):
            src = urljoin(url, image.get("src", ""))
            if urlsplit(src).netloc == "karibugolf.com":
                check(not urlsplit(src).path.startswith(("/api/", "/admin/")), f"{url}: blocked visible image {src}")
                check(local_file(src).is_file(), f"{url}: missing static image {src}")
        product = next((s for s in graph if s.get("@type") == "Product"), None)
        sitemap_images = [image.text for image in entry.findall("i:image/i:loc", ns)]
        if product:
            check(set(sitemap_images) == set(product.get("image", [])), f"{url}: sitemap images differ from the authored gallery")
            check(len(sitemap_images) == len(set(sitemap_images)), f"{url}: duplicate sitemap images")
        for image in sitemap_images:
            parsed = urlsplit(image)
            if parsed.netloc == "karibugolf.com":
                check(not parsed.path.startswith(("/api/", "/admin/")), f"{url}: crawler-blocked sitemap image")
                check(local_file(image).is_file(), f"{url}: missing sitemap image {image}")
        report.append({"url": url, "title": title, "descriptionLength": len(description), "schemaTypes": [s.get("@type") for s in graph]})

    check(not any(len(values) > 1 for values in titles.values()), f"Duplicate titles: {dict((k,v) for k,v in titles.items() if len(v)>1)}")
    check(not any(len(values) > 1 for values in descriptions.values()), f"Duplicate descriptions: {dict((k,v) for k,v in descriptions.items() if len(v)>1)}")
    check(ORIGIN + "/coaching/" in urls and ORIGIN + "/Coaching/" not in urls, "Coaching sitemap must use lowercase")
    robots = (PACKAGE / "robots.txt").read_text(encoding="utf-8")
    for agent in ["OAI-SearchBot", "Googlebot", "*"]:
        group = robots.split("User-agent: " + agent + "\n", 1)[-1].split("\n\n", 1)[0]
        check("Allow: /" in group and "Disallow: /api/" in group and "Disallow: /admin/" in group, f"Crawler rules changed for {agent}")
    redirects = (PACKAGE / "_redirects").read_text(encoding="utf-8")
    check("/blog/regular-stiff-senior-iron-flex-guide/ /blog/steel-vs-graphite-iron-shafts-kenya/ 301" in redirects, "Missing permanent redirect for the old flex-guide URL")
    catalogue = json.loads((ROOT / "lib/catalog.generated.json").read_text(encoding="utf-8"))
    expected_products = {ORIGIN + f"/shop/product/{product['slug']}/" for product in catalogue["products"]}
    actual_products = {url for url in urls if url.startswith(ORIGIN + "/shop/product/")}
    check(actual_products == expected_products, "Sitemap product routes must match the catalogue used for this build")
    llms = (PACKAGE / "llms.txt").read_text(encoding="utf-8")
    check("https://karibugolf.com/coaching/" in llms and "/Coaching/" not in llms, "AI discovery file uses wrong coaching URL")
    output = ROOT / ".tmp/seo-fixes-2026-11-18"
    output.mkdir(parents=True, exist_ok=True)
    (output / "verification.json").write_text(json.dumps({"pages": report, "failures": failures}, indent=2), encoding="utf-8")
    print(json.dumps({"pages": len(report), "failures": failures}, indent=2))
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
