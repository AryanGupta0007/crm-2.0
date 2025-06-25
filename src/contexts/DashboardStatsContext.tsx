import React, { createContext, useState, useCallback } from 'react';
import type { DashboardStats } from '../types';

interface DashboardStatsContextType {
  stats: DashboardStats;
  fetchStats: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  totalLeads: 0,
  activeLeads: 0,
  convertedLeads: 0,
  dnpLeads: 0,
};

export const DashboardStatsContext = createContext<DashboardStatsContextType>({
  stats: defaultStats,
  fetchStats: async () => {},
});

export const DashboardStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/dashboard-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      // handle error
    }
  }, []);

  return (
    <DashboardStatsContext.Provider value={{ stats, fetchStats }}>
      {children}
    </DashboardStatsContext.Provider>
  );
}; 