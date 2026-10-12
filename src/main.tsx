import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/figtree';
import App from './App';
import { LangProvider } from './lib/i18n';
import './styles/global.css';

// L'administration est chargée à part : les visiteurs du site ne téléchargent pas son code.
const AdminApp = lazy(() => import('./admin/AdminApp'));
const isAdminPage = /^\/admin\/?$/.test(window.location.pathname);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminPage ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <LangProvider>
        <App />
      </LangProvider>
    )}
  </StrictMode>,
);
