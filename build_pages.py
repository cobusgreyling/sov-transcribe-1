#!/usr/bin/env python3
"""Render BLOG.md and SOURCES.md to the pages GitHub Pages serves."""

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

_INLINE = re.compile(
    r"`([^`]+)`"
    r"|\[([^\]]+)\]\(([^)]+)\)"
    r"|<((?:https?://)[^>\s]+)>"
    r"|\*\*([^*]+)\*\*"
)


def inline(text):
    parts = []
    pos = 0
    for match in _INLINE.finditer(text):
        parts.append(html.escape(text[pos : match.start()]))
        if match.group(1) is not None:
            parts.append(f"<code>{html.escape(match.group(1))}</code>")
        elif match.group(2) is not None:
            url = html.escape(match.group(3), quote=True)
            parts.append(f'<a href="{url}">{html.escape(match.group(2))}</a>')
        elif match.group(4) is not None:
            url = html.escape(match.group(4), quote=True)
            parts.append(f'<a href="{url}">{url}</a>')
        else:
            parts.append(f"<strong>{html.escape(match.group(5))}</strong>")
        pos = match.end()
    parts.append(html.escape(text[pos:]))
    return "".join(parts)


def markdown_to_html(text):
    lines = text.splitlines()
    blocks = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("```"):
            fence = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                fence.append(lines[i])
                i += 1
            i += 1
            blocks.append("<pre><code>" + html.escape("\n".join(fence)) + "</code></pre>")
            continue
        if line.startswith("# "):
            blocks.append(f"<h1>{inline(line[2:].strip())}</h1>")
            i += 1
            continue
        if line.startswith("## "):
            blocks.append(f"<h2>{inline(line[3:].strip())}</h2>")
            i += 1
            continue
        if line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(f"<li>{inline(lines[i][2:].strip())}</li>")
                i += 1
            blocks.append("<ul>\n" + "\n".join(items) + "\n</ul>")
            continue
        if not line.strip():
            i += 1
            continue
        para = [line.strip()]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(("#", "- ", "```")):
            para.append(lines[i].strip())
            i += 1
        blocks.append(f"<p>{inline(' '.join(para))}</p>")
    return "\n".join(blocks)


def _plain(text):
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"<((?:https?://)[^>]+)>", r"\1", text)
    return text.replace("**", "")


def description(markdown):
    for line in markdown.splitlines():
        if line.startswith("#") or not line.strip() or line.startswith(("- ", "```")):
            continue
        return _plain(line.strip())
    return "SOV-Transcribe-1 field guide"


def title_of(markdown):
    for line in markdown.splitlines():
        if line.startswith("# "):
            return _plain(line[2:].strip())
    return "SOV-Transcribe-1"


def page(markdown, source_name):
    body = markdown_to_html(markdown)
    title = title_of(markdown)
    desc = description(markdown)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(title)} — SOV-Transcribe-1</title>
  <meta name="description" content="{html.escape(desc, quote=True)}" />
  <meta property="og:title" content="{html.escape(title, quote=True)}" />
  <meta property="og:description" content="{html.escape(desc, quote=True)}" />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="https://cobusgreyling.github.io/sov-transcribe-1/assets/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,560&family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- Generated from {html.escape(source_name)} by build_pages.py. Edit the Markdown, then rerun it. -->
  <nav class="nav">
    <a class="brand" href="index.html">SOV <span>Transcribe-1</span></a>
    <div class="nav-links">
      <a href="index.html">Guide</a>
      <a href="essay.html">Essay</a>
      <a href="sources.html">Sources</a>
    </div>
  </nav>
  <main class="wrap prose">
    <p class="sub"><a href="index.html">The guide</a></p>
{body}
    <footer>
      Field guide by Cobus Greyling, 13 November 2026. Lab notes in this repository are Apache-2.0. The Salesforce weights are Apache-2.0 and are not vendored here.
    </footer>
  </main>
</body>
</html>
"""


def expected_pages(root=ROOT):
    return {
        "essay.html": page((root / "BLOG.md").read_text(), "BLOG.md"),
        "sources.html": page((root / "SOURCES.md").read_text(), "SOURCES.md"),
    }


def write_pages(root=ROOT):
    for name, text in expected_pages(root).items():
        (root / name).write_text(text)
        print(f"wrote {name}")


if __name__ == "__main__":
    write_pages()
