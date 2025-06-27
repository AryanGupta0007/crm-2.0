import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Users, BookOpen, DollarSign, Eye, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { Lead, Batch } from '../types';
import { AccountsContext } from '../contexts/AccountsContext';
import { useNavigate } from 'react-router-dom';

export const AccountsDashboard = () => {
  const { leads, fetchLeads, batches, fetchBatches, handleMarkAsFake, handleVerificationUpdate } = useContext(AccountsContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [fakeNotifications, setFakeNotifications] = useState<{ id: string; name: string }[]>([]);
  const [reuploadProofs, setReuploadProofs] = useState<{ [leadId: string]: File | null }>({});
  const [fakeDates, setFakeDates] = useState<{ [leadId: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchBatches && fetchBatches();
  }, [fetchLeads, fetchBatches]);

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Lead['sale_details']['status']) => {
    switch (status) {
      case 'closed-success': return 'bg-green-100 text-green-800 border-green-200';
      case 'under-review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interested': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  // Handler for re-upload proof (TODO: implement as per backend)
  const handleReuploadProof = (leadId: string, file: File | null) => {
    // Implementation of handleReuploadProof
  };

  // Helper to render proof (image/pdf) responsively (TODO: connect to lead fields if available)
  const renderProof = (fileUrl: string | File | undefined) => {
    if (!fileUrl) return null;
    let url = '';
    if (typeof fileUrl === 'string') {
      url = fileUrl;
    } else if (fileUrl instanceof File) {
      url = URL.createObjectURL(fileUrl);
    }
    if (url.endsWith('.pdf') || (fileUrl instanceof File && fileUrl.type === 'application/pdf')) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline break-all">
          View PDF
        </a>
      );
    }
    // Assume image
    return (
      <img
        src={url}
        alt="Proof"
        className="max-w-full h-auto rounded shadow border mt-1"
        style={{ maxHeight: 200, objectFit: 'contain' }}
      />
    );
  };

  // Stats
  const stats = [
    { label: 'Total Leads', value: leads.length, color: 'text-blue-600' },
    { label: 'Converted', value: leads.filter(l => l.sale_details.status === 'closed-success').length, color: 'text-green-600' },
    { label: 'Under Review', value: leads.filter(l => l.sale_details.status === 'under-review').length, color: 'text-yellow-600' },
    { label: 'Interested', value: leads.filter(l => l.sale_details.status === 'interested').length, color: 'text-purple-600' }
  ];

  return (
    <div className="p-4 lg:ml-64 space-y-6">
      {/* Fake Notification Banner */}
      {fakeNotifications.length > 0 && (
        <div className="mb-4">
          {fakeNotifications.map(n => (
            <div key={n.id} className="bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-2 mb-2 rounded flex items-center justify-between">
              <span>
                <strong>Marked as Fake:</strong> Lead <strong>{n.name}</strong> has been marked as fake.
              </span>
              <Button size="sm" variant="outline" onClick={() => setFakeNotifications(prev => prev.filter(x => x.id !== n.id))}>
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
          <h1 className="text-3xl font-bold text-gray-900">Accounts Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and track student leads</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and View Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search leads by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500"
              />
            </div>
          </div>
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

      {/* Leads List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">With Books</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Received Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Payment Proof</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Discount Proof</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Books Proof</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Form Proof</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Comments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Verification</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className={`border-b border-gray-100 hover:bg-gray-50`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{lead.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.sale_details.status)}`}>
                        {lead.sale_details.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{lead.sale_details.batch?.toString()}</td>
                    <td className="py-3 px-4">
                      <span className={lead.sale_details.buy_books ? 'text-green-600' : 'text-red-600'}>
                        {lead.sale_details.buy_books ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4">₹{lead.revenue !== undefined ? lead.revenue : '-'}</td>
                    <td className="py-3 px-4">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4">{lead.sale_details.payment_ss ? (
                      <>
                        <button 
                          onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=payment_ss`}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          View Proof
                        </button>
                        <div className="text-xs text-gray-500">{lead.sale_details.payment_ss.split('/').pop()}</div>
                      </>
                    ) : "-"}</td>
                    <td className="py-3 px-4">{lead.sale_details.discount_ss ? (
                      <>
                        <button 
                          onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=discount_ss`}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          View Proof
                        </button>
                        <div className="text-xs text-gray-500">{lead.sale_details.discount_ss.split('/').pop()}</div>
                      </>
                    ) : "-"}</td>
                    <td className="py-3 px-4">{lead.sale_details.books_ss ? (
                      <>
                        <button 
                          onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=books_ss`}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          View Proof
                        </button>
                        <div className="text-xs text-gray-500">{lead.sale_details.books_ss.split('/').pop()}</div>
                      </>
                    ) : "-"}</td>
                    <td className="py-3 px-4">{lead.sale_details.form_ss ? (
                      <>
                        <button 
                          onClick={() => window.location.href = `/proof?leadId=${lead.id}&field=form_ss`}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          View Proof
                        </button>
                        <div className="text-xs text-gray-500">{lead.sale_details.form_ss.split('/').pop()}</div>
                      </>
                    ) : "-"}</td>
                    <td className="py-3 px-4">{lead.sale_details.comment ? lead.sale_details.comment : ''}</td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.account_details && lead.account_details.payment_verification_status ? lead.account_details.payment_verification_status : 'unverified'}
                        onChange={e => handleVerificationUpdate(lead.id, e.target.value)}
                        className="px-2 py-1 rounded border border-gray-300 text-sm"
                      >
                        <option value="unverified">Unverified</option>
                        <option value="verified">Verified</option>
                        <option value="fake">Fake</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsFake(lead.id)}
                        >
                          <XCircle size={14} className="mr-1" />
                          Mark as Fake
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className={`p-4`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                    <p className="text-sm text-gray-600">{lead.sale_details.batch?.toString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.sale_details.status)}`}>
                    {lead.sale_details.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Books:</span>{' '}
                    <span className={lead.sale_details.buy_books ? 'text-green-600' : 'text-red-600'}>
                      {lead.sale_details.buy_books ? 'Provided' : 'Pending'}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Received:</span>{' '}
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                  </p>
                  <div className="text-sm">
                    <span className="font-medium">Latest Comment:</span>
                    <p className="text-gray-600 mt-1">{lead.sale_details.comment}</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsFake(lead.id)}
                    >
                      <XCircle size={14} className="mr-1" />
                      Mark as Fake
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
