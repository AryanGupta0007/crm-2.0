export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'operations' | 'accounts';
  avatar?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: 'new' | 'pick' | 'dnp' | 'contacted' | 'callback' | 'not_interested' | 'delete';
  academics: {
    class12: boolean;
    pcm: boolean;
    english: boolean;
  };
  batch?: string;
  books?: string;
  followUpDate?: string;
  comments: string[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  batch: string;
  books: string;
  amountPaid: number;
  paymentProof?: string;
  booksProof?: string;
  formProof?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  addedToGroup: boolean;
  registeredOnApp: boolean;
  comments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DemoAccount {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  batch: string;
  withBooks: boolean;
  amount: number;
  paymentProof?: string;
  booksProof?: string;
  formProof?: string;
  verification: 'unverified' | 'verified' | 'fake';
  comments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  dnpLeads: number;
}

export interface Batch {
  id: string;
  name: string;
  batchPrice: number;
  booksPrice: number;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CallerStats {
  id: string;
  name: string;
  email: string;
  assignedLeads: number;
  remainingLeads: number;
  closedDeals: number;
  revenueGenerated: number;
  neededLeads: number;
}