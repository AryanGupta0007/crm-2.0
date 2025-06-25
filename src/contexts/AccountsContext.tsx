import React, { createContext, useState, useCallback } from 'react';
import type { DemoAccount } from '../types';

interface AccountsContextType {
  accounts: DemoAccount[];
  fetchAccounts: () => Promise<void>;
}

export const AccountsContext = createContext<AccountsContextType>({
  accounts: [],
  fetchAccounts: async () => {},
});

export const AccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);

  const fetchAccounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `${token}`;
      const res = await fetch('http://localhost:8000/api/gen/under-review-leads/', { headers });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.leads);
      }
    } catch (err) {
      // handle error
    }
  }, []);

  return (
    <AccountsContext.Provider value={{ accounts, fetchAccounts }}>
      {children}
    </AccountsContext.Provider>
  );
}; 