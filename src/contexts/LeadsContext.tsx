import React, { createContext, useState, useCallback } from 'react';
import { Lead } from '../types';

interface LeadsContextType {
  leads: Lead[];
  fetchLeads: () => Promise<void>;
}

export const LeadsContext = createContext<LeadsContextType>({
  leads: [],
  fetchLeads: async () => {},
});

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      }
    } catch (err) {
      // handle error
    }
  }, []);

  return (
    <LeadsContext.Provider value={{ leads, fetchLeads }}>
      {children}
    </LeadsContext.Provider>
  );
}; 