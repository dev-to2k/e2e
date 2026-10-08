import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

const skip = process.env.ANTHROPIC_API_KEY ? false : 'set ANTHROPIC_API_KEY to run agent tests';

test('locator: greets the name you type', async ({ app, screen }) => {
  await app.open('/');

  await screen.getByLabel('Name').fill('Trung');
  await screen.getByRole('button', 'Greet').click();

  await expect(screen.getByRole('status')).toHaveText('Hello, Trung!');
});

test('locator: shows an error when the name is empty', async ({ app, screen }) => {
  await app.open('/');

  await screen.getByRole('button', 'Greet').click();

  await expect(screen.getByRole('alert')).toHaveText('Enter a name first.');
});

test('agent: greets a name from a plain-language goal', { skip }, async ({ app, agent, screen }) => {
  await app.open('/');

  await agent.act('get the app to greet {name}', { params: { name: 'Trung' } });

  await expect(screen.getByRole('status')).toHaveText('Hello, Trung!');
  await agent.assert('the app greets Trung by name');
});

test('agent: checks the error state', { skip }, async ({ app, agent, screen }) => {
  await app.open('/');

  await agent.act('press Greet without typing a name');

  await expect(screen.getByRole('alert')).toHaveText('Enter a name first.');
  await agent.assert('the page tells the user to enter a name');
});
