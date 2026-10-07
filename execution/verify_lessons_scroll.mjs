import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const base = (process.argv[2] || 'http://localhost:5201').replace(/\/$/, '');
const output = '.tmp/golf-lessons-qa/scroll-' + new Date().toISOString().replace(/[:.]/g, '-');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const failures = [], errors = [], reports = [];
const check = (pass, message) => { if (!pass) failures.push(message); };
const configs = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'compact', width: 606, height: 604 },
  { name: 'short-desktop', width: 1280, height: 604 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'compact-phone', width: 360, height: 640 },
  { name: 'reduced', width: 1440, height: 900, static: true, reduced: true },
  { name: 'enlarged', width: 390, height: 844, static: true, large: true },
  { name: 'no-js', width: 390, height: 844, static: true, noJS: true },
];
const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).split(',');
const heroOnly = process.argv.includes('--hero-only');
async function scroll(page, top, scripted) {
  await page.evaluate(top => scrollTo({ top, left: 0, behavior: 'instant' }), top);
  if (scripted) await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(100);
}
try {
  for (const config of configs) {
    if (only && !only.includes(config.name)) continue;
    const context = await browser.newContext({ viewport: { width: config.width, height: config.height }, javaScriptEnabled: !config.noJS, reducedMotion: config.reduced ? 'reduce' : 'no-preference' });
    await context.addInitScript(() => { Element.prototype.requestPointerLock = () => Promise.reject(new Error('Disabled for QA')); Element.prototype.setPointerCapture = () => {}; Element.prototype.releasePointerCapture = () => {}; Document.prototype.exitPointerLock = () => {}; });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(config.name + ': ' + e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(config.name + ': ' + msg.text().slice(0, 250)); });
    page.on('response', r => { if (r.status() >= 400) errors.push(config.name + ': HTTP ' + r.status() + ' ' + r.url()); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (!config.noJS) await page.waitForSelector('html.sc-ready');
    if (config.large) { await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; dispatchEvent(new Event('resize')); }); await page.waitForTimeout(180); }
    const hero = await page.locator('.lessons-hero').evaluate(el => ({ height: el.offsetHeight, pinned: getComputedStyle(el.firstElementChild).position === 'sticky' }));
    const snapshots = [];
    for (let i = 0; i < 6; i++) {
      const travel = hero.pinned ? hero.height - config.height : Math.max(hero.height * 0.6, config.height * 0.7);
      await scroll(page, travel * i / 5, !config.noJS);
      const shot = await page.evaluate(() => {
        const style = selector => getComputedStyle(document.querySelector(selector)).transform;
        const bounds = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
        const caption = document.querySelector('.lessons-print figcaption').firstChild;
        const captionWords = [...caption.textContent.matchAll(/\S+/g)].map(word => { const range = document.createRange(); range.setStart(caption, word.index); range.setEnd(caption, word.index + word[0].length); return range.getBoundingClientRect().toJSON(); });
        return { overflow: document.documentElement.scrollWidth - innerWidth, scrollX, fairway: style('.lessons-fairway'), print: style('.lessons-print'), seal: style('.lessons-seal'), sealBounds: bounds('.lessons-seal'), caption: bounds('.lessons-print figcaption'), captionWords, arc: getComputedStyle(document.querySelector('.swing-arc-draw')).strokeDashoffset, copy: bounds('.lessons-hero-copy'), stage: bounds('.lessons-hero-stage'), headline: bounds('h1'), titleTransform: style('h1'), copyTransform: style('.lessons-hero-copy') };
      });
      snapshots.push(shot);
      check(shot.overflow <= 1 && shot.scrollX === 0, config.name + ': hero fits at ' + i);
      const seal = shot.sealBounds;
      check(!shot.captionWords.some(word => seal.right > word.left && seal.left < word.right && seal.bottom > word.top && seal.top < word.bottom), config.name + ': badge leaves caption words clear at ' + i);
      if (i === 0) {
        check(shot.headline.top >= await page.locator('header').evaluate(el => el.getBoundingClientRect().bottom), config.name + ': opening title clears navigation');
        const cta = await page.locator('.lessons-hero .lesson-button').boundingBox();
        if (!config.large) check(cta.y + cta.height <= config.height, config.name + ': opening booking button visible');
      }
      if (i === 0 || i === 3 || i === 5) await page.screenshot({ path: `${output}/${config.name}-hero-${i}.png` });
    }
    if (!config.static) {
      check(snapshots[0].fairway !== snapshots[5].fairway && snapshots[0].print !== snapshots[5].print && snapshots[0].seal !== snapshots[5].seal, config.name + ': three real depth planes move');
      check(snapshots[0].arc !== snapshots[5].arc, config.name + ': swing arc progresses');
    } else check(!hero.pinned, config.name + ': no static pin spacer');
    if (heroOnly) { reports.push({ name: config.name, hero, snapshots }); await context.close(); continue; }
    const scenes = [];
    for (const id of ['lessons', 'coach', 'assessment', 'pricing', 'corporate', 'questions', 'book']) {
      const el = page.locator('#' + id);
      const layout = await el.evaluate(el => ({ top: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight }));
      await scroll(page, layout.top - config.height * 0.7, !config.noJS);
      const before = await el.evaluate(el => ({ state: el.dataset.scVerifyState, clip: getComputedStyle(el.querySelector('[data-sc-reveal]') || el).clipPath }));
      await scroll(page, layout.top - config.height * 0.1, !config.noJS);
      const after = await el.evaluate(el => ({ state: el.dataset.scVerifyState, clip: getComputedStyle(el.querySelector('[data-sc-reveal]') || el).clipPath, path: el.querySelector('.assessment-path-draw') ? getComputedStyle(el.querySelector('.assessment-path-draw')).strokeDashoffset : null, controlOpacity: [...el.querySelectorAll('a,button')].map(e => getComputedStyle(e).opacity) }));
      check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 1), config.name + ': ' + id + ' fits');
      if (!config.static) check(before.state !== after.state || id === 'book', config.name + ': ' + id + ' progresses');
      if (config.static && id === 'coach') check(after.clip === 'none', config.name + ': coach photograph unmasked');
      await page.screenshot({ path: `${output}/${config.name}-${id}.png` });
      scenes.push({ id, before, after });
    }
    if (!config.noJS) {
      await page.locator('#questions button').first().focus();
      await page.keyboard.press('Enter');
      check(await page.locator('#questions button').first().getAttribute('aria-expanded') === 'true', config.name + ': FAQ keyboard opens');
      await page.keyboard.press('Enter');
      await page.locator('#book .lesson-button').focus();
      // Native focus obeys the page's smooth-scroll preference. Wait for the
      // actual target, rather than reading halfway through that scroll.
      await page.waitForFunction(() => {
        const r = document.querySelector('#book .lesson-button').getBoundingClientRect();
        const header = document.querySelector('header').getBoundingClientRect();
        return r.top + r.height / 2 > header.bottom && r.top + r.height / 2 < innerHeight;
      }, null, { timeout: 2000 }).catch(() => {});
      const target = await page.locator('#book .lesson-button').evaluate(el => { const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { clickable: el === hit || el.contains(hit), bounds: r.toJSON(), hit: hit?.tagName + '.' + hit?.className }; });
      check(target.clickable, config.name + ': booking hit target ' + JSON.stringify(target));
    }
    const links = await page.locator('a[href*="wa.me"]').evaluateAll(els => els.map(el => el.href));
    check(links.length >= 13 && links.every(link => new URL(link).pathname === '/254116416105' && new URL(link).searchParams.get('text')), config.name + ': booking destinations preserved');
    check(await page.evaluate(() => [...document.images].every(img => img.complete && img.naturalWidth)), config.name + ': images loaded');
    reports.push({ name: config.name, hero, snapshots, scenes });
    await context.close();
  }
} catch (error) { errors.push(String(error)); }
finally { await browser.close(); }
await writeFile(output + '/report.json', JSON.stringify({ base, output, failures, errors, reports }, null, 2));
console.log(JSON.stringify({ output, failures, errors, configurations: reports.length }));
if (failures.length || errors.length) process.exitCode = 1;
