#!/usr/bin/env python3
"""Check the launch table, the pins, and the pages generated from it."""

import hashlib
import json
import re
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

import build_pages

root = Path(__file__).resolve().parent
text = (root / "benchmarks.js").read_text()
start = text.index("{")
end = text.rindex("}")
bench = json.loads(text[start : end + 1])


def row(group_id, name):
    group = next(g for g in bench["groups"] if g["id"] == group_id)
    return next(r for r in group["rows"] if r["name"] == name)


def rounded_mean(values):
    total = sum((Decimal(str(v)) for v in values), Decimal("0"))
    average = total / Decimal(len(values))
    return float(average.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def check_mean(group_id, mean_name):
    group = next(g for g in bench["groups"] if g["id"] == group_id)
    parts = [r for r in group["rows"] if r["name"] != mean_name]
    published = row(group_id, mean_name)["scores"]
    for model in published:
        values = [r["scores"][model] for r in parts if r["scores"][model] is not None]
        expected = rounded_mean(values) if values else None
        if published[model] != expected:
            raise SystemExit(
                f"{group_id} {mean_name} {model} {published[model]} != mean {expected}"
            )


aa_talk = row("aa", "AA-AgentTalk")["scores"]
aa_earn = row("aa", "Earnings22-AA")["scores"]
aa_vox = row("aa", "VoxPopuli-AA")["scores"]
aa_index = row("aa", "AA-WER Index")["scores"]

expected = {
    "sov": round(0.50 * aa_talk["sov"] + 0.25 * aa_vox["sov"] + 0.25 * aa_earn["sov"], 2),
    "nemotron": round(
        0.50 * aa_talk["nemotron"] + 0.25 * aa_vox["nemotron"] + 0.25 * aa_earn["nemotron"], 2
    ),
    "voxtral": round(
        0.50 * aa_talk["voxtral"] + 0.25 * aa_vox["voxtral"] + 0.25 * aa_earn["voxtral"], 2
    ),
}

for model, value in expected.items():
    published = aa_index[model]
    if published != value:
        raise SystemExit(f"{model} index {published} != weighted {value}")

check_mean("en", "Public-set mean")
check_mean("multi", "Mean")

if bench["latency"] != [
    {"band": "Up to 10 s", "plain": 0.16, "draft": 0.09},
    {"band": "10–30 s", "plain": 0.44, "draft": 0.15},
    {"band": "30–60 s", "plain": 0.88, "draft": 0.31},
    {"band": "1–5 min", "plain": 2.78, "draft": 1.26},
]:
    raise SystemExit("latency table drifted")

source = bench["source"]
revision = source["revision"]
if not re.fullmatch(r"[0-9a-f]{40}", revision):
    raise SystemExit("source.revision is not a commit SHA")
image_path = root / source["image"]
digest = hashlib.sha256(image_path.read_bytes()).hexdigest()
if digest != source["imageSha256"]:
    raise SystemExit(f"benchmark image hash {digest} != {source['imageSha256']}")

og = (root / "assets/og.png").read_bytes()
if og[12:16] != b"IHDR":
    raise SystemExit("assets/og.png is not a PNG")
width = int.from_bytes(og[16:20], "big")
height = int.from_bytes(og[20:24], "big")
if (width, height) != (1200, 630):
    raise SystemExit(f"og.png is {width}x{height}, expected 1200x630")

notebook = json.loads((root / "notebooks/sov_transcribe_1.ipynb").read_text())
notebook_text = "\n".join("".join(cell["source"]) for cell in notebook["cells"])
prompt_block = re.search(r"PROMPTS = \{(.+?)\n\}", notebook_text, re.S)
if not prompt_block:
    raise SystemExit("notebook is missing PROMPTS")
notebook_prompts = re.findall(r':\s*"((?:\\.|[^"\\])*)"', prompt_block.group(1))
card_prompts = [p["text"] for p in bench["prompts"]]
if notebook_prompts != card_prompts:
    raise SystemExit("notebook prompts drifted from benchmarks.js")

if revision not in notebook_text:
    raise SystemExit("notebook is missing the model-card revision")
if "revision=MODEL_REVISION" not in notebook_text or "trust_remote_code=True" not in notebook_text:
    raise SystemExit("notebook must load remote code at the pinned revision")
if "transformers>=5.19,<5.23" not in notebook_text:
    raise SystemExit("notebook is missing the Transformers pin")
if "A sine tone, not speech, and not a transcript." not in notebook_text:
    raise SystemExit("notebook tone is no longer labeled as a tone")

pages = {
    "index.html": (root / "index.html").read_text(),
    "BLOG.md": (root / "BLOG.md").read_text(),
    "README.md": (root / "README.md").read_text(),
    "SOURCES.md": (root / "SOURCES.md").read_text(),
    "llms.txt": (root / "llms.txt").read_text(),
}
index = pages["index.html"]
blog = pages["BLOG.md"]

public_sov = row("en", "Public-set mean")["scores"]["sov"]
public_phrase = f"The public-set mean is {public_sov} for SOV."
if public_phrase not in index:
    raise SystemExit(f"index.html is missing {public_phrase!r}")
if "LibriSpeech" not in index or "LibriSpeech" not in blog:
    raise SystemExit("LibriSpeech caveat missing")

caveat = re.search(
    r"Against the card.s 4\.6 billion, twenty-four billion is about five times, not six\.",
    blog,
)
if not caveat or caveat.group(0) not in index:
    raise SystemExit("active-parameter caveat missing from the guide")

if revision not in index or revision not in pages["SOURCES.md"]:
    raise SystemExit("the model-card revision is missing from the guide or the sources")
if 'href="BLOG.md"' in index or 'href="SOURCES.md"' in index:
    raise SystemExit("the guide still links raw Markdown")
if "essay.html" not in index or "sources.html" not in index:
    raise SystemExit("the guide does not link the rendered essay and sources")

speed = (
    "Three experiments: the table is one-request latency, "
    "1,039 seconds of audio per second is batch throughput on that GPU, "
    "and 60× is the hosted endpoint."
)
if speed not in index:
    raise SystemExit("the three speed experiments are not named under the latency table")

colab = "Colab builds the request. It does not hold the weights."
for name in ("index.html", "README.md"):
    if colab not in pages[name]:
        raise SystemExit(f"{name} is missing the Colab limit")
if colab not in notebook_text:
    raise SystemExit("notebook is missing the Colab limit")

required = {
    "index.html": ["2.28", "76.33", "93.39", "4.88", "7.67", "3.67"],
    "BLOG.md": ["2.28", "76.33", "93.39", "4.88", "7.67", "5.44"],
    "README.md": ["2.28", "4.6B", "76.33", "93.39", "4.88", "7.67"],
    "llms.txt": ["2.28%", "4.6B", "76.33%", "93.39%", "4.88", "LibriSpeech"],
}
for name, snippets in required.items():
    for snippet in snippets:
        if snippet not in pages[name]:
            raise SystemExit(f"{name} is missing {snippet!r}")

for name, rendered in build_pages.expected_pages(root).items():
    actual = (root / name).read_text()
    if actual != rendered:
        raise SystemExit(f"{name} is stale. Run python3 build_pages.py")

print("AA-WER index matches the weighted cells.")
print(f"  SOV {expected['sov']}  Nemotron {expected['nemotron']}  Voxtral {expected['voxtral']}")
print("English and multilingual means match the cells in their groups.")
print("Prompt guide in the notebook matches benchmarks.js.")
print("DFlash latency table matches the pinned strings.")
print(f"Benchmark image matches revision {revision[:12]}.")
print("Rendered essay and sources match the Markdown.")
