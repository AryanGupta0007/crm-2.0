import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LeadsProvider } from './contexts/LeadsContext';
import { AccountsProvider } from './contexts/AccountsContext';
import { BatchesProvider } from './contexts/BatchesContext';
import { UsersProvider } from './contexts/UsersContext';
import { DashboardStatsProvider } from './contexts/DashboardStatsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LeadsProvider>
      <AccountsProvider>
        <BatchesProvider>
          <UsersProvider>
            <DashboardStatsProvider>
              <App />
            </DashboardStatsProvider>
          </UsersProvider>
        </BatchesProvider>
      </AccountsProvider>
    </LeadsProvider>
  </StrictMode>
);
