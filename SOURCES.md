# Sources

Figures on the guide were checked on 13 November 2026. The launch table is Salesforce’s. The live board is Artificial Analysis’s, and it had already moved. When the two disagree, both are shown with their dates.

The numeric table in [`benchmarks.js`](benchmarks.js) was read from the PNG on the model card, then read again in four crops. `python3 check_sources.py` recomputes the AA-WER index from those cells.

## Primary

- Model card, 12 November 2026. Architecture, sizes, languages, prompts, hardware, DFlash table, licence, evaluation protocol. <https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1>
- Benchmark PNG on that card. Every open-weights comparison cell in `benchmarks.js`. <https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1/blob/main/assets/benchmark-table.png>
- Launch post, 12 November 2026. VoiceCodeBench rank (#2 of 23, #1 open weight), AppTek accent names, HALAS comparisons in prose, keyword F1 of 71.9 / 96.8 / 94.0, preference-aware scores, “4 billion active” and “6× fewer” wording, contributor list, technical report marked coming soon. <https://huggingface.co/blog/salesforce-sovereign-intelligence/sov-transcribe-1>
- DFlash weights, separate repository. <https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1-DFlash>
- Base model named on the model tree. `google/gemma-4-26B-A4B-it`.

## The board

- Artificial Analysis post, 12 November 2026. #1 open weights, #7 of 44, 2.3% AA-WER, next open weights at 2.8%, hosted speed factor of 60×. <https://x.com/ArtificialAnlys/status/2120917242439409788>
- Non-streaming leaderboard, retrieved 13 November 2026. FAQ: SOV-Transcribe-1 is the most accurate open-weights model at 2.3% AA-WER, 16 open-weights models of 65 evaluated. Top of the accuracy list on that visit: Fun-Realtime-ASR-preview 1.7%, ElevenLabs Scribe v3 1.9%, MAI-Transcribe-2 2.0%, Zoom Scribe V2.1 Pro 2.1%, Voxtral Small Transcribe 3 2.1%. Grok Voice Transcribe 2.0 listed at 2.3%. A DeepInfra row for Nemotron 3.5 Transcribe listed 3.4%, which is a hosted measurement and not the 2.81% cell in Salesforce’s table. The rendered summary did not include a SOV row, so no new overall rank is stated here. <https://artificialanalysis.ai/speech-to-text/non-streaming>
- Methodology. Index weights 50% AA-AgentTalk, 25% VoxPopuli, 25% Earnings22, over about eight hours. <https://artificialanalysis.ai/speech-to-text/methodology>

## Derived on this site, and marked as such

- AA-WER arithmetic: `0.50 × 1.78 + 0.25 × 1.50 + 0.25 × 4.06 = 2.28`. Same check for Nemotron (2.81) and Voxtral (2.77).
- Audio tokens for 30 minutes: 60 windows × 375 tokens, from the model card’s “375 per 30 s window” comment, equals 22,500 tokens before the instruction, inside a 32,768 context.
- Weight memory: 26.6 billion parameters × 2 bytes is about 53 GB for BF16, before the KV cache. The router is FP32 and does not change the order of magnitude.

## Papers named by Salesforce

The launch post and the model card point at these for the datasets. This guide quotes Salesforce’s scores, not a re-run.

- AppTek Call-Center Dialogues. <https://arxiv.org/pdf/2604.27543>
- HALAS. <https://arxiv.org/pdf/2606.23048>
- Preference-ASR. <https://arxiv.org/pdf/2606.29534>
- Contextual Earnings-22. <https://arxiv.org/pdf/2604.07354>
- VoiceCodeBench leaderboard. <https://besimple.ai/leaderboards/voice-code-bench>

## What this repository does not claim

- No measurement was run on these weights for this guide. There is no NVIDIA-class GPU behind the numbers.
- No overall rank newer than Salesforce’s “#7” and Artificial Analysis’s “#7 of 44” on 12 November.
- No claim that native vLLM or Transformers support has landed. The card said it was being upstreamed.
- No speaker diarisation, streaming, or translation API. Those are absent from the model card, which is the evidence.
