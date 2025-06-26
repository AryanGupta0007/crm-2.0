import React, { createContext, useState, useCallback } from 'react';
import type { Lead, User, Batch } from '../types';

interface SalesContextType {
  leads: Lead[];
  users: User[];
  batches: Batch[];
  fetchLeads: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchBatches: () => Promise<void>;
  updateLead: (updatedLead: Lead) => void;
  handleAddComment: (leadId: string, comment: string) => Promise<void>;
  handleStatusUpdate: (leadId: string, status: string) => Promise<void>;
}

export const SalesContext = createContext<SalesContextType>({
  leads: [],
  users: [],
  batches: [],
  fetchLeads: async () => {},
  fetchUsers: async () => {},
  fetchBatches: async () => {},
  updateLead: () => {},
  handleAddComment: async() => {}, 
  handleStatusUpdate: async() => {}
});

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const fetchLeads = useCallback(async () => {
    const data = await fetchWithAuth('http://localhost:8000/api/sales/leads/');
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

  const updateLead = (updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
  };

  const handleAddComment = useCallback(async (leadId: string, comment: string) => {
    const payload = {
      'id': leadId,
      'status': comment // This is updating status, not adding a comment.
    };
    await fetchWithAuth('http://localhost:8000/api/sales/leads/', {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    await fetchLeads();
  }, [fetchLeads]);


  const handleStatusUpdate = useCallback(async (leadId: string, status: string) => {
    const payload = {
        'id': leadId,
        'status': status
    }
    await fetchWithAuth('http://localhost:8000/api/sales/leads/', {
        method: "PATCH",
        body: JSON.stringify(payload),
        });
    await fetchLeads();
    }, [fetchLeads]);

  return (
    <SalesContext.Provider value={{
      leads,
      users,
      batches,
      fetchLeads,
      fetchUsers,
      fetchBatches,
      updateLead,
      handleAddComment,
      handleStatusUpdate,
    }}>
      {children}
    </SalesContext.Provider>
  );
}; 