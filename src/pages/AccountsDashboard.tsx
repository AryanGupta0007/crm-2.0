import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Users, BookOpen, DollarSign, Eye, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { DemoAccount } from '../types';
import { AccountsContext } from '../contexts/AccountsContext';

export const AccountsDashboard = () => {
  const { accounts, fetchAccounts } = useContext(AccountsContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [fakeNotifications, setFakeNotifications] = useState<{ id: string; name: string }[]>([]);
  const [reuploadProofs, setReuploadProofs] = useState<{ [accountId: string]: File | null }>({});
  const [fakeDates, setFakeDates] = useState<{ [accountId: string]: string }>({});

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: DemoAccount['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fake': return 'bg-red-200 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handler for marking as fake
  const handleMarkAsFake = (account: DemoAccount) => {
    // Implementation of handleMarkAsFake
  };

  // Handler for re-upload proof
  const handleReuploadProof = (accountId: string, file: File | null) => {
    // Implementation of handleReuploadProof
  };

  // Helper to render proof (image/pdf) responsively
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

  return (
    <div className="p-4 lg:ml-64 space-y-6">
      {/* Fake Notification Banner */}
      {fakeNotifications.length > 0 && (
        <div className="mb-4">
          {fakeNotifications.map(n => (
            <div key={n.id} className="bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-2 mb-2 rounded flex items-center justify-between">
              <span>
                <strong>Marked as Fake:</strong> Lead <strong>{n.name}</strong> has been marked as fake. Seller & OPS notified for re-upload.
              </span>
              <Button size="xs" variant="outline" onClick={() => setFakeNotifications(prev => prev.filter(x => x.id !== n.id))}>
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
          <p className="text-gray-600 mt-1">Manage and track student accounts</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {accounts.length}
              </p>
            </div>
            <div className="p-3 bg-maritime-50 rounded-lg">
              <Users className="text-maritime-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Books</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {accounts.filter(a => a.withBooks).length}
              </p>
            </div>
            <div className="p-3 bg-maritime-50 rounded-lg">
              <BookOpen className="text-maritime-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{accounts.reduce((sum, acc) => sum + acc.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-maritime-50 rounded-lg">
              <DollarSign className="text-maritime-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and View Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search accounts by name..."
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

      {/* Accounts List */}
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
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className={`border-b border-gray-100 hover:bg-gray-50 ${account.status === 'fake' ? 'bg-red-100' : ''}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{account.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(account.status)}`}>
                        {account.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{account.batch}</td>
                    <td className="py-3 px-4">
                      <span className={account.withBooks ? 'text-green-600' : 'text-red-600'}>
                        {account.withBooks ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4">₹{account.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {account.createdAt
                        ? new Date(account.createdAt).toLocaleDateString()
                        : '-'}
                      {account.status === 'fake' && fakeDates[account.id] && (
                        <div className="text-xs text-red-700 mt-1">
                          Marked fake on: {new Date(fakeDates[account.id]).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {renderProof(account.paymentProof)}
                    </td>
                    <td className="py-3 px-4">
                      {/* Discount Proof (uploaded by seller or re-uploaded) */}
                      {renderProof(account.discountProof)}
                      {account.status === 'fake' && (
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            id={`discount-reupload-${account.id}`}
                            style={{ display: 'none' }}
                            onChange={e => handleReuploadProof(account.id, e.target.files?.[0] || null)}
                          />
                          <label htmlFor={`discount-reupload-${account.id}`}>
                            <Button size="xs" variant="outline">
                              {reuploadProofs[account.id] ? 'Change File' : 'Re-upload'}
                            </Button>
                          </label>
                          {reuploadProofs[account.id] && renderProof(reuploadProofs[account.id])}
                          {reuploadProofs[account.id] && (
                            <div className="text-xs text-gray-500 mt-1">
                              Uploaded: {new Date(fakeDates[account.id]).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {renderProof(account.booksProof)}
                    </td>
                    <td className="py-3 px-4">
                      {renderProof(account.formProof)}
                    </td>
                    <td className="py-3 px-4">
                      {account.comments && account.comments.length > 0 ? account.comments[0] : ''}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={account.verification}
                        onChange={(e) => {
                          // Implementation of handleVerificationChange
                        }}
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
                          onClick={() => handleMarkAsFake(account)}
                          disabled={account.status === 'fake'}
                        >
                          <XCircle size={14} className="mr-1" />
                          Mark as Fake
                        </Button>
                        {/* Re-upload for re-verification if fake */}
                        {account.status === 'fake' && (
                          <div>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,application/pdf"
                              id={`reupload-proof-${account.id}`}
                              style={{ display: 'none' }}
                              onChange={e => handleReuploadProof(account.id, e.target.files?.[0] || null)}
                            />
                            <label htmlFor={`reupload-proof-${account.id}`}>
                              <Button size="xs" variant="primary">
                                Re-upload Proof
                              </Button>
                            </label>
                            {reuploadProofs[account.id] && renderProof(reuploadProofs[account.id])}
                            {reuploadProofs[account.id] && (
                              <div className="text-xs text-gray-500 mt-1">
                                Uploaded: {new Date(fakeDates[account.id]).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAccounts.map((account) => (
              <Card key={account.id} className={`p-4 ${account.status === 'fake' ? 'bg-red-50' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-600">{account.batch}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(account.status)}`}>
                    {account.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Books:</span>{' '}
                    <span className={account.withBooks ? 'text-green-600' : 'text-red-600'}>
                      {account.withBooks ? 'Provided' : 'Pending'}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Amount:</span>{' '}
                    ₹{account.amount.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Received:</span>{' '}
                    {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '-'}
                  </p>
                  {account.status === 'fake' && fakeDates[account.id] && (
                    <p className="text-xs text-red-700">
                      Marked fake on: {new Date(fakeDates[account.id]).toLocaleDateString()}
                    </p>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Latest Comment:</span>
                    <p className="text-gray-600 mt-1">{account.comments[0]}</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <div>
                      <span className="font-medium">Payment Proof:</span>
                      {renderProof(account.paymentProof)}
                    </div>
                    <div>
                      <span className="font-medium">Discount Proof:</span>
                      {renderProof(account.discountProof)}
                      {account.status === 'fake' && (
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            id={`discount-reupload-card-${account.id}`}
                            style={{ display: 'none' }}
                            onChange={e => handleReuploadProof(account.id, e.target.files?.[0] || null)}
                          />
                          <label htmlFor={`discount-reupload-card-${account.id}`}>
                            <Button size="xs" variant="outline">
                              {reuploadProofs[account.id] ? 'Change File' : 'Re-upload'}
                            </Button>
                          </label>
                          {reuploadProofs[account.id] && renderProof(reuploadProofs[account.id])}
                          {reuploadProofs[account.id] && (
                            <div className="text-xs text-gray-500 mt-1">
                              Uploaded: {new Date(fakeDates[account.id]).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Books Proof:</span>
                      {renderProof(account.booksProof)}
                    </div>
                    <div>
                      <span className="font-medium">Form Proof:</span>
                      {renderProof(account.formProof)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsFake(account)}
                      disabled={account.status === 'fake'}
                    >
                      <XCircle size={14} className="mr-1" />
                      Mark as Fake
                    </Button>
                    {account.status === 'fake' && (
                      <div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          id={`reupload-proof-card-${account.id}`}
                          style={{ display: 'none' }}
                          onChange={e => handleReuploadProof(account.id, e.target.files?.[0] || null)}
                        />
                        <label htmlFor={`reupload-proof-card-${account.id}`}>
                          <Button size="xs" variant="primary">
                            Re-upload Proof
                          </Button>
                        </label>
                        {reuploadProofs[account.id] && renderProof(reuploadProofs[account.id])}
                        {reuploadProofs[account.id] && (
                          <div className="text-xs text-gray-500 mt-1">
                            Uploaded: {new Date(fakeDates[account.id]).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
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
