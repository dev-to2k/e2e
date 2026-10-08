import { useState } from 'react'
import type { KeyboardEvent } from 'react'

type Todo = { id: number; title: string; done: boolean }
type Filter = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'todos'
const FILTERS: Filter[] = ['all', 'active', 'completed']

function loadTodos(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState('')

  function update(next: Todo[]) {
    setTodos(next)
    saveTodos(next)
  }

  function addTodo() {
    const title = draft.trim()
    if (!title) return
    update([...todos, { id: Date.now(), title, done: false }])
    setDraft('')
  }

  function toggleTodo(id: number) {
    update(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function deleteTodo(id: number) {
    update(todos.filter((todo) => todo.id !== id))
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id)
    setEditDraft(todo.title)
  }

  function commitEdit() {
    const title = editDraft.trim()
    if (title) {
      update(todos.map((todo) => (todo.id === editingId ? { ...todo, title } : todo)))
    }
    setEditingId(null)
  }

  function onEditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditingId(null)
  }

  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.done
    if (filter === 'completed') return todo.done
    return true
  })
  const remaining = todos.filter((todo) => !todo.done).length

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
          <li key={todo.id} className={todo.done ? 'done' : ''}>
            <input
              type="checkbox"
              aria-label={`Complete ${todo.title}`}
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
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
