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
      const res = await fetch('http://localhost:8000/api/gen/batches');
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