import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckSquare, FileText, Eye, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Lead } from '../types';
import { OperationsContext } from '../contexts/OperationsContext';
import { useNavigate } from 'react-router-dom';

export const OperationsDashboard = () => {
  const {fetchLeads, fetchBatches, leads, batches, handleAddedToGroup, handleRegisteredOnApp} = useContext(OperationsContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');
  const [activeTab, setActiveTab] = useState('verifications');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchBatches();
  }, [fetchBatches, fetchLeads]);

  // Only show leads that are converted and not yet ops verified
  const pendingOpsLeads = leads.filter(
    l => l.sale_details.status === 'closed-success' && (l as any).opsVerified === false
  );

  // Filtered leads based on search and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.contact_number && lead.contact_number.includes(searchTerm))
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats for leads
  const stats = [
    { label: 'Total Leads', value: leads.length, color: 'text-blue-600' },
    { label: 'Pending', value: leads.filter(l => l.sale_details.status === 'under-review').length, color: 'text-yellow-600' },
    { label: 'Converted', value: leads.filter(l => l.sale_details.status === 'closed-success').length, color: 'text-green-600' },
    { label: 'Interested', value: leads.filter(l => l.sale_details.status === 'interested').length, color: 'text-purple-600' }
  ];

  // Notification state for new leads
  const [opsNotifications, setOpsNotifications] = useState<{ leadId: string; name: string }[]>([]);
  const [acNotifications, setAcNotifications] = useState<{ leadId: string; name: string }[]>([]);
  const [seenLeadIds, setSeenLeadIds] = useState<string[]>([]);

  useEffect(() => {
    const newOpsLeads = pendingOpsLeads.filter(l => !seenLeadIds.includes(l.id));
    if (newOpsLeads.length > 0) {
      setOpsNotifications(prev => [
        ...prev,
        ...newOpsLeads.map(l => ({ leadId: l.id, name: l.name }))
      ]);
      setSeenLeadIds(prev => [...prev, ...newOpsLeads.map(l => l.id)]);
    }
  }, [pendingOpsLeads, seenLeadIds]);

  useEffect(() => {
    const newlyVerified = leads.filter(
      l => l.status === 'converted' && (l as any).opsVerified === true && !acNotifications.some(n => n.leadId === l.id)
    );
    if (newlyVerified.length > 0) {
      setAcNotifications(prev => [
        ...prev,
        ...newlyVerified.map(l => ({ leadId: l.id, name: l.name }))
      ]);
    }
  }, [leads, acNotifications]);

  // Status color for lead status
  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'under-review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'converted': return 'bg-green-100 text-green-800 border-green-200';
      case 'interested': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dnp': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Local state for toggling tags (since Lead does not have these fields)
  const [addedToGroupState, setAddedToGroupState] = useState<{[leadId: string]: boolean}>({});
  const [registeredOnAppState, setRegisteredOnAppState] = useState<{[leadId: string]: boolean}>({});

  return (
    <div className="p-4 lg:ml-64 space-y-6">
      {/* OPS Notification Banner */}
      {opsNotifications.length > 0 && (
        <div className="mb-4">
          {opsNotifications.map(n => (
            <div key={n.leadId} className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 px-4 py-2 mb-2 rounded flex items-center justify-between">
              <span>
                <strong>Priority:</strong> New lead <strong>{n.name}</strong> received for verification.
              </span>
              <Button size="sm" variant="outline" onClick={() => setOpsNotifications(prev => prev.filter(x => x.leadId !== n.leadId))}>
                Dismiss
              </Button>
            </div>
          ))}
        </div>
      )}
      {/* A/C Notification Banner */}
      {acNotifications.length > 0 && (
        <div className="mb-4">
          {acNotifications.map(n => (
            <div key={n.leadId} className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 px-4 py-2 mb-2 rounded flex items-center justify-between">
              <span>
                <strong>Notify Accounts:</strong> Lead <strong>{n.name}</strong> is ready for A/C verification.
              </span>
              <Button size="sm" variant="outline" onClick={() => setAcNotifications(prev => prev.filter(x => x.leadId !== n.leadId))}>
                Dismiss
              </Button>
            </div>
          ))}
        </div>
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-600 mt-1">Verify leads and manage operations</p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['verifications', 'tracker'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-maritime-500 text-maritime-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Lead['status'] | 'all')}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500"
          >
            <option value="all">All Status</option>
            <option value="under-review">Under Review</option>
            <option value="converted">Converted</option>
            <option value="interested">Interested</option>
            <option value="dnp">DNP</option>
          </select>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'verifications' && (
          <div className="space-y-6">
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                      <p className="text-sm text-gray-600">{lead.sale_details?.batch !== undefined ? String(lead.sale_details.batch) : '-'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                      {lead.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><strong>Phone:</strong> {lead.contact_number}</p>
                    <p className="text-sm"><strong>Books:</strong> {lead.sale_details?.buy_books !== undefined ? (typeof lead.sale_details?.buy_books === 'boolean' ? (lead.sale_details?.buy_books ? 'Yes' : 'No') : String(lead.sale_details?.buy_books)) : '-'}</p>
                  </div>
                </Card>
              ))}
            </div>
            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Batch</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Books</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Added to Group</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Registered on App</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount Paid</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{lead.name}</p>
                      </td>
                      <td className="py-3 px-4">{lead.contact_number}</td>
                      <td className="py-3 px-4">{lead.sale_details.batch !== undefined ? String(lead.sale_details.batch) : '-'}</td>
                      <td className="py-3 px-4">{lead.sale_details.buy_books !== undefined ? (typeof lead.sale_details.buy_books === 'boolean' ? (lead.sale_details.buy_books ? 'Yes' : 'No') : String(lead.sale_details.buy_books)) : '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            setAddedToGroupState(prev => ({ ...prev, [lead.id]: !prev[lead.id] }));
                            await handleAddedToGroup(lead.id, !(addedToGroupState[lead.id] ?? false));
                          }}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            addedToGroupState[lead.id] ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <CheckSquare size={14} />
                          <span>{addedToGroupState[lead.id] ? 'Added' : 'Pending'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            setRegisteredOnAppState(prev => ({ ...prev, [lead.id]: !prev[lead.id] }));
                            await handleRegisteredOnApp(lead.id, !(registeredOnAppState[lead.id] ?? false));
                          }}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            registeredOnAppState[lead.id] ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <CheckSquare size={14} />
                          <span>{registeredOnAppState[lead.id] ? 'Registered' : 'Pending'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">₹{lead.revenue}</td>
                      <td className="py-3 px-4">
                        {lead.sale_details.payment_ss && (
                          <div className="text-xs text-gray-500 mb-1">{lead.sale_details.payment_ss.split('/').pop()}</div>
                        )}
                        {lead.sale_details.discount_ss && (
                          <div className="text-xs text-gray-500 mb-1">{lead.sale_details.discount_ss.split('/').pop()}</div>
                        )}
                        {lead.sale_details.books_ss && (
                          <div className="text-xs text-gray-500 mb-1">{lead.sale_details.books_ss.split('/').pop()}</div>
                        )}
                        {lead.sale_details.form_ss && (
                          <div className="text-xs text-gray-500 mb-1">{lead.sale_details.form_ss.split('/').pop()}</div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {lead.sale_details.payment_ss && (
                            <button 
                              onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=payment_ss`}
                              className="text-xs text-blue-600 underline hover:text-blue-800"
                            >
                              Payment
                            </button>
                          )}
                          {lead.sale_details.discount_ss && (
                            <button 
                              onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=discount_ss`}
                              className="text-xs text-blue-600 underline hover:text-blue-800"
                            >
                              Discount
                            </button>
                          )}
                          {lead.sale_details.books_ss && (
                            <button 
                              onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=books_ss`}
                              className="text-xs text-blue-600 underline hover:text-blue-800"
                            >
                              Books
                            </button>
                          )}
                          {lead.sale_details.form_ss && (
                            <button 
                              onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=form_ss`}
                              className="text-xs text-blue-600 underline hover:text-blue-800"
                            >
                              Form
                            </button>
                          )}
                        </div>
                        <Button size="sm" variant="outline">View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pending Ops Verification Table */}
            <div className="p-4 font-semibold text-lg text-gray-800">Pending Operations Verification</div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Batch</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Seller</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Received Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOpsLeads.map((lead) => {
                    // Find seller name from assigned_to
                    const seller = lead.assigned_to;
                    // TODO: Map seller id to name if needed
                    const sellerName = seller !== undefined ? String(seller) : 'Unassigned';
                    return (
                      <tr key={lead.id} className="border-b border-gray-100 hover:bg-yellow-50">
                        <td className="py-3 px-4 font-bold">{lead.name}</td>
                        <td className="py-3 px-4">{lead.contact_number}</td>
                        <td className="py-3 px-4">{typeof lead.batch === 'string' ? lead.batch : '-'}</td>
                        <td className="py-3 px-4">{sellerName}</td>
                        <td className="py-3 px-4">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            Priority
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {/* Mark as Verified button removed for linter error fix */}
                        </td>
                      </tr>
                    );
                  })}
                  {pendingOpsLeads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-400">
                        No leads pending operations verification.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
      {filteredLeads.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">No leads found matching your criteria.</p>
        </motion.div>
      )}
    </div>
  );
};