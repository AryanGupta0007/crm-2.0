export interface User {
  id: string;
  name: string;
  email: string;
  employee_details: {
    type: 'sales' | 'admin' | 'operations' | 'accounts';
  };
  avatar?: string;
}

export interface Lead {
  id: string;
  name: string;
  contact_number: string;
  email: string;
  source: string;
  status: 'new' | 'pick' | 'dnp' | 'contacted' | 'closed-success' | 'under-review' | 'delete' | 'interested' | 'converted';
  board_score: {
    pcm_score: string;
    english_score: string;
  };
  revenue: number;
  assigned_to: number;
  created_at: string;
  sale_details: {
    status: 'under-review' | 'interested' | 'closed-success',
    batch: Number,
    buy_books: Boolean,
    followUpDate: string,
    comment: string
  };
  account_details: {
    payment_verification_status: string
  }
  updated_at: string;
}

export interface Account {
  id: string;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  status: string;
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
  total_leads: number;
  active_leads: number;
  converted_leads: number;
  dnp_leads: number;
}

export interface SalesInterface{
  id: number,
}

export interface Batch {
  id: string;
  name: string;
  price: number;
  book_price: number;
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