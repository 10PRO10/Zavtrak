import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Находим корневой элемент
const container = document.getElementById('root');

// Если элемент найден — рендерим приложение
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("❌ ОШИБКА: Не найдено элемента с id='root'");
}