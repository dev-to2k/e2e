import { test } from '@e2e-dev/web';
import { beforeEach, describe, unique } from 'e2e';

const skip = process.env.ANTHROPIC_API_KEY ? false : 'set ANTHROPIC_API_KEY to run agent tests';

describe('greeting app, agent only', () => {
  beforeEach(async ({ app }) => {
    await app.open('/');
  });

  test('greets a name', { skip }, async ({ agent }) => {
    await agent.act('type {name} into the name field and press Greet', { params: { name: 'Ada' } });

    await agent.assert('the page shows the greeting "Hello, Ada!"');
  });

  test('asks for a name when the field is empty', { skip }, async ({ agent }) => {
    await agent.act('press Greet without typing anything');

    await agent.assert('an error says to enter a name first');
    await agent.assert('no greeting is shown');
  });

  test('recovers from an error', { skip }, async ({ agent }) => {
    await agent.act('press Greet without typing anything');
    await agent.assert('an error message is shown');

    await agent.act('greet {name}', { params: { name: 'Grace' } });
    await agent.assert('the error message is gone');
    await agent.assert('the page greets Grace');
  });

  test('replaces the old greeting with the new one', { skip }, async ({ agent }) => {
    await agent.act('greet {name}', { params: { name: 'Ada' } });
    await agent.act('greet {name}', { params: { name: 'Linus' } });

    await agent.assert('the page greets Linus');
    await agent.assert('the page does not mention Ada in a greeting');
  });

  test('works with a name that changes every run', { skip }, async ({ agent }) => {
    const name = `Tester ${Date.now()}`;

    await agent.act('greet {name}', { params: { name: unique(name) } });

    await agent.assert('the greeting contains the name that was typed');
  });

  test('describes the whole flow in one goal', { skip }, async ({ agent }) => {
    await agent.act('try Greet with an empty name, then greet {name}', { params: { name: 'Ada' } });

    await agent.assert('the page greets Ada and shows no error');
  });
});
