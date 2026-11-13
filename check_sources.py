#!/usr/bin/env python3
"""Check the launch-table arithmetic baked into benchmarks.js."""

import json
from pathlib import Path

root = Path(__file__).resolve().parent
text = (root / "benchmarks.js").read_text()
start = text.index("{")
end = text.rindex("}")
bench = json.loads(text[start : end + 1])


def row(group_id, name):
    group = next(g for g in bench["groups"] if g["id"] == group_id)
    return next(r for r in group["rows"] if r["name"] == name)


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

prompts = [p["text"] for p in bench["prompts"]]
card = [
    "Transcribe the audio verbatim, outputting only spoken words in sequence.",
    "This audio may contain the following words or phrases: {keywords}. Transcribe the audio into text.",
    "Transcribe the audio verbatim in the language's standard writing system, using punctuation and capitalization. Output only the transcript.",
    "Transcribe the {language} audio into text, ensuring all punctuation marks are included.",
]
if prompts != card:
    raise SystemExit("prompt guide drifted from the model card")

if bench["latency"] != [
    {"band": "Up to 10 s", "plain": 0.16, "draft": 0.09},
    {"band": "10–30 s", "plain": 0.44, "draft": 0.15},
    {"band": "30–60 s", "plain": 0.88, "draft": 0.31},
    {"band": "1–5 min", "plain": 2.78, "draft": 1.26},
]:
    raise SystemExit("latency table drifted")

print("AA-WER index matches the weighted cells.")
print(f"  SOV {expected['sov']}  Nemotron {expected['nemotron']}  Voxtral {expected['voxtral']}")
print("Prompt guide and DFlash latency table match the pinned strings.")
