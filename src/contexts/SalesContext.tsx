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
  uploadSaleProofs: (leadId: string, file: File, proofType: string) => Promise<void>;
  handleSaleStatusUpdate: (leadId: string, status: string) => Promise<void>;
  handleBatchUpdate: (leadId: string, status: string) => Promise<void>;
  handleEnglishScoreUpdate: (leadId: string, score: string) => Promise<void>;
  handlePCMScoreUpdate: (leadId: string, score: string) => Promise<void>;
  handleBookUpdate: (leadId: string, books: boolean) => Promise<void>;
  handlefollowUpUpdate: (leadId: string, date: string) => Promise<void>;
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
  handleStatusUpdate: async() => {},
  uploadSaleProofs: async () => {},
  handleSaleStatusUpdate: async () => {},
  handleBatchUpdate: async () => {},
  handleEnglishScoreUpdate: async () => {},
  handlePCMScoreUpdate: async () => {},
  handleBookUpdate: async () => {},
  handlefollowUpUpdate: async () => {},
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
      'comment': comment // This is updating status, not adding a comment.
    };
    await fetchWithAuth('http://localhost:8000/api/sales/leads/', {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    await fetchLeads();
  }, [fetchLeads]);

  
  const handleSaleStatusUpdate = useCallback(async (leadId: string, status: string) => {
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


    const handleBatchUpdate = useCallback(async (leadId: string, status: string) => {
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


      const handleEnglishScoreUpdate = useCallback(async (leadId: string, score: string) => {
        const payload = {
            'id': leadId,
            'english_score': score
        }
        await fetchWithAuth('http://localhost:8000/api/sales/boardScore/', {
            method: "PATCH",
            body: JSON.stringify(payload),
            });
        await fetchLeads();
        }, [fetchLeads]);
  

      const handlePCMScoreUpdate = useCallback(async (leadId: string, score: string) => {
        const payload = {
            'id': leadId,
            'pcm_score': score
        }
        await fetchWithAuth('http://localhost:8000/api/sales/boardScore/', {
            method: "PATCH",
            body: JSON.stringify(payload),
            });
        await fetchLeads();
        }, [fetchLeads]);
              
        

      const handleBookUpdate = useCallback(async (leadId: string, books: boolean) => {
        const payload = {
            'id': leadId,
            'buy_books': books
        }
        await fetchWithAuth('http://localhost:8000/api/sales/leads/', {
            method: "PATCH",
            body: JSON.stringify(payload),
            });
        await fetchLeads();
        }, [fetchLeads]);


        const handlefollowUpUpdate = useCallback(async (leadId: string, date: string) => {
          const payload = {
              'id': leadId,
              'followUpDate': date
          }
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
    await fetchWithAuth('http://localhost:8000/api/sales/lead/', {
        method: "PATCH",
        body: JSON.stringify(payload),
        });
    await fetchLeads();
    }, [fetchLeads]);

  // Upload sale proofs (images) for a lead
  const uploadSaleProofs = async (leadId: string, file: File, proofType: string) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { ...(token ? { 'Authorization': `${token}` } : {}) };
    const formData = new FormData();
    formData.append('id', leadId);
    if (proofType === "payment_proof"){
      formData.append("payment_ss", file);
    }
    await fetch('http://localhost:8000/api/sales/leads/', {
      method: 'PATCH',
      headers,
      body: formData,
    });
    await fetchLeads();
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
      handleAddComment,
      handleStatusUpdate,
      uploadSaleProofs,
      handleSaleStatusUpdate,
      handleBatchUpdate,
      handleEnglishScoreUpdate,
      handlePCMScoreUpdate,
      handleBookUpdate,
      handlefollowUpUpdate,
    }}>
      {children}
    </SalesContext.Provider>
  );
}; 