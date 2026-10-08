import { useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'

type Todo = { id: string; title: string; completed: boolean }
type Filter = 'all' | 'active' | 'completed'

const FILTERS: Filter[] = ['all', 'active', 'completed']
const API = '/api/todos'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json' },
  })
  if (!response.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed: ${response.status}`)
  return response.json() as Promise<T>
}

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  useEffect(() => {
    request<Todo[]>(API).then(setTodos).catch(console.error)
  }, [])

  async function addTodo() {
    const title = draft.trim()
    if (!title) return
    setDraft('')
    const created = await request<Todo>(API, {
      method: 'POST',
      body: JSON.stringify({ title, completed: false }),
    })
    setTodos((current) => [...current, created])
  }

  async function toggleTodo(todo: Todo) {
    const updated = await request<Todo>(`${API}/${todo.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !todo.completed }),
    })
    setTodos((current) => current.map((item) => (item.id === todo.id ? updated : item)))
  }

  async function deleteTodo(id: string) {
    await request<Todo>(`${API}/${id}`, { method: 'DELETE' })
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id)
    setEditDraft(todo.title)
  }

  async function commitEdit() {
    const id = editingId
    const title = editDraft.trim()
    setEditingId(null)
    if (!id || !title) return
    const updated = await request<Todo>(`${API}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    })
    setTodos((current) => current.map((todo) => (todo.id === id ? updated : todo)))
  }

  function onEditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditingId(null)
  }

  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })
  const remaining = todos.filter((todo) => !todo.completed).length

  return (
    <main className="todo">
      <h1>Todo</h1>
      <input
        aria-label="New todo"
        placeholder="What needs to be done?"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addTodo()}
      />
      <nav aria-label="Filters" className="filters">
        {FILTERS.map((name) => (
          <button key={name} aria-pressed={filter === name} onClick={() => setFilter(name)}>
            {name}
          </button>
        ))}
      </nav>
      {visibleTodos.length === 0 && <p role="status">No todos</p>}
      <ul>
        {visibleTodos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'done' : ''}>
            <input
              type="checkbox"
              aria-label={`Complete ${todo.title}`}
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
            />
            {editingId === todo.id ? (
              <input
                aria-label={`Edit ${todo.title}`}
                autoFocus
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={onEditKeyDown}
                onBlur={commitEdit}
              />
            ) : (
              <span onDoubleClick={() => startEdit(todo)}>{todo.title}</span>
            )}
            <button aria-label={`Edit ${todo.title}`} onClick={() => startEdit(todo)}>
              Edit
            </button>
            <button aria-label={`Delete ${todo.title}`} onClick={() => deleteTodo(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <p aria-live="polite">{remaining} items left</p>
    </main>
  )
}
