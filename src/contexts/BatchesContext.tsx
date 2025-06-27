import React, { createContext, useState, useCallback } from 'react';
import type { Batch } from '../types';

interface BatchesContextType {
  batches: Batch[];
  fetchBatches: () => Promise<void>;
}

export const BatchesContext = createContext<BatchesContextType>({
  batches: [],
  fetchBatches: async () => {},
});

export const BatchesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<Batch[]>([]);

  const fetchBatches = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gen/batches`, { headers });
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches);
      }
    } catch (err) {
      // handle error
    }
  }, []);

  return (
    <BatchesContext.Provider value={{ batches, fetchBatches }}>
      {children}
    </BatchesContext.Provider>
  );
}; 