import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './index.css';
import 'leaflet/dist/leaflet.css'; 
import { routeTree } from './routeTree.gen';
import { ClimaScopeDataProvider } from './hooks/useClimaScopeData';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClimaScopeDataProvider>
      <RouterProvider router={router} />
    </ClimaScopeDataProvider>
  </React.StrictMode>
);
