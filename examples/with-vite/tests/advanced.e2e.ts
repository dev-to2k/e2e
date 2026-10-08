import { test as base } from '@e2e-dev/web';
import { beforeEach, describe, expect, unique } from 'e2e';
import { z } from 'zod';

const skip = process.env.ANTHROPIC_API_KEY ? false : 'set ANTHROPIC_API_KEY to run agent tests';

const test = base.extend<{ greet: (name: string) => Promise<void> }>({
  greet: async ({ screen }, use) => {
    await use(async (name) => {
      await screen.getByLabel('Name').fill(name);
      await screen.getByRole('button', 'Greet').click();
    });
  },
});

describe('greeting form', { tags: ['smoke'] }, () => {
  beforeEach(async ({ app }) => {
    await app.open('/');
  });

  const names = ['Ada', 'Grace Hopper', 'Nguyễn Văn A'];

  for (const name of names) {
    test(`greets "${name}"`, async ({ greet, screen }) => {
      await greet(name);

      await expect(screen.getByRole('status')).toHaveText(`Hello, ${name}!`);
    });
  }

  test('trims spaces around the name', async ({ greet, screen }) => {
    await greet('   Linus   ');

    await expect(screen.getByRole('status')).toHaveText('Hello, Linus!');
  });

  test('treats a name of only spaces as empty', async ({ greet, screen }) => {
    await greet('     ');

    await expect(screen.getByRole('alert')).toHaveText('Enter a name first.');
    await expect(screen.getByRole('status')).toHaveCount(0);
  });

  test('clears the input after a greeting', async ({ greet, screen }) => {
    await greet('Ada');

    await expect(screen.getByLabel('Name')).toHaveValue('');
  });

  test('replaces the error with a greeting once the name is valid', async ({ greet, screen }) => {
    await greet('');
    await expect(screen.getByRole('alert')).toBeVisible();

    await greet('Ada');

    await expect(screen.getByRole('alert')).toHaveCount(0);
    await expect(screen.getByRole('status')).toHaveText('Hello, Ada!');
  });

  test('keeps only the latest greeting on screen', async ({ greet, screen }) => {
    await greet('Ada');
    await greet('Grace');

    await expect(screen.getByRole('status')).toHaveCount(1);
    await expect(screen.getByRole('status')).toHaveText('Hello, Grace!');
  });
});

describe('greeting form with an agent', { tags: ['agent'] }, () => {
  beforeEach(async ({ app }) => {
    await app.open('/');
  });

  test('greets a unique name so the replay cache can reuse the recording', { skip, retries: 1, timeout: 90_000 }, async ({ agent, screen }) => {
    const name = `Tester ${Date.now()}`;

    await agent.act('get the app to greet {name}', { params: { name: unique(name) } });

    await expect(screen.getByRole('status')).toHaveText(`Hello, ${name}!`);
    await agent.assert('the greeting contains the name that was typed');
  });

  test('chains two goals and checks each one', { skip }, async ({ agent, screen }) => {
    await agent.act('press Greet without typing a name');
    await expect(screen.getByRole('alert')).toBeVisible();

    await agent.act('greet {name}', { params: { name: 'Ada' } });
    await expect(screen.getByRole('status')).toHaveText('Hello, Ada!');
    await agent.assert('no error message is shown');
  });

  test('extracts structured data from the screen', { skip }, async ({ agent, greet }) => {
    await greet('Ada');

    const data = await agent.extract('the greeting text and the page heading', {
      schema: z.object({ greeting: z.string(), heading: z.string() }),
    });

    expect(data.greeting).toContain('Ada');
    expect(data.heading).toBe('Say hello');
  });

  test('waits for a condition instead of sleeping', { skip }, async ({ agent, greet }) => {
    await greet('Grace');

    await agent.waitFor('the page greets Grace', { timeout: 30_000 });
  });

  test('judges the visual layout with a screenshot', { skip }, async ({ agent }) => {
    await agent.assert('the name field and the Greet button sit on the same row', { vision: true });
  });
});
