import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LeadsProvider } from './contexts/LeadsContext';
import { AccountsProvider } from './contexts/AccountsContext';
import { BatchesProvider } from './contexts/BatchesContext';
import { UsersProvider } from './contexts/UsersContext';
import { DashboardStatsProvider } from './contexts/DashboardStatsContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './contexts/AdminContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import { SalesProvider } from './contexts/SalesContext.tsx';
import { OperationsProvider } from './contexts/OperationsContext.tsx';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OperationsProvider>
    <AdminProvider>
    <AuthProvider>
      <SalesProvider>
      <LeadsProvider>
        <AccountsProvider>
          <BatchesProvider>
            <UsersProvider>
              <DashboardStatsProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </DashboardStatsProvider>
            </UsersProvider>
          </BatchesProvider>
        </AccountsProvider>
      </LeadsProvider>
      </SalesProvider>
    </AuthProvider>
    </AdminProvider>
    </OperationsProvider>
  </StrictMode>
);
