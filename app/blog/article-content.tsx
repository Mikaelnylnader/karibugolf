import type { ReactNode } from "react";

const shopLinks: Record<string, string> = {
  "/categories/drivers.html": "/shop/clubs/drivers",
  "/categories/golf_irons.html": "/shop/clubs/golf_irons",
  "/categories/putters.html": "/shop/clubs/putters",
  "/categories/wedges.html": "/shop/clubs/wedges",
  "/categories/gloves.html": "/shop/accessories/gloves",
  "/categories/hats_and_caps.html": "/shop/accessories/hats_and_caps",
  "/categories/range_finders.html": "/shop/accessories/range_finders",
  "/categories/bags.html": "/shop/bags/bags",
  "/categories/balls.html": "/shop/balls/balls",
  "/categories/mens_shoes.html": "/shop/shoes/mens_shoes",
};

function inlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const pieces = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return pieces.map((piece, index) => {
    const key = `${keyPrefix}-${index}`;
    if (piece.startsWith("**") && piece.endsWith("**")) {
      return <strong key={key}>{piece.slice(2, -2)}</strong>;
    }
    const link = piece.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = shopLinks[link[2]] ?? link[2];
      const external = href.startsWith("http");
      return <a key={key} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>{link[1]}</a>;
    }
    return piece;
  });
}

export default function ArticleContent({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return <>
    {blocks.map((block, index) => {
      const key = `article-block-${index}`;
      if (block.startsWith("### ")) return <h3 key={key}>{inlineMarkdown(block.slice(4), key)}</h3>;
      if (block.startsWith("## ")) return <h2 key={key}>{inlineMarkdown(block.slice(3), key)}</h2>;

      const lines = block.split("\n");
      if (lines.every((line) => /^-\s+/.test(line))) {
        return <ul key={key}>{lines.map((line, item) => <li key={`${key}-${item}`}>{inlineMarkdown(line.replace(/^-\s+/, ""), `${key}-${item}`)}</li>)}</ul>;
      }
      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        return <ol key={key}>{lines.map((line, item) => <li key={`${key}-${item}`}>{inlineMarkdown(line.replace(/^\d+\.\s+/, ""), `${key}-${item}`)}</li>)}</ol>;
      }
      return <p key={key}>{inlineMarkdown(lines.join(" "), key)}</p>;
    })}
  </>;
}
