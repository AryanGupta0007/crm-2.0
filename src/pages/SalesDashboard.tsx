import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Phone, Calendar } from 'lucide-react';
import { LeadCard } from '../components/leads/LeadCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lead } from '../types';
import { format } from 'date-fns';
import { SalesContext } from '../contexts/SalesContext';
export const SalesDashboard = () => {
  const { leads, fetchLeads, batches, fetchBatches} = useContext(SalesContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [editState, setEditState] = useState<{[leadId: string]: {books?: boolean; comment?: string; showSave?: boolean}}>({});
  const [discountProofs, setDiscountProofs] = useState<{ [leadId: string]: File | null }>({});

  useEffect(() => {
    console.log('fetching sales leads');
    fetchLeads();
    console.log(leads);
    fetchBatches();
  }, [fetchLeads, fetchBatches]);

  // Sort leads by createdAt ascending so new leads appear at the bottom
  const sortedLeads = [...leads].sort((a, b) => {
    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
    return aDate - bDate;
  });

  const filteredLeads = sortedLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact_number.includes(searchTerm) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Update handleStatusUpdate to set opsVerified: false when converted
  // const handleStatusUpdate = (leadId: string, status: Lead['status']) => {
  //   fetchLeads(prev =>
  //     prev.map(lead =>
  //       lead.id === leadId
  //         ? {
  //             ...lead,
  //             status,
  //             updatedAt: new Date().toISOString(),
  //             ...(status === 'converted' ? { opsVerified: false } : {})
  //           }
  //         : lead
  //     )
  //   );
  // };

  const handleAddComment = (leadId: string, comment: string) => {
    fetchLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, comments: [...lead.comments, comment], updatedAt: new Date().toISOString() }
        : lead
    ));
  };

  const handleBatchChange = (leadId: string, batch: string) => {
    fetchLeads(prev => prev.map(l => l.id === leadId ? { ...l, batch } : l));
  };
  const handleBooksChange = (leadId: string, checked: boolean) => {
    fetchLeads(prev => prev.map(l => l.id === leadId ? { ...l, books: checked } : l));
    setEditState(prev => ({...prev, [leadId]: {...prev[leadId], books: checked, showSave: true}}));
  };
  const handleCommentChange = (leadId: string, comment: string) => {
    fetchLeads(prev => prev.map(l => l.id === leadId ? { ...l, comments: [...l.comments.slice(0, -1), comment] } : l));
    setEditState(prev => ({...prev, [leadId]: {...prev[leadId], comment, showSave: true}}));
  };
  const handleSave = (leadId: string) => {
    setEditState(prev => ({...prev, [leadId]: {...prev[leadId], showSave: false}}));
    setTimeout(() => window.location.reload(), 1000);
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interested': return 'bg-green-100 text-green-800 border-green-200';
      case 'not_interested': return 'bg-red-100 text-red-800 border-red-200';
      case 'callback': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'converted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'dnp': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  const totalLeadsAssignedToday = leads.filter(
    l => l.createdAt && l.createdAt.startsWith(todayStr)
  ).length;

  // Helper to check if a lead is marked as fake (assuming a 'fake' status or a flag in comments)
  const isFakeLead = (lead: Lead) => {
    // If your Lead type has a 'verification' or 'isFake' property, use that.
    // Otherwise, check for a 'fake' keyword in comments as a fallback.
    return (
      (lead as any).verification === 'fake' ||
      (lead.comments && lead.comments.some(c => typeof c === 'string' && c.toLowerCase().includes('fake')))
    );
  };

  // Helper to check if a converted lead is pending ops verification
  const isPendingOps = (lead: Lead) => lead.status === 'converted' && (lead as any).opsVerified === false;

  return (
    <div className="p-4 lg:ml-64 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600 mt-1">Manage and convert your assigned leads</p>
        </div>
        {/* <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Calendar size={16} className="mr-2" />
            Schedule Follow-up
          </Button>
          <Button variant="primary">
            <Plus size={16} className="mr-2" />
            Add Lead
          </Button>
        </div> */}
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* New Card for Today's Assigned Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between"
        >
          <p className="text-sm font-medium text-gray-600">Leads Assigned Today</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalLeadsAssignedToday}</p>
          <p className="text-xs text-gray-400 mt-2">{format(new Date(), 'MMM dd, yyyy')}</p>
        </motion.div>
        {/* ...existing 4 stat cards... */}
       {[
  { label: 'Total Leads', value: leads.length, color: 'text-blue-600' },
  { label: 'Interested', value: leads.filter(l => l.status === 'interested').length, color: 'text-green-600' },
  { label: 'Callbacks', value: leads.filter(l => l.status === 'callback').length, color: 'text-purple-600' },
  { label: 'Converted', value: leads.filter(l => l.status === 'converted').length, color: 'text-emerald-600' }
].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </motion.div>
        ))}
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
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Lead['status'] | 'all')}
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

      {/* Leads Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {viewMode === 'cards' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className={isFakeLead(lead) ? 'border-2 border-red-500 rounded-lg' : ''}
              >
                <LeadCard
                  lead={lead}
                  onStatusUpdate={handleStatusUpdate}
                  onAddComment={handleAddComment}
                />
                {/* Show pending ops verification if converted */}
                {isPendingOps(lead) && (
                  <div className="p-2 bg-yellow-50 rounded-b-lg text-yellow-700 text-xs text-center font-medium">
                    Pending Operations Verification
                  </div>
                )}
                {/* Show re-upload proof option if fake */}
                {isFakeLead(lead) && (
                  <div className="p-3 bg-red-50 rounded-b-lg flex flex-col items-center">
                    <p className="text-red-700 text-sm mb-2 font-medium">This lead is marked as FAKE. Please re-upload proof for re-verification.</p>
                    <input
                      type="file"
                      id={`reupload-proof-${lead.id}`}
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          alert('Proof uploaded for re-verification!');
                        }
                      }}
                    />
                    <label htmlFor={`reupload-proof-${lead.id}`}>
                      <Button size="sm" variant="primary">
                        Re-upload Proof
                      </Button>
                    </label>
                  </div>
                )}
                {/* Discount Proof Section */}
                <div className="p-3 bg-blue-50 rounded-b-lg flex flex-col items-center mt-2">
                  <p className="text-blue-700 text-xs mb-2 font-medium">Discount Proof (if discount given)</p>
                  <input
                    type="file"
                    id={`discount-proof-${lead.id}`}
                    accept="image/jpeg,image/png,application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setDiscountProofs(prev => ({ ...prev, [lead.id]: file }));
                      if (file) alert('Discount proof uploaded!');
                    }}
                  />
                  <label htmlFor={`discount-proof-${lead.id}`}>
                    <Button size="xs" variant="outline">
                      {discountProofs[lead.id] ? 'Change File' : ' Uplopad'}
                    </Button>
                  </label>
                  {discountProofs[lead.id] && (
                    <span className="text-xs text-gray-500 mt-1">{discountProofs[lead.id]?.name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Call Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">12th Details</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Batch</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Books</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Follow Up</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Comments</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Sales Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`border-b border-gray-100 hover:bg-gray-50
                        ${isFakeLead(lead) ? 'bg-red-100' : ''}
                        ${isPendingOps(lead) ? 'bg-yellow-50' : ''}
                      `}
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{lead.name}</p>
                      </td>
                      <td className="py-3 px-4">{lead.phone}</td>
                      <td className="py-3 px-4">{lead.source}</td>
                      <td className="py-3 px-4">
                        <select
                          className="text-sm border rounded p-1.5 w-full bg-green-100"
                          value={lead.status}
                          onChange={e => handleStatusUpdate(lead.id, e.target.value as Lead['status'])}
                        >
                          <option value="new">NEW</option>
                          <option value="pick">PICK</option>
                          <option value="dnp">DNP</option>
                          <option value="contacted">CTC</option>
                          <option value="callback">CB</option>
                          <option value="not_interested">NA</option>
                          <option value="converted">CLOSED SUCCESS</option>
                          <option value="under_review">UNDER REVIEW</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-2">
                          <select
                            className="text-sm border rounded p-1.5 w-full bg-green-100"
                            value={lead.academics.pcmRange || ''}
                            onChange={e => {
                              fetchLeads(prev => prev.map(l => l.id === lead.id ? { ...l, academics: { ...l.academics, pcmRange: e.target.value } } : l));
                            }}
                          >
                            <option value="{'<60'}">{'<60'}</option>
                            <option value="{'60 AND <65'}">{'60 AND <65'}</option>
                            <option value="{'65 AND <70'}">{'65 AND <70'}</option>
                            <option value="{'70 AND <80'}">{'70 AND <80'}</option>
                            <option value="{'80 AND <90'}">{'80 AND <90'}</option>
                            <option value=">90">{'>'}90</option>
                          </select>
                          <select
                            className="text-sm border rounded p-1.5 w-full bg-green-100"
                            value={lead.academics.englishRange || ''}
                            onChange={e => {
                              fetchLeads(prev => prev.map(l => l.id === lead.id ? { ...l, academics: { ...l.academics, englishRange: e.target.value } } : l));
                            }}
                          >
                            <option value="{'<60'}">{'<60'}</option>
                            <option value="{'60 AND <65'}">{'60 AND <65'}</option>
                            <option value="{'65 AND <70'}">{'65 AND <70'}</option>
                            <option value="{'70 AND <80'}">{'70 AND <80'}</option>
                            <option value="{'80 AND <90'}">{'80 AND <90'}</option>
                            <option value=">90">{'>'}90</option>
                          </select>
                          <select
                            className="text-sm border rounded p-1.5 w-full bg-green-100"
                            value={lead.academics.boardYear || ''}
                            onChange={e => {
                              fetchLeads(prev => prev.map(l => l.id === lead.id ? { ...l, academics: { ...l.academics, boardYear: e.target.value } } : l));
                            }}
                          >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="text-sm border rounded p-1.5 w-full bg-green-100"
                          value={lead.batch || ''}
                          onChange={e => handleBatchChange(lead.id, e.target.value)}
                        >
                          <option value="">Select Batch</option>
                          {batches.map(batch => (
                            <option key={batch} value={batch}>{batch}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-green-600"
                          checked={!!lead.books}
                          onChange={e => handleBooksChange(lead.id, e.target.checked)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          className="text-sm border rounded p-1.5 w-full bg-green-100"
                          value={lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : ''}
                          onChange={e => fetchLeads(prev => prev.map(l => l.id === lead.id ? { ...l, followUpDate: e.target.value } : l))}
                        />
                      </td>
                      <td className="py-3 px-4">
                        {/* Replace input with textarea for comments */}
                        <textarea
                          className="text-sm border rounded p-1.5 w-full bg-green-100 resize-y min-h-[60px]"
                          value={lead.comments[lead.comments.length - 1] || ''}
                          onChange={e => handleCommentChange(lead.id, e.target.value)}
                          placeholder="Add comment"
                          rows={3}
                        />
                        {/* Show pending ops verification if converted */}
                        {isPendingOps(lead) && (
                          <div className="mt-2 text-xs text-yellow-700 font-medium">
                            Pending Operations Verification
                          </div>
                        )}
                        {/* Show re-upload proof option if fake */}
                        {isFakeLead(lead) && (
                          <div className="mt-2 flex flex-col items-start">
                            <span className="text-xs text-red-700 mb-1 font-medium">Marked as FAKE. Re-upload proof:</span>
                            <input
                              type="file"
                              id={`reupload-proof-table-${lead.id}`}
                              style={{ display: 'none' }}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  alert('Proof uploaded for re-verification!');
                                }
                              }}
                            />
                            <label htmlFor={`reupload-proof-table-${lead.id}`}>
                              <Button size="xs" variant="primary">
                                Re-upload Proof
                              </Button>
                            </label>
                          </div>
                        )}
                        {/* Discount Proof Section */}
                        <div className="mt-2 flex flex-col items-start">
                          <span className="text-xs text-blue-700 mb-1 font-medium">Discount Proof (if discount given):</span>
                          <input
                            type="file"
                            id={`discount-proof-table-${lead.id}`}
                            accept="image/jpeg,image/png,application/pdf"
                            style={{ display: 'none' }}
                            onChange={e => {
                              const file = e.target.files?.[0] || null;
                              setDiscountProofs(prev => ({ ...prev, [lead.id]: file }));
                              if (file) alert('Discount proof uploaded!');
                            }}
                          />
                          <label htmlFor={`discount-proof-table-${lead.id}`}>
                            <Button size="xs" variant="outline">
                              {discountProofs[lead.id] ? 'Change File' : 'Upload'}
                            </Button>
                          </label>
                          {discountProofs[lead.id] && (
                            <span className="text-xs text-gray-500 mt-1">{discountProofs[lead.id]?.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="text-sm border rounded p-1.5 w-full bg-green-100"
                          value={lead.status}
                          onChange={e => handleStatusUpdate(lead.id, e.target.value as Lead['status'])}
                        >
                          <option value="new">NEW</option>
                          <option value="pick">PICK</option>
                          <option value="dnp">DNP</option>
                          <option value="contacted">CTC</option>
                          <option value="callback">CB</option>
                          <option value="not_interested">NA</option>
                          <option value="converted">CLOSED SUCCESS</option>
                          <option value="under_review">UNDER REVIEW</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2 items-center">
                          <a href={`tel:${lead.phone}`}>
                            <Button size="sm" variant="outline">
                              <Phone size={14} />
                            </Button>
                          </a>
                          {editState[lead.id]?.showSave && (
                            <Button size="sm" variant="primary" onClick={() => handleSave(lead.id)}>
                              Save
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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