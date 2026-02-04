from __future__ import annotations

import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

from theme import build_theme_tokens, write_theme_files


def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv()

def _normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    return url


def _stabilize_page(page) -> None:
    stabilize_timeout = int(
        os.environ.get(
            "CAPTURE_STABILIZE_TIMEOUT_MS",
            os.environ.get("VISUAL_QA_STABILIZE_TIMEOUT_MS", "120000"),
        )
    )
    wait_until = os.environ.get(
        "CAPTURE_WAIT_UNTIL", os.environ.get("VISUAL_QA_WAIT_UNTIL", "load")
    )
    _dismiss_cookie_banner(page)
    _wait_for_site_ready(page, stabilize_timeout)
    hide_media = os.environ.get("CAPTURE_KEEP_MEDIA", "0") != "1"
    page.add_style_tag(
        content=(
            """
        * {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
          caret-color: transparent !important;
        }
        [id*="cookie"], [class*="cookie"], [class*="Cookie"],
        [id*="consent"], [class*="consent"], [class*="Consent"],
        [id*="gdpr"], [class*="gdpr"], [class*="GDPR"],
        [id*="onetrust"], [class*="onetrust"],
        [id*="intercom"], [class*="intercom"],
        [id*="drift"], [class*="drift"],
        [id*="chat"], [class*="chat"] { display: none !important; }
        """
            + ("video, iframe { visibility: hidden !important; }" if hide_media else "")
        )
    )
    page.evaluate(
        """
        async () => {
          if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
          }
        }
        """
    )
    try:
        page.wait_for_load_state(wait_until, timeout=stabilize_timeout)
    except Exception:
        pass
    _auto_scroll(page)
    try:
        page.wait_for_load_state(wait_until, timeout=stabilize_timeout)
    except Exception:
        pass
    page.wait_for_timeout(500)


def _dismiss_cookie_banner(page) -> None:
    accept_re = re.compile(r"accept all|accept|agree|allow|consent|同意|接受|允许|继续", re.I)
    try:
        page.get_by_role("button", name=accept_re).first.click(timeout=3000)
    except Exception:
        pass
    for frame in page.frames:
        try:
            frame.get_by_role("button", name=accept_re).first.click(timeout=1500)
            break
        except Exception:
            continue
    try:
        page.evaluate(
            """
            () => {
              const re = /accept all|accept|agree|allow|consent|同意|接受|允许|继续/i;
              const buttons = Array.from(document.querySelectorAll("button, [role='button'], a"));
              for (const el of buttons) {
                const text = (el.textContent || "").trim();
                if (re.test(text)) {
                  el.click();
                  break;
                }
              }
            }
            """
        )
    except Exception:
        pass


def _auto_scroll(page) -> None:
    try:
        page.evaluate(
            """
            async () => {
              const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
              const step = Math.max(300, Math.floor(window.innerHeight * 0.7));
              let lastHeight = 0;
              let stableRounds = 0;

              for (let round = 0; round < 6; round++) {
                const total = document.body.scrollHeight;
                for (let y = 0; y < total; y += step) {
                  window.scrollTo(0, y);
                  await sleep(220);
                }
                window.scrollTo(0, document.body.scrollHeight);
                await sleep(600);

                const newHeight = document.body.scrollHeight;
                if (newHeight === lastHeight) {
                  stableRounds += 1;
                } else {
                  stableRounds = 0;
                }
                lastHeight = newHeight;
                if (stableRounds >= 2) break;
              }

              const images = Array.from(document.images || []);
              if (images.length) {
                await Promise.race([
                  Promise.all(
                    images.map((img) =>
                      img.complete ? Promise.resolve() : new Promise((r) => img.addEventListener("load", r, { once: true }))
                    )
                  ),
                  sleep(1500),
                ]);
              } else {
                await sleep(300);
              }
              window.scrollTo(0, 0);
            }
            """
        )
    except Exception:
        pass


def _wait_for_site_ready(page, timeout_ms: int) -> None:
    host = urlparse(page.url).netloc
    if "kymetacorp.com" in host:
        try:
            page.wait_for_selector("main section", timeout=timeout_ms)
            page.wait_for_selector("footer", timeout=timeout_ms)
        except Exception:
            pass


def _extract_style_samples(page) -> dict:
    return page.evaluate(
        """
        () => {
          const getStyles = (selector) => {
            const el = document.querySelector(selector);
            if (!el) return {};
            const styles = getComputedStyle(el);
            return {
              color: styles.color,
              background: styles.backgroundColor,
              font: styles.fontFamily,
              borderRadius: styles.borderRadius,
              borderColor: styles.borderColor,
            };
          };

          const body = getStyles('body');
          const heading = getStyles('h1');
          const link = getStyles('a');
          const button = getStyles('button, a[role="button"], input[type="submit"], .btn');
          const card = getStyles('[class*="card"], [class*="panel"], [class*="shadow"]');

          const root = getComputedStyle(document.documentElement);
          const rootVars = {};
          for (let i = 0; i < root.length; i++) {
            const name = root[i];
            if (name && name.startsWith('--')) {
              const value = root.getPropertyValue(name).trim();
              if (value) {
                rootVars[name] = value;
              }
            }
          }

          const detectFramework = () => {
            const refs = Array.from(document.querySelectorAll('link[rel="stylesheet"], script[src]'))
              .map((el) => (el.getAttribute('href') || el.getAttribute('src') || '').toLowerCase())
              .filter(Boolean);
            const hasRef = (needle) => refs.some((ref) => ref.includes(needle));
            const scores = { tailwind: 0, bootstrap: 0, bulma: 0, foundation: 0 };

            if (hasRef('tailwind')) scores.tailwind += 2;
            if (hasRef('bootstrap')) scores.bootstrap += 2;
            if (hasRef('bulma')) scores.bulma += 2;
            if (hasRef('foundation')) scores.foundation += 2;

            const classEls = Array.from(document.querySelectorAll('[class]')).slice(0, 600);
            const twRe = /(^|\\s)([a-z]{1,3}:)?(bg|text|px|py|pt|pb|pl|pr|m|mt|mb|ml|mr|grid|flex|gap|rounded|shadow|ring|border)(-|\\b)/;
            const bsRe = /(^|\\s)(container(-fluid)?|row|col(-[a-z0-9]+)?|btn|navbar|alert|card|modal|dropdown)(\\s|$)/;
            const bulmaRe = /(^|\\s)(columns|column|button|navbar|hero|section|tile|box|notification)(\\s|$)/;
            const foundationRe = /(^|\\s)(grid-x|cell|callout|button|top-bar)(\\s|$)/;
            for (const el of classEls) {
              const cls = (el.getAttribute('class') || '').toLowerCase();
              if (!cls) continue;
              if (twRe.test(cls)) scores.tailwind += 1;
              if (bsRe.test(cls)) scores.bootstrap += 1;
              if (bulmaRe.test(cls)) scores.bulma += 1;
              if (foundationRe.test(cls)) scores.foundation += 1;
            }

            const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
            if (!entries.length || entries[0][1] < 2) {
              return 'custom';
            }
            return entries[0][0];
          };

          return {
            body_color: body.color,
            body_bg: body.background,
            body_font: body.font,
            heading_font: heading.font,
            link_color: link.color,
            button_color: button.color,
            button_bg: button.background,
            button_radius: button.borderRadius,
            border_color: body.borderColor || card.borderColor,
            card_bg: card.background,
            root_vars: rootVars,
            framework: detectFramework(),
          };
        }
        """
    )


def _extract_section_boxes(page) -> list[dict]:
    return page.evaluate(
        """
        () => {
          const selectors = [
            'header',
            'main > *',
            'main section',
            'footer',
            '[data-section]',
            '[data-block]',
            '[class*="section"]',
            '[class*="block"]',
          ];
          const candidates = [];
          const seen = new Set();
          const viewportWidth = window.innerWidth || 1440;
          const pushEl = (el) => {
            if (!el || seen.has(el)) return;
            seen.add(el);
            const rect = el.getBoundingClientRect();
            if (rect.height < 60 || rect.width < Math.min(320, viewportWidth * 0.4)) return;
            if (rect.width < viewportWidth * 0.5) return;
            candidates.push({
              el,
              rect,
            });
          };
          selectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => pushEl(el));
          });
          const iou = (a, b) => {
            const x1 = Math.max(a.left, b.left);
            const y1 = Math.max(a.top, b.top);
            const x2 = Math.min(a.right, b.right);
            const y2 = Math.min(a.bottom, b.bottom);
            const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
            const areaA = (a.right - a.left) * (a.bottom - a.top);
            const areaB = (b.right - b.left) * (b.bottom - b.top);
            const denom = areaA + areaB - inter;
            return denom > 0 ? inter / denom : 0;
          };
          const filtered = [];
          candidates
            .sort((a, b) => (a.rect.top - b.rect.top) || (b.rect.height - a.rect.height))
            .forEach((item) => {
              const rect = item.rect;
              const dup = filtered.find((f) => iou(f.rect, rect) > 0.85);
              if (!dup) filtered.push(item);
            });
          return filtered.map((item) => ({
            tag: item.el.tagName.toLowerCase(),
            id: item.el.id || null,
            className: item.el.className || null,
            top: item.rect.top + window.scrollY,
            left: item.rect.left,
            width: item.rect.width,
            height: item.rect.height,
          }));
        }
        """
    )


def _extract_section_payloads(page) -> list[dict]:
    return page.evaluate(
        """
        () => {
          const selectors = [
            'header',
            'main > *',
            'main section',
            'footer',
            '[data-section]',
            '[data-block]',
            '[class*="section"]',
            '[class*="block"]',
          ];
          const payloads = [];
          const candidates = [];
          const seen = new Set();
          const viewportWidth = window.innerWidth || 1440;
          const pushEl = (el) => {
            if (!el || seen.has(el)) return;
            seen.add(el);
            const rect = el.getBoundingClientRect();
            if (rect.height < 60 || rect.width < Math.min(320, viewportWidth * 0.4)) return;
            if (rect.width < viewportWidth * 0.5) return;
            candidates.push({ el, rect });
          };
          selectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => pushEl(el));
          });
          const iou = (a, b) => {
            const x1 = Math.max(a.left, b.left);
            const y1 = Math.max(a.top, b.top);
            const x2 = Math.min(a.right, b.right);
            const y2 = Math.min(a.bottom, b.bottom);
            const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
            const areaA = (a.right - a.left) * (a.bottom - a.top);
            const areaB = (b.right - b.left) * (b.bottom - b.top);
            const denom = areaA + areaB - inter;
            return denom > 0 ? inter / denom : 0;
          };
          const filtered = [];
          candidates
            .sort((a, b) => (a.rect.top - b.rect.top) || (b.rect.height - a.rect.height))
            .forEach((item) => {
              const dup = filtered.find((f) => iou(f.rect, item.rect) > 0.85);
              if (!dup) filtered.push(item);
            });
          const MAX_STYLE_NODES = 80;
          const textOf = (el) => (el && el.textContent ? el.textContent.trim() : '');
          const stylePick = (styles) => ({
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            letterSpacing: styles.letterSpacing,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            borderRadius: styles.borderRadius,
            padding: styles.padding,
            margin: styles.margin,
            textAlign: styles.textAlign,
            display: styles.display,
          });
          const normalizeColor = (value) => {
            if (!value) return '';
            if (value === 'rgba(0, 0, 0, 0)' || value === 'transparent') return '';
            return value;
          };
          const addCount = (map, key) => {
            if (!key) return;
            map[key] = (map[key] || 0) + 1;
          };
          const topEntries = (map, limit = 5) =>
            Object.entries(map)
              .sort((a, b) => b[1] - a[1])
              .slice(0, limit)
              .map(([value, count]) => ({ value, count }));
          const collectComputed = (root) => {
            const nodes = Array.from(
              root.querySelectorAll('h1, h2, h3, p, li, a, button, img, video, input, textarea, select')
            );
            const out = [];
            const fontCount = {};
            const colorCount = {};
            const bgCount = {};
            const radiusCount = {};
            const paddingCount = {};
            const marginCount = {};
            const sizeCount = {};
            for (const node of nodes) {
              if (out.length >= MAX_STYLE_NODES) break;
              const rect = node.getBoundingClientRect();
              if (rect.width < 8 || rect.height < 8) continue;
              const styles = getComputedStyle(node);
              const picked = stylePick(styles);
              addCount(fontCount, picked.fontFamily);
              addCount(colorCount, normalizeColor(picked.color));
              addCount(bgCount, normalizeColor(picked.backgroundColor));
              addCount(radiusCount, picked.borderRadius);
              addCount(paddingCount, picked.padding);
              addCount(marginCount, picked.margin);
              addCount(sizeCount, picked.fontSize);
              out.push({
                tag: node.tagName.toLowerCase(),
                role: node.getAttribute && node.getAttribute('role') ? node.getAttribute('role') : '',
                text: textOf(node).slice(0, 120),
                className: node.className || '',
                id: node.id || '',
                bbox: {
                  x: Math.round(rect.x),
                  y: Math.round(rect.y + window.scrollY),
                  w: Math.round(rect.width),
                  h: Math.round(rect.height),
                },
                styles: picked,
              });
            }
            return {
              nodes: out,
              summary: {
                fonts: topEntries(fontCount),
                textColors: topEntries(colorCount),
                bgColors: topEntries(bgCount),
                radius: topEntries(radiusCount),
                padding: topEntries(paddingCount),
                margin: topEntries(marginCount),
                fontSizes: topEntries(sizeCount),
              },
            };
          };
          const atomsFrom = (root) => {
            const nodes = Array.from(
              root.querySelectorAll('h1, h2, h3, p, li, a, button, img, video, input, textarea, select')
            );
            const atoms = [];
            for (const node of nodes) {
              if (atoms.length >= 60) break;
              const rect = node.getBoundingClientRect();
              if (rect.width < 8 || rect.height < 8) continue;
              const tag = node.tagName.toLowerCase();
              let kind = 'text';
              if (tag === 'h1' || tag === 'h2' || tag === 'h3') kind = 'heading';
              if (tag === 'a') kind = 'link';
              if (tag === 'button') kind = 'button';
              if (tag === 'input' || tag === 'textarea' || tag === 'select') kind = 'input';
              if (tag === 'img') kind = 'image';
              if (tag === 'video') kind = 'video';
              const styles = getComputedStyle(node);
              atoms.push({
                kind,
                tag,
                text: textOf(node).slice(0, 140),
                placeholder: (tag === 'input' || tag === 'textarea') ? (node.getAttribute('placeholder') || '') : '',
                inputType: tag === 'input' ? (node.getAttribute('type') || '') : '',
                href: tag === 'a' ? node.getAttribute('href') || '' : '',
                src: tag === 'img' || tag === 'video' ? node.getAttribute('src') || '' : '',
                bbox: {
                  x: Math.round(rect.x),
                  y: Math.round(rect.y + window.scrollY),
                  w: Math.round(rect.width),
                  h: Math.round(rect.height),
                },
                styles: stylePick(styles),
              });
            }
            return atoms;
          };
          const listText = (root) =>
            Array.from(root.querySelectorAll('ul, ol')).map((list) =>
              Array.from(list.querySelectorAll('li'))
                .map((li) => textOf(li))
                .filter(Boolean)
            ).filter((items) => items.length > 0);
          const images = (root) =>
            (() => {
              const firstSrcFromSrcset = (value) => {
                if (!value) return '';
                const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
                for (const p of parts) {
                  const url = p.split(/\\s+/)[0];
                  if (url) return url;
                }
                return '';
              };
              const resolveImgSrc = (img) => {
                let src = img.getAttribute('src') || '';
                if (!src) {
                  const candidates = [
                    img.getAttribute('data-src'),
                    img.getAttribute('data-original'),
                    img.getAttribute('data-lazy-src'),
                    img.getAttribute('data-image'),
                    img.getAttribute('data-io-src'),
                  ];
                  for (const val of candidates) {
                    if (val && val.trim()) {
                      src = val.trim();
                      break;
                    }
                  }
                }
                if (!src) {
                  const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset') || '';
                  if (srcset) src = firstSrcFromSrcset(srcset);
                }
                return src;
              };
              const pictureImages = (root) => {
                const items = [];
                root.querySelectorAll('picture').forEach((pic) => {
                  let chosen = '';
                  const srcsets = Array.from(pic.querySelectorAll('source'))
                    .map((s) => s.getAttribute('srcset') || s.getAttribute('data-srcset') || '')
                    .filter(Boolean);
                  for (const s of srcsets) {
                    const candidate = firstSrcFromSrcset(s);
                    if (candidate) {
                      chosen = candidate;
                      break;
                    }
                  }
                  if (!chosen) {
                    const img = pic.querySelector('img');
                    if (img) {
                      const src = resolveImgSrc(img);
                      if (src) {
                        items.push({ src, alt: img.getAttribute('alt') || '' });
                      }
                    }
                  } else {
                    const img = pic.querySelector('img');
                    items.push({ src: chosen, alt: img ? img.getAttribute('alt') || '' : '' });
                  }
                });
                return items;
              };
              const base = Array.from(root.querySelectorAll('img'))
                .map((img) => {
                  const src = resolveImgSrc(img);
                  return { src, alt: img.getAttribute('alt') || '' };
                })
                .filter((item) => item.src);
              return [...base, ...pictureImages(root)];
            })();
          const backgroundUrls = (root) => {
            const urls = [];
            const gradients = [];
            const collectFromStyle = (bg) => {
              if (!bg || bg === 'none') return;
              if (/gradient\\(/i.test(bg) && !gradients.includes(bg)) {
                gradients.push(bg);
              }
              const matches = Array.from(bg.matchAll(/url\\(["']?([^"')]+)["']?\\)/g)).map(
                (m) => m[1]
              );
              matches.forEach((u) => {
                if (u && !urls.includes(u)) urls.push(u);
              });
            };
            const addFrom = (el) => {
              collectFromStyle(getComputedStyle(el).backgroundImage);
              try {
                collectFromStyle(getComputedStyle(el, '::before').backgroundImage);
                collectFromStyle(getComputedStyle(el, '::after').backgroundImage);
              } catch (error) {
                // ignore pseudo-element failures
              }
              ['data-bg', 'data-background', 'data-background-image'].forEach((name) => {
                const val = el.getAttribute && el.getAttribute(name) ? el.getAttribute(name) : '';
                if (val && !urls.includes(val)) urls.push(val);
              });
            };
            addFrom(root);
            const nodes = Array.from(root.querySelectorAll('*'));
            for (const node of nodes) {
              if (urls.length >= 6) break;
              addFrom(node);
            }
            return {
              backgrounds: urls.map((src) => ({ src, kind: 'background' })),
              gradients,
            };
          };
          const videos = (root) => {
            const items = [];
            root.querySelectorAll('video').forEach((video) => {
              let src = video.getAttribute('src') || '';
              if (!src) {
                src = video.getAttribute('data-src') || video.getAttribute('data-video') || '';
              }
              if (!src) {
                const source = video.querySelector('source');
                if (source) {
                  src =
                    source.getAttribute('src') ||
                    source.getAttribute('data-src') ||
                    source.getAttribute('data-video') ||
                    '';
                }
              }
              if (src) {
                items.push({
                  src,
                  poster: video.getAttribute('poster') || '',
                  kind: 'video',
                });
              }
            });
            root.querySelectorAll('iframe').forEach((iframe) => {
              const src =
                iframe.getAttribute('src') ||
                iframe.getAttribute('data-src') ||
                iframe.getAttribute('data-video') ||
                '';
              if (src && /youtube|vimeo|wistia/i.test(src)) {
                items.push({ src, poster: '', kind: 'iframe' });
              }
            });
            return items;
          };
          const links = (root) =>
            Array.from(root.querySelectorAll('a'))
              .map((a) => ({
                label: textOf(a),
                href: a.getAttribute('href') || '',
              }))
              .filter((item) => item.label || item.href);
          const buttons = (root) => {
            const btns = Array.from(
              root.querySelectorAll('button, a[role="button"], input[type="submit"], .btn, .button')
            ).map((el) => ({
              label: textOf(el),
              href: el.getAttribute && el.getAttribute('href') ? el.getAttribute('href') : '',
            }));
            return btns.filter((item) => item.label || item.href);
          };
          const texts = (root) =>
            Array.from(root.querySelectorAll('p, span'))
              .map((el) => textOf(el))
              .filter(Boolean);
          const headings = (root) =>
            Array.from(root.querySelectorAll('h1, h2, h3'))
              .map((el) => textOf(el))
              .filter(Boolean);
          const cardCount = (root) => {
            const selectors = [
              '[class*="card"]',
              '[class*="panel"]',
              '[class*="tile"]',
              '[class*="feature"]',
              '[class*="product"]',
              '[class*="profile"]',
              '[class*="team"]',
              '[class*="member"]',
              '[class*="person"]',
            ];
            const nodes = new Set();
            selectors.forEach((selector) => {
              root.querySelectorAll(selector).forEach((el) => nodes.add(el));
            });
            return nodes.size;
          };
          filtered.forEach((item) => {
              const el = item.el;
              const rect = item.rect;
              const title = headings(el)[0] || '';
              const textItems = texts(el);
              const lists = listText(el);
              const buttonItems = buttons(el);
              const linkItems = links(el).filter(
                (item) => !buttonItems.find((btn) => btn.label === item.label && btn.href === item.href)
              );
              const imageItems = images(el);
              const bgResult = backgroundUrls(el);
              const backgroundItems = bgResult.backgrounds;
              const backgroundGradients = bgResult.gradients;
              const videoItems = videos(el);
              const computedStyles = collectComputed(el);
              const atoms = atomsFrom(el);
              const textValue = [title, ...textItems].join(' ').trim();
              payloads.push({
                title,
                texts: textItems,
                buttons: buttonItems,
                links: linkItems,
                lists,
                prices: [],
                images: imageItems,
                videos: videoItems,
                backgrounds: backgroundItems,
                background_gradients: backgroundGradients,
                text: textValue,
                content: {
                  headings: headings(el),
                  texts: textItems,
                  buttons: buttonItems,
                  links: linkItems,
                  lists,
                  images: imageItems,
                  videos: videoItems,
                  backgrounds: backgroundItems,
                  background_gradients: backgroundGradients,
                  prices: [],
                },
                computed_styles: computedStyles,
                atoms,
                metrics: {
                  title_len: title.length,
                  text_len: textValue.length,
                  text_count: textItems.length,
                  list_count: lists.length,
                  list_items: lists.reduce((sum, items) => sum + items.length, 0),
                  button_count: buttonItems.length,
                  link_count: linkItems.length,
                  image_count: imageItems.length,
                  video_count: videoItems.length,
                  background_count: backgroundItems.length,
                  card_count: cardCount(el),
                },
              });
          });
          return payloads;
        }
        """
    )


def _slugify(value: str) -> str:
    return value.replace("/", "-").replace("?", "-").replace("#", "-").strip("-")


def capture_site(url: str, output_root: Path, page_slug: str | None = None) -> dict:
    url = _normalize_url(url)
    domain = urlparse(url).netloc or url.replace("https://", "").split("/")[0]
    if not page_slug:
        page_slug = _slugify(urlparse(url).path or "home")
        page_slug = page_slug or "home"
    site_dir = output_root / domain
    capture_dir = site_dir / "capture" / page_slug
    capture_dir.mkdir(parents=True, exist_ok=True)

    screenshot_path = capture_dir / "full.png"
    dom_path = capture_dir / "dom.json"
    sections_path = capture_dir / "sections.json"
    groups_path = capture_dir / "section_groups.json"
    atoms_path = capture_dir / "atoms.json"
    theme_dir = site_dir / "theme"

    timeout_ms = int(os.environ.get("CAPTURE_TIMEOUT_MS", "120000"))
    wait_until = os.environ.get("CAPTURE_WAIT_UNTIL", "load")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        page.goto(url, wait_until=wait_until, timeout=timeout_ms)
        _stabilize_page(page)
        page.screenshot(path=str(screenshot_path), full_page=True)
        html = page.content()
        samples = _extract_style_samples(page)
        sections = _extract_section_boxes(page)
        section_payloads = _extract_section_payloads(page)
        viewport = page.viewport_size or {"width": 1440, "height": 900}
        page_height = page.evaluate("() => document.body.scrollHeight")
        section_images = []
        section_dir = capture_dir / "sections"
        section_dir.mkdir(parents=True, exist_ok=True)
        for index, section in enumerate(sections):
            clip = {
                "x": max(section["left"], 0),
                "y": max(section["top"], 0),
                "width": max(section["width"], 1),
                "height": max(section["height"], 1),
            }
            section_path = section_dir / f"section-{index:02d}.png"
            try:
                page.screenshot(path=str(section_path), clip=clip)
                section_images.append(str(section_path))
            except Exception:
                continue
        browser.close()

    dom_path.write_text(
        json.dumps({"url": url, "html": html}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    sections_path.write_text(
        json.dumps(
            {
                "url": url,
                "sections": sections,
                "section_payloads": section_payloads,
                "screenshots": section_images,
                "viewport": viewport,
                "page_height": page_height,
                "style_samples": {
                    "root_vars": samples.get("root_vars") if isinstance(samples, dict) else {},
                    "framework": samples.get("framework") if isinstance(samples, dict) else "custom",
                },
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    def _infer_layout_type(payload: dict) -> str:
        computed = payload.get("computed_styles") or {}
        nodes = computed.get("nodes") if isinstance(computed, dict) else []
        if not isinstance(nodes, list) or len(nodes) < 3:
            return "stack"
        xs = []
        ys = []
        widths = []
        heights = []
        interactive_nodes = 0
        for node in nodes:
            if not isinstance(node, dict):
                continue
            bbox = node.get("bbox") or {}
            try:
                x = float(bbox.get("x", 0))
                y = float(bbox.get("y", 0))
                w = float(bbox.get("w", 0))
                h = float(bbox.get("h", 0))
            except Exception:
                continue
            if w <= 0 or h <= 0:
                continue
            xs.append(x + w / 2)
            ys.append(y + h / 2)
            widths.append(w)
            heights.append(h)
            tag = str(node.get("tag") or "").lower()
            role = str(node.get("role") or "").lower()
            if tag in {"a", "button"} or role == "button":
                interactive_nodes += 1
        if not xs:
            return "stack"
        min_x, max_x = min(xs), max(xs)
        span_x = max_x - min_x
        if span_x <= 0:
            return "stack"
        # simple clustering into left/right columns
        mid = min_x + span_x * 0.5
        left = [x for x in xs if x < mid]
        right = [x for x in xs if x >= mid]
        if left and right and (len(left) + len(right)) >= 6:
            return "split"
        # grid if many nodes share similar widths and spread in x/y
        if len(xs) >= 6:
            unique_cols = len({round(x / 80) for x in xs})
            unique_rows = len({round(y / 80) for y in ys})
            if unique_cols >= 2 and unique_rows >= 2:
                return "grid"
        # overlap heuristic: many nodes with similar centers
        if len(xs) >= 6:
            center_bins = len({(round(x / 30), round(y / 30)) for x, y in zip(xs, ys)})
            if center_bins < len(xs) * 0.5:
                return "overlap"
        return "stack"

    def _interaction_hotspots(payload: dict) -> list[dict]:
        computed = payload.get("computed_styles") or {}
        nodes = computed.get("nodes") if isinstance(computed, dict) else []
        hotspots: list[dict] = []
        for node in nodes if isinstance(nodes, list) else []:
            if not isinstance(node, dict):
                continue
            tag = str(node.get("tag") or "").lower()
            role = str(node.get("role") or "").lower()
            if tag not in {"a", "button"} and role != "button":
                continue
            bbox = node.get("bbox") or {}
            if not isinstance(bbox, dict):
                continue
            hotspots.append(
                {
                    "tag": tag,
                    "role": role,
                    "text": node.get("text") or "",
                    "bbox": bbox,
                }
            )
        return hotspots

    groups_payload = []
    sorted_sections = sorted(
        [(idx, s) for idx, s in enumerate(sections)],
        key=lambda item: float(item[1].get("top", 0) or 0),
    )
    current_group: list[int] = []
    last_bottom = None
    for idx, section in sorted_sections:
        top = float(section.get("top", 0) or 0)
        height = float(section.get("height", 0) or 0)
        if last_bottom is not None and top - last_bottom > 140:
            if current_group:
                groups_payload.append({"indices": current_group})
            current_group = []
        current_group.append(idx)
        last_bottom = max(last_bottom or 0, top + height)
    if current_group:
        groups_payload.append({"indices": current_group})
    enriched_groups = []
    for group in groups_payload:
        indices = group.get("indices") or []
        group_items = []
        for idx in indices:
            payload = section_payloads[idx] if idx < len(section_payloads) else {}
            layout_type = _infer_layout_type(payload) if isinstance(payload, dict) else "stack"
            hotspots = _interaction_hotspots(payload) if isinstance(payload, dict) else []
            group_items.append(
                {
                    "index": idx,
                    "title": payload.get("title") if isinstance(payload, dict) else "",
                    "layout_type": layout_type,
                    "interaction_hotspots": hotspots,
                }
            )
        enriched_groups.append({"indices": indices, "sections": group_items})
    groups_path.write_text(
        json.dumps(
            {
                "url": url,
                "groups": enriched_groups,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    atoms_payload = []
    for idx, payload in enumerate(section_payloads):
        if not isinstance(payload, dict):
            continue
        atoms_payload.append(
            {
                "index": idx,
                "title": payload.get("title") or "",
                "atoms": payload.get("atoms") or [],
                "computed_styles": payload.get("computed_styles", {}).get("summary", {}),
            }
        )
    atoms_path.write_text(
        json.dumps({"url": url, "sections": atoms_payload}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    computed_fonts: dict[str, int] = {}
    computed_text_colors: dict[str, int] = {}
    computed_bg_colors: dict[str, int] = {}
    computed_radius: dict[str, int] = {}
    computed_font_sizes: dict[str, int] = {}
    computed_padding: dict[str, int] = {}
    computed_margin: dict[str, int] = {}

    def add_counts(bucket: dict[str, int], entries: list[dict] | None) -> None:
        if not isinstance(entries, list):
            return
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            value = entry.get("value")
            count = entry.get("count") or 0
            if not value or not isinstance(count, int):
                continue
            bucket[value] = bucket.get(value, 0) + count

    for payload in section_payloads:
        if not isinstance(payload, dict):
            continue
        summary = (payload.get("computed_styles") or {}).get("summary") or {}
        add_counts(computed_fonts, summary.get("fonts"))
        add_counts(computed_text_colors, summary.get("textColors"))
        add_counts(computed_bg_colors, summary.get("bgColors"))
        add_counts(computed_radius, summary.get("radius"))
        add_counts(computed_font_sizes, summary.get("fontSizes"))
        add_counts(computed_padding, summary.get("padding"))
        add_counts(computed_margin, summary.get("margin"))

    samples["computed_fonts"] = computed_fonts
    samples["computed_text_colors"] = computed_text_colors
    samples["computed_bg_colors"] = computed_bg_colors
    samples["computed_radius"] = computed_radius
    samples["computed_font_sizes"] = computed_font_sizes
    samples["computed_padding"] = computed_padding
    samples["computed_margin"] = computed_margin

    tokens = build_theme_tokens(samples)
    tokens_path, theme_path, theme_json_path = write_theme_files(tokens, theme_dir)

    return {
        "url": url,
        "domain": domain,
        "screenshot": str(screenshot_path),
        "dom": str(dom_path),
        "sections": str(sections_path),
        "atoms": str(atoms_path),
        "tokens": str(tokens_path),
        "theme": str(theme_path),
        "theme_json": str(theme_json_path),
        "page_slug": page_slug,
    }
