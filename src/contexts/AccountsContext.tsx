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
      const res = await fetch('http:localhost:8000/api/gen/under-review-leads/');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts);
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