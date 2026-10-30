import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import './locales/i18n';
import './monaco.worker';
import App from './App';
import './style.css';
import './mobile.css';
import { ApiErrorBoundaryProvider } from './hooks/ApiErrorBoundaryContext';
import 'katex/dist/katex.min.css';
import 'katex/dist/contrib/copy-tex.js';

const container = document.getElementById('root');
const root = createRoot(container);

// Temporary: expose assistant name for verification in DevTools
try {
  window.__ASSISTANT_NAME__ = (import.meta && import.meta.env && import.meta.env.VITE_ASSISTANT_DISPLAY_NAME) || 'Dev Help';
} catch (_) {}

root.render(
  <ApiErrorBoundaryProvider>
    <App />
  </ApiErrorBoundaryProvider>,
);
