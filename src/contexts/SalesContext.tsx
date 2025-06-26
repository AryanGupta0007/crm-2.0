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
  addCommentToLead: (leadId: string, comment: string) => void;
}

export const SalesContext = createContext<SalesContextType>({
  leads: [],
  users: [],
  batches: [],
  fetchLeads: async () => {},
  fetchUsers: async () => {},
  fetchBatches: async () => {},
  updateLead: () => {},
  addCommentToLead: () => {},
});

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `${token}`;
    const res = await fetch(url, { headers });
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

  const addCommentToLead = (leadId: string, comment: string) => {
    setLeads(prevLeads => prevLeads.map(lead =>
      lead.id === leadId
        ? { ...lead, comments: [...lead.comments, comment], updatedAt: new Date().toISOString() }
        : lead
    ));
  };

  const handleStatusUpdate = useCallback(async (data: {userID: number, leadID: number}) => {
    const payload = {
        'assigned_to': data.userID,
        'id': data.leadID
    }
    await fetchWithAuth('http://localhost:8000/api/admin/leads/', {
        method: "PATCH",
        body: JSON.stringify(payload),
        });
    await fetchLeads();
    await fetchDashboardStats();
    }, [fetchLeads]) 

  };

  const handleAddComment = (leadId: string, comment: string) => {
    const data = addCommentToLead(leadId, comment);
  };


  return (
    <SalesContext.Provider value={{
      leads,
      users,
      batches,
      fetchLeads,
      fetchUsers,
      fetchBatches,
      updateLead,
      addCommentToLead,
    }}>
      {children}
    </SalesContext.Provider>
  );
}; 