import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './todo/todo.css';
import { TodoApp } from './todo/TodoApp.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TodoApp />
  </StrictMode>,
);
