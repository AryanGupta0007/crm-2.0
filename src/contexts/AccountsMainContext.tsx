import React, { createContext, useState, useCallback } from 'react';
import type { Account, User, Batch } from '../types';

interface AccountsMainContextType {
  accounts: Account[];
  users: User[];
  batches: Batch[];
  fetchAccounts: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchBatches: () => Promise<void>;
}

export const AccountsMainContext = createContext<AccountsMainContextType>({
  accounts: [],
  users: [],
  batches: [],
  fetchAccounts: async () => {},
  fetchUsers: async () => {},
  fetchBatches: async () => {},
});

export const AccountsMainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Failed to fetch ' + url);
    return res.json();
  };

  const fetchAccounts = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/admin/leads/');
    setAccounts(data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/admin/employee/');
    setUsers(Array.isArray(data) ? data : data ? [data] : []);
  }, []);

  const fetchBatches = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/admin/batch/');
    setBatches(data);
  }, []);

  return (
    <AccountsMainContext.Provider value={{
      accounts,
      users,
      batches,
      fetchAccounts,
      fetchUsers,
      fetchBatches,
    }}>
      {children}
    </AccountsMainContext.Provider>
  );
}; 