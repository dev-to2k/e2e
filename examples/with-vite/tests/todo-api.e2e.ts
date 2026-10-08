import { test, expect, describe } from 'e2e';
import { z } from 'zod';

// Fake REST server: `npm run api` (json-server on db.json).
const API = process.env.API_URL ?? 'http://localhost:3001';

const Todo = z.object({ id: z.string(), title: z.string(), completed: z.boolean() });

const url = (path: string) => new URL(path, API);
const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

describe('API /todos (CRUD qua json-server)', { serial: true }, () => {
  let id = '';

  test('API-01: đọc danh sách (Read all)', async () => {
    const response = await fetch(url('/todos'));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toMatchSchema(z.array(Todo));
  });

  test('API-02: lọc theo trạng thái', async () => {
    const created = await fetch(url('/todos'), json('POST', { title: 'Đã xong', completed: true }));
    const { id: doneId } = expect(await created.json()).toMatchSchema(Todo);

    const response = await fetch(url('/todos?completed=true'));
    const todos = expect(await response.json()).toMatchSchema(z.array(Todo));
    expect(todos.map((t) => t.id)).toContain(doneId);
    expect(todos.every((t) => t.completed)).toBe(true);

    await fetch(url(`/todos/${doneId}`), { method: 'DELETE' });
  });

  test('API-03: tạo todo (Create)', async () => {
    const response = await fetch(url('/todos'), json('POST', { title: 'Mua sữa', completed: false }));
    expect(response.status).toBe(201);
    const todo = expect(await response.json()).toMatchSchema(Todo);
    expect(todo.title).toBe('Mua sữa');
    expect(todo.completed).toBe(false);
    id = todo.id;
  });

  test('API-04: đọc một todo (Read one)', async () => {
    const response = await fetch(url(`/todos/${id}`));
    expect(response.status).toBe(200);
    expect(expect(await response.json()).toMatchSchema(Todo).title).toBe('Mua sữa');

    expect((await fetch(url('/todos/khong-ton-tai'))).status).toBe(404);
  });

  test('API-05: sửa một phần (PATCH)', async () => {
    const response = await fetch(url(`/todos/${id}`), json('PATCH', { completed: true }));
    expect(response.status).toBe(200);
    const todo = expect(await response.json()).toMatchSchema(Todo);
    expect(todo).toMatchObject({ id, title: 'Mua sữa', completed: true });

    await expect
      .poll(async () => ((await (await fetch(url(`/todos/${id}`))).json()) as { completed: boolean }).completed)
      .toBe(true);
  });

  test('API-06: thay thế toàn bộ (PUT)', async () => {
    const response = await fetch(url(`/todos/${id}`), json('PUT', { title: 'Mua bánh mì', completed: false }));
    expect(response.status).toBe(200);
    expect(expect(await response.json()).toMatchSchema(Todo)).toMatchObject({ id, title: 'Mua bánh mì', completed: false });
  });

  test('API-07: xóa todo (Delete)', async () => {
    const response = await fetch(url(`/todos/${id}`), { method: 'DELETE' });
    expect(response.status).toBe(200);

    expect((await fetch(url(`/todos/${id}`))).status).toBe(404);
    const todos = expect(await (await fetch(url('/todos'))).json()).toMatchSchema(z.array(Todo));
    expect(todos.some((t) => t.id === id)).toBe(false);
  });

  test('API-08: nhiều request song song cho id khác nhau', async () => {
    const responses = await Promise.all(
      ['A', 'B', 'C'].map((title) => fetch(url('/todos'), json('POST', { title, completed: false }))),
    );
    const todos = await Promise.all(responses.map(async (r) => expect(await r.json()).toMatchSchema(Todo)));
    expect(new Set(todos.map((t) => t.id)).size).toBe(3);

    await Promise.all(todos.map((t) => fetch(url(`/todos/${t.id}`), { method: 'DELETE' })));
  });
});
