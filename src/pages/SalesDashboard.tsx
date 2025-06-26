import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone } from 'lucide-react';
import { LeadCard } from '../components/leads/LeadCard';
import { Button } from '../components/ui/Button';
import { Lead } from '../types';
import { format } from 'date-fns';
import { SalesContext } from '../contexts/SalesContext';

export const SalesDashboard = () => {
  const { leads, fetchLeads, batches, fetchBatches, updateLead, handleAddComment, fetchUsers, users,  handleStatusUpdate } = useContext(SalesContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    fetchUsers();
    fetchLeads();
    fetchBatches();
  }, []);

  const sortedLeads = [...leads].sort((a, b) => {
    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
    return aDate - bDate;
  });

  const filteredLeads = sortedLeads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_number.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interested': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed-success': return 'bg-red-100 text-red-800 border-red-200';
      case 'under-review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'converted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'dnp': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const totalLeadsAssignedToday = leads.filter(
    l => l.created_at && l.created_at.startsWith(todayStr)
  ).length;

  const isFakeLead = (lead: Lead) => {
    return (
      (lead as any).verification === 'fake' ||
      (lead.comments && lead.comments.some(c => typeof c === 'string' && c.toLowerCase().includes('fake')))
    );
  };

  const isPendingOps = (lead: Lead) => lead.status === 'converted' && (lead as any).opsVerified === false;

  return (
    <div className="p-4 lg:ml-64 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600 mt-1">Manage and convert your assigned leads</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between"
        >
          <p className="text-sm font-medium text-gray-600">Leads Assigned Today</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalLeadsAssignedToday}</p>
          <p className="text-xs text-gray-400 mt-2">{format(new Date(), 'MMM dd, yyyy')}</p>
        </motion.div> */}
        {[
          { label: 'Total Leads', value: leads.length, color: 'text-blue-600' },
          { label: 'Interested', value: leads.filter(l => l.sale_details.status === 'interested').length, color: 'text-green-600' },
          { label: 'Under Review', value: leads.filter(l => l.sale_details.status === 'under-review').length, color: 'text-purple-600' },
          { label: 'Closed', value: leads.filter(l => l.sale_details.status === 'closed-success').length, color: 'text-emerald-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            style={{position: "relative", left: "7vw"}}
          >
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search leads by name, phone, or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as Lead['status'] | 'all')}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="callback">Callback</option>
              <option value="not_interested">Not Interested</option>
              <option value="converted">Converted</option>
              <option value="dnp">DNP</option>
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {viewMode === 'cards' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map(lead => (
              <div
                key={lead.id}
                className={isFakeLead(lead) ? 'border-2 border-red-500 rounded-lg' : ''}
              >
                <LeadCard
                  lead={lead}
                  onStatusUpdate={handleStatusUpdate}
                  onAddComment={handleAddComment}
                />
                {isPendingOps(lead) && (
                  <div className="p-2 bg-yellow-50 rounded-b-lg text-yellow-700 text-xs text-center font-medium">
                    Pending Operations Verification
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Lead Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Update</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.source}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-800">{lead.contact_number}</p>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          lead.sale_details.status
                        )}`}
                      >
                        {lead.sale_details.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(lead.updated_at), 'MMM dd, hh:mm a')}
                    </td>
                    <td className="py-3 px-4">
                      <a href={`tel:${lead.contact_number}`}>
                        <Button variant="outline" size="sm">
                          <Phone size={14} className="mr-2" /> Call
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};