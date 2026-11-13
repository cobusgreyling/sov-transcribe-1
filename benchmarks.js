/* Salesforce launch table, transcribed from assets/benchmark-table.png.
   That file is the model-card image at the revision in source.revision.
   Null means the cell was a dash. Ranks are kept beside the index, not inside scores. */
window.BENCH = {
  "asOf": "2026-11-12",
  "checked": "2026-11-13",
  "source": {
    "repo": "salesforce-sovereign-intelligence/SOV-Transcribe-1",
    "revision": "505d8fae243924c0d8acdc622f7f0abab344eba3",
    "image": "assets/benchmark-table.png",
    "imageSha256": "45e3b6a5a095a83d77370fa1e90e9dc2317a32041bace313f7b6913e1c9e1840",
    "retrieved": "2026-11-13"
  },
  "models": [
    {"id": "sov", "name": "SOV-Transcribe-1", "short": "SOV"},
    {"id": "nemotron", "name": "Nemotron 3.5 Transcribe", "short": "Nemotron"},
    {"id": "qwen", "name": "Qwen3-ASR 1.7B", "short": "Qwen"},
    {"id": "granite", "name": "Granite Speech 5.0 2B", "short": "Granite"},
    {"id": "voxtral", "name": "Voxtral Small 24B", "short": "Voxtral"}
  ],
  "ranks": {
    "sov": {"open": 1, "overall": 7},
    "nemotron": {"open": 3, "overall": 14},
    "voxtral": {"open": 2, "overall": 13}
  },
  "groups": [
    {
      "id": "aa",
      "title": "Artificial Analysis",
      "unit": "WER %",
      "rows": [
        {"name": "AA-AgentTalk", "better": "low", "scores": {"sov": 1.78, "nemotron": 1.78, "qwen": null, "granite": null, "voxtral": 2.27}},
        {"name": "Earnings22-AA", "better": "low", "scores": {"sov": 4.06, "nemotron": 5.69, "qwen": null, "granite": null, "voxtral": 4.78}},
        {"name": "VoxPopuli-AA", "better": "low", "scores": {"sov": 1.50, "nemotron": 1.99, "qwen": null, "granite": null, "voxtral": 1.75}},
        {"name": "AA-WER Index", "better": "low", "scores": {"sov": 2.28, "nemotron": 2.81, "qwen": null, "granite": null, "voxtral": 2.77}}
      ]
    },
    {
      "id": "vcb",
      "title": "VoiceCodeBench (BeSimple)",
      "unit": "mixed",
      "rows": [
        {"name": "Canonical token / entity match", "better": "high", "unit": "%", "scores": {"sov": 93.39, "nemotron": 89.34, "qwen": null, "granite": null, "voxtral": null}},
        {"name": "Task success rate", "better": "high", "unit": "%", "scores": {"sov": 76.33, "nemotron": 62.67, "qwen": null, "granite": null, "voxtral": null}},
        {"name": "WER", "better": "low", "unit": "%", "scores": {"sov": 5.01, "nemotron": 5.44, "qwen": null, "granite": null, "voxtral": null}}
      ]
    },
    {
      "id": "en",
      "title": "Open ASR, English short form",
      "unit": "WER %",
      "rows": [
        {"name": "AMI", "better": "low", "scores": {"sov": 8.15, "nemotron": 7.78, "qwen": 8.31, "granite": 6.96, "voxtral": 13.25}},
        {"name": "Earnings22 (Open ASR subset)", "better": "low", "scores": {"sov": 5.52, "nemotron": 5.25, "qwen": 5.84, "granite": 6.22, "voxtral": 7.07}},
        {"name": "GigaSpeech", "better": "low", "scores": {"sov": 7.16, "nemotron": 7.18, "qwen": 7.22, "granite": 8.14, "voxtral": 8.32}},
        {"name": "Monsoon, English (India)", "better": "low", "scores": {"sov": 2.93, "nemotron": 3.63, "qwen": 3.50, "granite": 3.94, "voxtral": 3.49}},
        {"name": "SPGISpeech", "better": "low", "scores": {"sov": 2.41, "nemotron": 1.91, "qwen": 2.57, "granite": 3.36, "voxtral": 1.84}},
        {"name": "URGENT24", "better": "low", "scores": {"sov": 10.47, "nemotron": 10.94, "qwen": 9.93, "granite": 10.22, "voxtral": 12.34}},
        {"name": "VoxPopuli (Open ASR subset)", "better": "low", "scores": {"sov": 1.46, "nemotron": 1.89, "qwen": 2.85, "granite": 3.52, "voxtral": 2.00}},
        {"name": "Public-set mean", "better": "low", "scores": {"sov": 5.44, "nemotron": 5.51, "qwen": 5.75, "granite": 6.05, "voxtral": 6.90}}
      ]
    },
    {
      "id": "multi",
      "title": "Open ASR, multilingual",
      "unit": "WER %",
      "rows": [
        {"name": "German", "better": "low", "scores": {"sov": 4.05, "nemotron": 2.79, "qwen": 3.88, "granite": null, "voxtral": 2.58}},
        {"name": "French", "better": "low", "scores": {"sov": 5.19, "nemotron": 3.96, "qwen": 5.63, "granite": null, "voxtral": 3.91}},
        {"name": "Italian", "better": "low", "scores": {"sov": 4.37, "nemotron": 3.68, "qwen": 5.42, "granite": null, "voxtral": 3.42}},
        {"name": "Spanish", "better": "low", "scores": {"sov": 3.43, "nemotron": 2.82, "qwen": 3.70, "granite": null, "voxtral": 2.60}},
        {"name": "Portuguese", "better": "low", "scores": {"sov": 4.59, "nemotron": 4.08, "qwen": 6.16, "granite": null, "voxtral": 3.77}},
        {"name": "Dutch", "better": "low", "scores": {"sov": 7.67, "nemotron": 5.88, "qwen": 7.89, "granite": null, "voxtral": 4.04}},
        {"name": "Mean", "better": "low", "scores": {"sov": 4.88, "nemotron": 3.87, "qwen": 5.45, "granite": null, "voxtral": 3.39}}
      ]
    },
    {
      "id": "accent",
      "title": "Accents",
      "unit": "WER %",
      "rows": [
        {"name": "AppTek call-center, 14-accent mean", "better": "low", "scores": {"sov": 8.21, "nemotron": 8.44, "qwen": 8.42, "granite": 13.49, "voxtral": 13.75}}
      ]
    },
    {
      "id": "context",
      "title": "ContextASR-Bench",
      "unit": "WER %",
      "rows": [
        {"name": "No context", "better": "low", "scores": {"sov": 7.03, "nemotron": 3.34, "qwen": 2.92, "granite": 11.34, "voxtral": null}},
        {"name": "Coarse context", "better": "low", "scores": {"sov": 7.10, "nemotron": 3.34, "qwen": 2.91, "granite": 12.42, "voxtral": null}},
        {"name": "Fine context", "better": "low", "scores": {"sov": 3.67, "nemotron": 1.71, "qwen": 1.53, "granite": 10.02, "voxtral": null}}
      ]
    },
    {
      "id": "earn",
      "title": "Contextual Earnings-22",
      "unit": "WER %",
      "rows": [
        {"name": "No keyword list", "better": "low", "scores": {"sov": 12.42, "nemotron": 12.98, "qwen": 11.86, "granite": 12.69, "voxtral": null}},
        {"name": "Local keyword list", "better": "low", "scores": {"sov": 9.73, "nemotron": 10.00, "qwen": 9.19, "granite": 12.04, "voxtral": null}},
        {"name": "Global keyword list", "better": "low", "scores": {"sov": 9.98, "nemotron": 10.69, "qwen": 10.18, "granite": 12.01, "voxtral": null}}
      ]
    },
    {
      "id": "pref",
      "title": "Preference-ASR",
      "unit": "preference-aware WER %",
      "rows": [
        {"name": "No instructions", "better": "low", "scores": {"sov": 5.72, "nemotron": 7.56, "qwen": 6.48, "granite": 6.49, "voxtral": null}},
        {"name": "With instructions", "better": "low", "scores": {"sov": 5.05, "nemotron": 6.16, "qwen": 5.96, "granite": 4.70, "voxtral": null}}
      ]
    },
    {
      "id": "robust",
      "title": "ASR robustness",
      "unit": "WER %",
      "rows": [
        {"name": "HALAS", "better": "low", "scores": {"sov": 25.69, "nemotron": 31.59, "qwen": 26.01, "granite": 34.51, "voxtral": 27.35}}
      ]
    }
  ],
  "prompts": [
    {
      "id": "verbatim",
      "goal": "Verbatim",
      "text": "Transcribe the audio verbatim, outputting only spoken words in sequence."
    },
    {
      "id": "keywords",
      "goal": "Keywords",
      "text": "This audio may contain the following words or phrases: {keywords}. Transcribe the audio into text."
    },
    {
      "id": "auto",
      "goal": "Detect the language",
      "text": "Transcribe the audio verbatim in the language's standard writing system, using punctuation and capitalization. Output only the transcript."
    },
    {
      "id": "hint",
      "goal": "Name the language",
      "text": "Transcribe the {language} audio into text, ensuring all punctuation marks are included."
    }
  ],
  "latency": [
    {"band": "Up to 10 s", "plain": 0.16, "draft": 0.09},
    {"band": "10–30 s", "plain": 0.44, "draft": 0.15},
    {"band": "30–60 s", "plain": 0.88, "draft": 0.31},
    {"band": "1–5 min", "plain": 2.78, "draft": 1.26}
  ]
};
