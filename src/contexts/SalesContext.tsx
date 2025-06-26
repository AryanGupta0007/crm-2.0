import React, { createContext, useState, useCallback } from 'react';
import type { Lead, User, Batch } from '../types';

interface SalesContextType {
  leads: Lead[];
  users: User[];
  batches: Batch[];
  fetchLeads: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchBatches: () => Promise<void>;
}

export const SalesContext = createContext<SalesContextType>({
  leads: [],
  users: [],
  batches: [],
  fetchLeads: async () => {},
  fetchUsers: async () => {},
  fetchBatches: async () => {},
});

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
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

  const fetchLeads = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/sales/leads/');
    setLeads(data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/admin/employee/');
    setUsers(Array.isArray(data) ? data : data ? [data] : []);
  }, []);

  const fetchBatches = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/gen/batch/');
    setBatches(data);
  }, []);

  return (
    <SalesContext.Provider value={{
      leads,
      users,
      batches,
      fetchLeads,
      fetchUsers,
      fetchBatches,
    }}>
      {children}
    </SalesContext.Provider>
  );
}; 