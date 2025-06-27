import React, { createContext, useState, useCallback } from 'react';
import type { Lead, User, Batch, DashboardStats, Account } from '../types';

interface AdminContextType {
  leads: Lead[];
  users: User[];
  batches: Batch[];
  accounts: Account[];
  dashboardStats: DashboardStats | null;
  fetchLeads: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchBatches: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  createBatch: (batch: Partial<Batch>) => Promise<void>;
  updateLeadAssignedTo: (data: {userID: number, leadID: number}) => Promise<void>;
  updateLeadStatus: (data: {status: string, leadID: number}) => Promise<void>;
  handleResetNeededLeads: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextType>({
  leads: [],
  users: [],
  batches: [],
  accounts: [],
  dashboardStats: null,
  fetchLeads: async () => {},
  fetchUsers: async () => {},
  fetchBatches: async () => {},
  fetchAccounts: async () => {},
  fetchDashboardStats: async () => {},
  createBatch: async () => {},
  updateLeadAssignedTo: async () => {},
  updateLeadStatus: async() => {},
  handleResetNeededLeads: async() => {}
});

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `${token}`;
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error('Failed to fetch ' + url);
    return res.json();
  };

  const fetchLeads = useCallback(async () => {
    const data = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/leads/`);
    setLeads(Array.isArray(data) ? data : data.leads || []);
  }, []);

  const fetchUsers = useCallback(async () => {
    const data = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/employee/`);
    console.log(data)
    setUsers(data.employees);
  }, []);

  const handleResetNeededLeads = useCallback(async () => {
    const data = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/reset-allot-leads/`);
    console.log(data)
  }, [])

  const fetchBatches = useCallback(async () => {
    const data = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/batch/`);
    setBatches(Array.isArray(data) ? data : data.batches || []);
  }, []);

  const updateLeadAssignedTo = useCallback(async (data: {userID: number, leadID: number}) => {
    const payload = {
        'assigned_to': data.userID,
        'id': data.leadID
    }
    await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/leads/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        });
    await fetchLeads();
    await fetchDashboardStats();
    }, [fetchLeads]) 


const updateLeadStatus = useCallback(async (data: {status: string, leadID: number}) => {
        const payload = {
            'status': data.status,
            'id': data.leadID
        }
        await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/leads/`, {
            method: "PATCH",
            body: JSON.stringify(payload),
            });
        await fetchLeads();
        await fetchDashboardStats();
        }, [fetchLeads])     

  const fetchAccounts = useCallback(async () => {
    const data = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/leads/`);
    setAccounts(Array.isArray(data) ? data : data.accounts || []);
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    const data = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard-stats/`);
    setDashboardStats(data);
  }, []);

  const createBatch = useCallback(async (batch: Partial<Batch>) => {
    const payload = {
        name: batch.name,
        price: batch.batchPrice,
        book_price: batch.booksPrice,
        status: batch.status
    }
    await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/batch/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await fetchBatches(); // Refresh batches after creation
  }, [fetchBatches]);

  return (
    <AdminContext.Provider value={{
      leads,
      users,
      batches,
      accounts,
      dashboardStats,
      fetchLeads,
      fetchUsers,
      fetchBatches,
      fetchAccounts,
      fetchDashboardStats,
      createBatch,
      updateLeadAssignedTo,
      updateLeadStatus,
      handleResetNeededLeads
    }}>
      {children}
    </AdminContext.Provider>
  );
}; 