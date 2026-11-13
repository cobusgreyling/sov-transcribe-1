# A transcript can be almost right

Salesforce put a speech model on Hugging Face on 12 November 2026 and told enterprises they could keep it. The name is SOV-Transcribe-1. The team is Missionforce Sovereign AI. The licence is Apache 2.0.

The sentence people will repeat is the leaderboard sentence. On Artificial Analysis, the model scored 2.28% word error and sat first among open weights, seventh overall, on the table Salesforce published with the launch. The next morning the same board still called it the most accurate open-weights model, now at a rounded 2.3%, among 16 open-weights systems of 65. Hosted models on that page were already lower: 1.7, 1.9, 2.0, 2.1. Grok Voice Transcribe 2.0 was listed at the same rounded 2.3.

That is a real result. It is also the wrong place to stop, if the transcript has to do work.

## The word that carries the task

A call can be ninety-eight percent right and still send the payment to the wrong account. VoiceCodeBench, from BeSimple, treats that as the test. A recording passes only when every target entity is correct. Phone numbers, emails, URLs, symbols.

SOV-Transcribe-1 passes 76.33% of those recordings. It recovers 93.39% of the entities. Nemotron 3.5 Transcribe, the only other model Salesforce filled in on that block, passes 62.67% and recovers 89.34%.

Read those two SOV figures together. Most of the precious tokens come back. A quarter of the recordings still fail, because one of them did not. The average word error on the same bench is 5.01%. A five percent word error and a twenty-four percent task failure are the same system, seen from two distances.

That is the case for this model inside a voice agent. The case is stronger than the 2.28% headline, and it is still a case with a remainder.

## How the 2.28 is built

Artificial Analysis mixes three English sets. Half the index is AA-AgentTalk, people talking to voice agents. A quarter is a cleaned VoxPopuli, parliamentary speech. A quarter is a cleaned Earnings22, earnings calls.

Salesforce’s cells are 1.78, 1.50, and 4.06. Weighted, that is 2.28 on the nose:

```
0.50 × 1.78 + 0.25 × 1.50 + 0.25 × 4.06 = 2.28
```

On the agent-talk half, SOV and Nemotron 3.5 Transcribe print the same 1.78. Voxtral Small is at 2.27. The open-weights lead is not “it hears agents better than Nemotron.” The lead is earnings audio, 4.06 against Nemotron’s 5.69 and Voxtral’s 4.78, and parliament, 1.50 against 1.99 and 1.75.

The same name, Earnings22, shows up later in the Open ASR block at 5.52. That is a different slice and a different prompt. Quote the set, or the two numbers will look like a contradiction.

## What is inside the file

The model card describes three pieces.

A Whisper large-v3 encoder takes 16 kHz mono audio. The reference code pads the file out to whole 30-second windows.

A projector stacks four encoder frames, runs a linear layer, a GELU, and another linear layer. The card’s own comment puts that at 375 audio tokens for each 30-second window.

A Gemma 4 26B A4B mixture-of-experts writes the words. The starting point on the model tree is `google/gemma-4-26B-A4B-it`. The router stays in FP32, the way it was trained. Total size, encoder included, is 26.6 billion parameters, with 4.6 billion active. The launch post rounds the active count to 4 billion and says that is six times smaller than Voxtral Small’s 24 billion active. Against the card’s 4.6 billion, twenty-four billion is about five times, not six. Use the card when you size a machine. Use the post when you quote the post.

The instruction sits in the user turn, next to the audio. Thinking is turned off. Decoding is greedy. Those two settings are part of the recipe, not optional taste. Salesforce also warns that the model will occasionally repeat a character or a phrase until it hits the token limit, and that they clear those loops with a cleanup adapted from the Qwen3-ASR toolkit. Budget for that cleanup if a downstream system parses the text.

Thirty minutes is the length they tested. Sixty windows is 22,500 audio tokens before the prompt, inside a 32,768 context. A dense transcript of a long meeting can run out of room. The card’s advice is to cut on speech boundaries and stitch the text back in order.

## The rows a short post will skip

The English public-set mean on Open ASR is 5.44%. Nemotron is 5.51. Voxtral Small is 6.90. That mean leaves LibriSpeech out, so it is not the nine-set average other cards sometimes quote. Inside it, SOV leads Monsoon Indian English at 2.93 and the VoxPopuli subset at 1.46. It does not lead AMI meetings, where Granite Speech 5.0 2B is at 6.96 and SOV is at 8.15. It does not lead SPGISpeech, the clean financial readings, where Voxtral is at 1.84 and SOV is at 2.41. URGENT24, the noisy set, has Qwen3-ASR 1.7B at 9.93 and SOV at 10.47.

HALAS is the robustness claim, human-marked earnings audio chosen because models invent words there. SOV is at 25.69. Qwen is at 26.01. Voxtral Small is at 27.35. Nemotron is at 31.59. “Best open weight on HALAS” is true on this table. “Well clear of the pack” is true against Nemotron and overstated against Qwen.

Accents are a cleaner win. AppTek’s call-center set, fourteen English accents, averages 8.21% for SOV, 8.44 for Nemotron, 8.42 for Qwen, and the mid-teens for Granite and Voxtral. The launch post says the lowest error falls on SOV for eight of the fourteen: Australian, British, Scottish, Welsh, Irish, Indian, Mexican, and Singaporean. The per-accent grid is in the post’s figure, not in the summary table, so the eight names rest on that prose.

Multilingual is the other direction. Six languages, mean 4.88. Voxtral Small’s mean is 3.39. Nemotron’s is 3.87. Dutch is 7.67, against Voxtral’s 4.04. If the work is French, German, Spanish, Italian, Portuguese, or Dutch at the quality of the English index, this table says you are not there yet. Granite has no multilingual cells in the graphic.

Context is a split decision. Give Contextual Earnings-22 the names that occur in the clip and Salesforce reports keyword F1 moving from 71.9 to 96.8, then 94.0 when the list is every name from the hour, most of them bait. Word error on that family moves from 12.42 to 9.73 with the local list. Qwen, given the same kind of list, posts 9.19. On ContextASR-Bench the pattern is sharper. SOV without context is at 7.03, and with a fine list at 3.67. Qwen is at 2.92 and 1.53. The hint does a lot of work for SOV. It does not take the lead.

Style control is the feature the prompt guide is selling. Preference-ASR, with an instruction, puts SOV at 5.05% preference-aware word error. Granite is at 4.70. Without an instruction, SOV leads that pair of rows at 5.72. Ask for the format when you care. Expect a smaller model to win some of those asks.

## What “run it yourself” costs

On launch day, native vLLM and Transformers support was still on its way upstream. The repository carries a plugin that installs vLLM 0.32.0, and modeling code that Transformers loads with remote code enabled, on versions from 5.19 up to but not including 5.23. Remote code means you are executing the repository. Read it, and pin the commit.

The server line is short. `vllm serve` the repo id, context 32,768, temperature 0. The endpoint allows ten minutes of audio unless `VLLM_MAX_AUDIO_DECODE_DURATION_S` is raised to 1800. The verbatim instruction is the default. Any other line from the prompt guide is a form field.

A second repository, SOV-Transcribe-1-DFlash, drafts 15 tokens at a time. Salesforce measured it one request at a time on an RTX PRO 6000 Blackwell, 96 GB, BF16, greedy, on slices of Earnings-22. A clip under 10 seconds went from 0.16 seconds to 0.09. A clip of one to five minutes went from 2.78 seconds to 1.26. They set the server’s max sequences to 64 so the draft’s memory profile still fits in 96 GB. The default of 1,024 concurrent sequences does not.

Three speed claims are in circulation, and they are three experiments.

- One request, with the draft, on that 96 GB card: the table above.
- Throughput on the same class of card: up to 1,039 seconds of audio per second of wall clock, BF16 with the draft, and a 30-second file returned in 0.22 seconds.
- Salesforce’s hosted endpoint, as Artificial Analysis measured it: a speed factor of 60, about a minute of audio in a second.

The first is latency. The second is a busy GPU. The third is someone else’s deployment. Quote the one you mean.

Memory follows the total parameter count, because every expert has to be present even though only some of them fire. 26.6 billion BF16 weights are about 53 GB before activations and cache. I calculated that. Salesforce did not print it. They also did not publish a smaller quantization. A laptop GPU is the wrong machine for the checkpoint as released.

## What I would trial, and what I would not

I would trial it on recorded calls where a name, a number, or an email has to survive, in English first, with the keyword line filled in from the system of record. I would score task success on those entities, not only word error. I would keep the repetition cleanup. I would split anything that runs toward half an hour.

I would not trial it as a live captioner. The model is file-in, text-out. I would not ask it who spoke. The card does not do diarisation. I would not assume the multilingual mean resembles the English index. I would not drop it onto a 24 GB card and hope.

The technical report was still marked coming soon on the day of the launch. Until it arrives, the model card is the spec, the benchmark image is the comparison, and the board will keep moving. The date belongs next to the number.

Cobus Greyling, 13 November 2026.
