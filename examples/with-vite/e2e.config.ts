import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { grok } from 'e2e/oauth/grok';
import { google } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const anthropic = createAnthropic({
  headers: { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID ?? '' },
});

const opencode = createOpenAICompatible({
  name: 'opencode',
  baseURL: 'https://opencode.ai/zen/v1',
  apiKey: process.env.OPENCODE_API_KEY,
});

export default {
  // The Vercel AI Gateway serves the model and reads AI_GATEWAY_API_KEY.
  // Only tests that use `agent` need it; tests/greeting.e2e.ts runs without one.
  agents: {
    default: {
      model: google('gemini-3.8-flash'),
      system: 'You are a thorough QA agent. Verify every outcome.',
    },
    opencode: {
      model: opencode('deepseek-v4.1-flash'),
      system: 'You are a thorough QA agent. Verify every outcome.',
    },
    grok: {
      model: grok('grok-4.6'),
      system: 'You are a thorough QA agent. Verify every outcome.',
    },
    claude: {
      model: anthropic('claude-sonnet-5-5'),
      system: 'You are a thorough QA agent. Verify every outcome.',
    },
  },
  targets: [
    {
      engine: web(),
      app: {
        url: 'http://localhost:5173',
        // The runner starts the Vite dev server and waits for the URL to answer.
        // Outside CI, a server you already started on that port is reused.
        command: { executable: 'npm', args: ['run', 'dev'], reuseExisting: true },
      },
    },
  ],
} satisfies E2EConfig;
