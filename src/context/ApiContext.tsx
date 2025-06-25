import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lead, Account, DashboardStats, Batch } from '../types';
import { useAuth } from './AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
}

interface ApiContextType {
  users: User[];
  leads: Lead[];
  accounts: Account[];
  batches: Batch[];
  dashboardStats: DashboardStats | null;
  fetchUsers: () => void;
  fetchLeads: () => void;
  fetchAccounts: () => void;
  fetchBatches: () => void;
  fetchDashboardStats: () => void;
  loading: boolean;
  error: string | null;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetchWithAuth ensures the Authorization header is sent for all requests except login/register
  const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Request failed: ${url}`);
    }
    return response.json();
  };

  const fetchUsers = async () => {
    try {
      const data = await fetchWithAuth('http://localhost:8000/api/admin/employee/');
      setUsers(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchLeads = async () => {
    try {
      const data = await fetchWithAuth('http://localhost:8000/api/admin/leads/');
      setLeads(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await fetchWithAuth('http://localhost:8000/api/admin/leads/');
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await fetchWithAuth('http://localhost:8000/api/admin/batch/');
      setBatches(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const data = await fetchWithAuth('http://localhost:8000/api/admin/dashboard-stats/');
      setDashboardStats(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([
      // fetchUsers(),
      fetchLeads(),
      fetchAccounts(),
      fetchBatches(),
      fetchDashboardStats(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  return (
    <ApiContext.Provider value={{
      users,
      leads,
      accounts,
      batches,
      dashboardStats,
      fetchUsers,
      fetchLeads,
      fetchAccounts,
      fetchBatches,
      fetchDashboardStats,
      loading,
      error
    }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) throw new Error('useApi must be used within ApiProvider');
  return context;
}; 