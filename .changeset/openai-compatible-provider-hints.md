---
"e2e": patch
---

Only OpenAI and Azure OpenAI Responses models get `store: false` and a prompt cache key. An OpenAI-compatible provider named `openai` no longer fails with `Unknown parameter: promptCacheKey`.
