import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';

export default {
  // The Vercel AI Gateway serves the model and reads AI_GATEWAY_API_KEY.
  // Only tests that use `agent` need it; tests/greeting.e2e.ts runs without one.
  agents: {
    default: {
      model: google('gemini-3.8-flash'),
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
