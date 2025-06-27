import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone } from 'lucide-react';
import { LeadCard } from '../components/leads/LeadCard';
import { Button } from '../components/ui/Button';
import { Lead, Batch } from '../types';
import { format } from 'date-fns';
import { SalesContext } from '../contexts/SalesContext';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const SalesDashboard = () => {
  const {
    leads,
    fetchLeads,
    batches,
    fetchBatches,
    updateLead,
    handleAddComment,
    handleStatusUpdate,
    uploadSaleProofs,
    fetchUsers,
    users,
    handleSaleStatusUpdate,
    handleBatchUpdate,
    handleEnglishScoreUpdate,
    handlePCMScoreUpdate,
    handleBookUpdate,
    handlefollowUpUpdate,
    handleDiscountUpdate
  } = useContext(SalesContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [imageInputs, setImageInputs] = useState<{[leadId: string]: (File | null)[]}>({});
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});
  const [uploadSuccess, setUploadSuccess] = useState<{[key: string]: boolean}>({});
  const [commentEdits, setCommentEdits] = useState<{[leadId: string]: string | undefined}>({});
  const [commentSaving, setCommentSaving] = useState<{[leadId: string]: boolean}>({});
  const navigate = useNavigate();

  const proofColumns = ['payment_proof', 'discount_proof', 'books_proof', 'form_proof'];

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
      (lead.sale_details.comment && lead.sale_details.comment.toLowerCase().includes('fake'))
    );
  };

  const isPendingOps = (lead: Lead) => lead.status === 'converted' && (lead as any).opsVerified === false;

  const handleImageInputChange = (leadId: string, idx: number, file: File | null) => {
    setImageInputs(prev => ({
      ...prev,
      [leadId]: prev[leadId]
        ? prev[leadId].map((f, i) => (i === idx ? file : f))
        : Array(4).fill(null).map((f, i) => (i === idx ? file : null)),
    }));

    if (file) {
      const proofType = proofColumns[idx];
      setUploading(prev => ({ ...prev, [`${leadId}_${proofType}`]: true }));
      uploadSaleProofs(leadId, file, proofType)
        .then(() => {
          setUploadSuccess(prev => ({ ...prev, [`${leadId}_${proofType}`]: true }));
          setTimeout(() => setUploadSuccess(prev => ({ ...prev, [`${leadId}_${proofType}`]: false })), 2000);
        })
        .catch(() => {
          setUploadSuccess(prev => ({ ...prev, [`${leadId}_${proofType}`]: false }));
        })
        .finally(() => {
          setUploading(prev => ({ ...prev, [`${leadId}_${proofType}`]: false }));
          setImageInputs(prev => ({
            ...prev,
            [leadId]: prev[leadId]
              ? prev[leadId].map((f, i) => (i === idx ? null : f))
              : Array(4).fill(null),
          }));
        });
    }
  };

  // Helper to update a single lead's comment in the leads array
  const updateLeadCommentLocally = (leadId: string, comment: string) => {
    setCommentEdits(prev => {
      const newEdits = { ...prev };
      delete newEdits[leadId];
      return newEdits;
    });
  };

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
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Books</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Discount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Follow Up</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Comments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Sales Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <>
                    <tr
                      key={lead.id}
                      className={`border-b border-gray-100 hover:bg-gray-50`}
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{lead.name}</p>
                      </td>
                      <td className="py-3 px-4">{lead.contact_number}</td>
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
                          <option value="not-interested">NA</option>
                          <option value="closed-success">CLOSED SUCCESS</option>
                          <option value="under-review">UNDER REVIEW</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-2">
                          <select
                            className="text-sm border rounded p-1.5 w-full bg-green-100"
                            value={lead.board_score.pcm_score?.toString() || ''}
                            onChange={e => handlePCMScoreUpdate(lead.id, e.target.value)}
                          >
                            <option value="">PCM Score</option>
                            <option value="{'<60'}">{'<60'}</option>
                            <option value="{'60 AND <65'}">{'60 AND <65'}</option>
                            <option value="{'65 AND <70'}">{'65 AND <70'}</option>
                            <option value="{'70 AND <80'}">{'70 AND <80'}</option>
                            <option value="{'80 AND <90'}">{'80 AND <90'}</option>
                            <option value=">90">{'>'}90</option>
                          </select>
                          <select
                            className="text-sm border rounded p-1.5 w-full bg-green-100"
                            value={lead.board_score.english_score?.toString() || ''}
                            onChange={e => handleEnglishScoreUpdate(lead.id, e.target.value)}
                          >
                            <option value="">English Score</option>
                            <option value="{'<60'}">{'<60'}</option>
                            <option value="{'60 AND <65'}">{'60 AND <65'}</option>
                            <option value="{'65 AND <70'}">{'65 AND <70'}</option>
                            <option value="{'70 AND <80'}">{'70 AND <80'}</option>
                            <option value="{'80 AND <90'}">{'80 AND <90'}</option>
                            <option value=">90">{'>'}90</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="text-sm border rounded p-1.5 w-full bg-green-100"
                          value={lead.batch?.id?.toString() || ''}
                          onChange={e => handleBatchUpdate(lead.id, Number(e.target.value))}
                        >
                          <option value="">Select Batch</option>
                          {batches.map((batch) => (
                            <option key={batch.id} value={batch.id}>{batch.name}</option>
                          ))}
                        </select>
                      
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={Boolean(lead.sale_details.buy_books)}
                          onChange={e => handleBookUpdate(lead.id, e.target.checked)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={Boolean(lead.sale_details.discount)}
                          onChange={e => handleDiscountUpdate(lead.id, e.target.checked)}
                        />
                      </td>
                      
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          className="text-sm border rounded p-1.5 w-full bg-green-100"
                          value={lead.sale_details.followUpDate ? new Date(lead.sale_details.followUpDate).toISOString().split('T')[0] : ''}
                          onChange={e => handlefollowUpUpdate(lead.id, e.target.value)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <textarea
                          className="text-sm border rounded p-1.5 w-full bg-green-100 resize-y min-h-[60px]"
                          value={commentEdits[lead.id] !== undefined ? commentEdits[lead.id] : (lead.sale_details.comment || '')}
                          placeholder="Add comment"
                          rows={3}
                          onChange={e => setCommentEdits(prev => ({ ...prev, [lead.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          className="mt-2"
                          disabled={commentSaving[lead.id]}
                          onClick={async () => {
                            setCommentSaving(prev => ({ ...prev, [lead.id]: true }));
                            await handleAddComment(lead.id, commentEdits[lead.id] || '');
                            updateLeadCommentLocally(lead.id, commentEdits[lead.id] || '');
                            setCommentSaving(prev => ({ ...prev, [lead.id]: false }));
                          }}
                        >
                          {commentSaving[lead.id] ? 'Saving...' : 'Save'}
                        </Button>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="text-sm border rounded p-1.5 w-full bg-green-100"
                          value={lead.sale_details.status}
                          onChange={e => handleSaleStatusUpdate(lead.id, e.target.value as Lead['status'])}
                        >
                          <option value="new">NEW</option>
                          <option value="pick">PICK</option>
                          <option value="dnp">DNP</option>
                          <option value="contacted">CTC</option>
                          <option value="callback">CB</option>
                          <option value="not-interested">NA</option>
                          <option value="closed-success">CLOSED SUCCESS</option>
                          <option value="under-review">UNDER REVIEW</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2 items-center">
                          <a href={`tel:${lead.contact_number}`}>
                            <Button size="sm" variant="outline">
                              <Phone size={14} />
                            </Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                    {lead.status === 'closed-success' && (
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <td colSpan={11} className="py-4 px-4">
                          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                            {/* Payment Proof */}
                            <div className="flex flex-col items-center">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Proof</label>
                              {lead.sale_details.payment_ss && (
                                <span className="text-xs text-gray-500 mb-1">
                                  Uploaded: {lead.sale_details.payment_ss.split('/').pop()} {' '}
                                  <button 
                                    onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=payment_ss`}
                                    className="text-blue-600 underline ml-1 cursor-pointer"
                                  >
                                    View
                                  </button>
                                </span>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleImageInputChange(lead.id, 0, e.target.files?.[0] || null)}
                                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-maritime-50 file:text-maritime-700 hover:file:bg-maritime-100"
                              />
                              {uploading[`${lead.id}_payment_proof`] && (
                                <span className="text-xs text-blue-500 mt-1">Uploading...</span>
                              )}
                              {uploadSuccess[`${lead.id}_payment_proof`] && (
                                <span className="text-xs text-green-600 mt-1">Uploaded!</span>
                              )}
                              {imageInputs[lead.id]?.[0] instanceof File && (
                                <img
                                  src={URL.createObjectURL(imageInputs[lead.id][0] as File)}
                                  alt={`Preview Payment Proof`}
                                  className="mt-2 rounded shadow border max-h-24"
                                />
                              )}
                            </div>
                            {/* Discount Proof */}
                            {lead.sale_details.discount && (
                              <div className="flex flex-col items-center">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Discount Proof</label>
                                {lead.sale_details.discount_ss && (
                                  <span className="text-xs text-gray-500 mb-1">
                                    Uploaded: {lead.sale_details.discount_ss.split('/').pop()} {' '}
                                    <button 
                                      onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=discount_ss`}
                                      className="text-blue-600 underline ml-1 cursor-pointer"
                                    >
                                      View
                                    </button>
                                  </span>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => handleImageInputChange(lead.id, 1, e.target.files?.[0] || null)}
                                  className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-maritime-50 file:text-maritime-700 hover:file:bg-maritime-100"
                                />
                                {uploading[`${lead.id}_discount_proof`] && (
                                  <span className="text-xs text-blue-500 mt-1">Uploading...</span>
                                )}
                                {uploadSuccess[`${lead.id}_discount_proof`] && (
                                  <span className="text-xs text-green-600 mt-1">Uploaded!</span>
                                )}
                                {imageInputs[lead.id]?.[1] instanceof File && (
                                  <img
                                    src={URL.createObjectURL(imageInputs[lead.id][1] as File)}
                                    alt={`Preview Discount Proof`}
                                    className="mt-2 rounded shadow border max-h-24"
                                  />
                                )}
                              </div>
                            )}
                            {/* Books Proof */}
                            {lead.sale_details.buy_books && (
                              <div className="flex flex-col items-center">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Books Proof</label>
                                {lead.sale_details.books_ss && (
                                  <span className="text-xs text-gray-500 mb-1">
                                    Uploaded: {lead.sale_details.books_ss.split('/').pop()} {' '}
                                    <button 
                                      onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=books_ss`}
                                      className="text-blue-600 underline ml-1 cursor-pointer"
                                    >
                                      View
                                    </button>
                                  </span>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => handleImageInputChange(lead.id, 2, e.target.files?.[0] || null)}
                                  className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-maritime-50 file:text-maritime-700 hover:file:bg-maritime-100"
                                />
                                {uploading[`${lead.id}_books_proof`] && (
                                  <span className="text-xs text-blue-500 mt-1">Uploading...</span>
                                )}
                                {uploadSuccess[`${lead.id}_books_proof`] && (
                                  <span className="text-xs text-green-600 mt-1">Uploaded!</span>
                                )}
                                {imageInputs[lead.id]?.[2] instanceof File && (
                                  <img
                                    src={URL.createObjectURL(imageInputs[lead.id][2] as File)}
                                    alt={`Preview Books Proof`}
                                    className="mt-2 rounded shadow border max-h-24"
                                  />
                                )}
                              </div>
                            )}
                            {/* Form Proof */}
                            <div className="flex flex-col items-center">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Form Proof</label>
                              {lead.sale_details.form_ss && (
                                <span className="text-xs text-gray-500 mb-1">
                                  Uploaded: {lead.sale_details.form_ss.split('/').pop()} {' '}
                                  <button 
                                    onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=form_ss`}
                                    className="text-blue-600 underline ml-1 cursor-pointer"
                                  >
                                    View
                                  </button>
                                </span>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleImageInputChange(lead.id, 3, e.target.files?.[0] || null)}
                                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-maritime-50 file:text-maritime-700 hover:file:bg-maritime-100"
                              />
                              {uploading[`${lead.id}_form_proof`] && (
                                <span className="text-xs text-blue-500 mt-1">Uploading...</span>
                              )}
                              {uploadSuccess[`${lead.id}_form_proof`] && (
                                <span className="text-xs text-green-600 mt-1">Uploaded!</span>
                              )}
                              {imageInputs[lead.id]?.[3] instanceof File && (
                                <img
                                  src={URL.createObjectURL(imageInputs[lead.id][3] as File)}
                                  alt={`Preview Form Proof`}
                                  className="mt-2 rounded shadow border max-h-24"
                                />
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};