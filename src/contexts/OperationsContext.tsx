import React, { createContext, useState, useCallback } from 'react';
import type { Lead, User, Batch } from '../types';

interface OperationsContextType {
  leads: Lead[];
  users: User[];
  batches: Batch[];
  fetchLeads: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchBatches: () => Promise<void>;
  handleAddedToGroup: (leadId: string, added: boolean) => Promise<void>;
  handleRegisteredOnApp: (leadId: string, registered: boolean) => Promise<void>;
}

export const OperationsContext = createContext<OperationsContextType>({
  leads: [],
  users: [],
  batches: [],
  fetchLeads: async () => {},
  fetchUsers: async () => {},
  fetchBatches: async () => {},
  handleAddedToGroup: async () => {},
  handleRegisteredOnApp: async () => {},
});

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) (headers as Record<string, string>)['Authorization'] = `${token}`;
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error('Failed to fetch ' + url);
    return res.json();
  };

  // const updateOperationsStatus = useCallBack(async () => {
  //   const data = await fetchWithAuth('http://localhost:8000/api/')
  // })

  const fetchLeads = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/gen/under-review-leads/');
    console.log('leads fetched', data);
    setLeads(data.leads);
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

  const handleAddedToGroup = useCallback(async (leadId: string, added: boolean) => {
    const payload = {
      id: leadId,
      added_to_group: added
    };
    await fetchWithAuth('http://localhost:8000/api/ops/lead/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await fetchLeads();
  }, [fetchLeads]);

  const handleRegisteredOnApp = useCallback(async (leadId: string, registered: boolean) => {
    const payload = {
      id: leadId,
      registered_on_app: registered
    };
    await fetchWithAuth('http://localhost:8000/api/ops/lead/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await fetchLeads();
  }, [fetchLeads]);

  return (
    <OperationsContext.Provider value={{
      leads,
      users,
      batches,
      fetchLeads,
      fetchUsers,
      fetchBatches,
      handleAddedToGroup,
      handleRegisteredOnApp,
    }}>
      {children}
    </OperationsContext.Provider>
  );
}; 