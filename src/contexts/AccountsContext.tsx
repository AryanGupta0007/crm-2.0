import React, { createContext, useState, useCallback } from 'react';
import type { Lead, User, Batch } from '../types';

interface AccountsContextType {
  leads: Lead[];
  users: User[];
  batches: Batch[];
  fetchLeads: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchBatches: () => Promise<void>;
  handleMarkAsFake: (leadId: number) => Promise<void>;
}

export const AccountsContext = createContext<AccountsContextType>({
  leads: [],
  users: [],
  batches: [],
  fetchLeads: async () => {},
  fetchUsers: async () => {},
  fetchBatches: async () => {},
  handleMarkAsFake: async () => {}
});

export const AccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);


  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `${token}`;
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error('Failed to fetch ' + url);
    return res.json();
  };
  
  const handleMarkAsFake = useCallback(async (leadId: number) => {
    console.log(leadId)
    const payload = {
        "id": leadId,
        "payment_verification_status": "fake"
    }
    const data = await fetchWithAuth('http://localhost:8000/api/accounts/lead/', {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    console.log('leads fetched', data);
    fetchLeads();
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `${token}`;
      const res = await fetch('http://localhost:8000/api/gen/under-review-leads/', { headers });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      }
    } catch (err) {
      // handle error
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/gen/current-user/');
    console.log('fetched user, ', data)
    setUsers(Array.isArray(data) ? data : data ? [data] : []);
  }, []);

  const fetchBatches = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/gen/batch/');
    console.log('batches fetched', data);
    setBatches(data.batches);
  }, []);


  return (
    <AccountsContext.Provider value={{ leads, fetchLeads, batches, fetchBatches, users, fetchUsers, handleMarkAsFake }}>
      {children}
    </AccountsContext.Provider>
  );
}; 