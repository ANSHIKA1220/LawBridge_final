import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite WebSocket errors in the AI Studio environment
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('WebSocket')) return;
    originalError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (
      (event.reason.message && event.reason.message.includes('WebSocket')) ||
      (typeof event.reason === 'string' && event.reason.includes('WebSocket'))
    )) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
