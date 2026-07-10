import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/app.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1_000,
    },
  },
});

const isWheelSurface = (() => {
  const params = new URLSearchParams(window.location.search);
  return params.get('surface') === 'wheel' || window.location.hash.includes('surface=wheel');
})();

const Surface = isWheelSurface
  ? lazy(() => import('./features/wheel/WheelSurface').then((module) => ({ default: module.WheelSurface })))
  : lazy(() => import('./features/history/MainSurface').then((module) => ({ default: module.MainSurface })));

export function App() {
  return <Suspense fallback={null}><Surface /></Suspense>;
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
