import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { BRAND } from '@/config/brand';

// Set document title from brand config
document.title = `${BRAND.name} — ${BRAND.tagline}`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
