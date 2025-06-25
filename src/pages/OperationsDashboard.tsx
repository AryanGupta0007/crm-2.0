import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckSquare, FileText, Eye, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Account, Lead } from '../types';
import { AccountsContext } from '../contexts/AccountsContext';
import { LeadsContext } from '../contexts/LeadsContext';

export const OperationsDashboard = () => {
  const { accounts, fetchAccounts } = useContext(AccountsContext);
  const { leads, fetchLeads } = useContext(LeadsContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Account['verificationStatus'] | 'all'>('all');
  const [activeTab, setActiveTab] = useState('verifications');

  useEffect(() => {
    fetchAccounts();
    fetchLeads();
  }, [fetchAccounts, fetchLeads]);

  // Only show leads that are converted and not yet ops verified
  const pendingOpsLeads = leads.filter(
    l => l.status === 'converted' && (l as any).opsVerified === false
  );

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.phone.includes(searchTerm) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || account.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerificationUpdate = (accountId: string, status: Account['verificationStatus']) => {
    // Implementation of handleVerificationUpdate
  };

  const handleOperationUpdate = (accountId: string, field: 'addedToGroup' | 'registeredOnApp', value: boolean) => {
    // Implementation of handleOperationUpdate
  };

  const handleOpsVerify = (leadId: string) => {
    // Implementation of handleOpsVerify
  };

  const getStatusColor = (status: Account['verificationStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Notification state for new leads
  const [opsNotifications, setOpsNotifications] = useState<{ leadId: string; name: string }[]>([]);
  const [acNotifications, setAcNotifications] = useState<{ leadId: string; name: string }[]>([]);

  // Track previously seen leads for notification
  const [seenLeadIds, setSeenLeadIds] = useState<string[]>([]);

  // Notify OPS when a new lead arrives for ops verification
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

  // Notify A/C team for verification when a lead is ops verified (simulate)
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
              <Button size="xs" variant="outline" onClick={() => setOpsNotifications(prev => prev.filter(x => x.leadId !== n.leadId))}>
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
              <Button size="xs" variant="outline" onClick={() => setAcNotifications(prev => prev.filter(x => x.leadId !== n.leadId))}>
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
          <p className="text-gray-600 mt-1">Verify accounts and manage operations</p>
        </div>
        {/* <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
          <Button variant="primary">
            <CheckSquare size={16} className="mr-2" />
            Bulk Verify
          </Button>
        </div> */}
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Accounts', value: accounts.length, color: 'text-blue-600' },
          { label: 'Pending', value: accounts.filter(a => a.verificationStatus === 'pending').length, color: 'text-yellow-600' },
          { label: 'Verified', value: accounts.filter(a => a.verificationStatus === 'verified').length, color: 'text-green-600' },
          { label: 'In Groups', value: accounts.filter(a => a.addedToGroup).length, color: 'text-purple-600' }
        ].map((stat, index) => (
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
                placeholder="Search accounts by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Account['verificationStatus'] | 'all')}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
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
              {filteredAccounts.map((account) => (
                <Card key={account.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-600">{account.batch}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(account.verificationStatus)}`}>
                      {account.verificationStatus.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><strong>Phone:</strong> {account.phone}</p>
                    <p className="text-sm"><strong>Amount:</strong> ₹{account.amountPaid.toLocaleString()}</p>
                    <p className="text-sm"><strong>Books:</strong> {account.books}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {account.paymentProof && (
                      <Button size="sm" variant="outline">
                        <Eye size={14} className="mr-1" />
                        Payment
                      </Button>
                    )}
                    {account.booksProof && (
                      <Button size="sm" variant="outline">
                        <Eye size={14} className="mr-1" />
                        Books
                      </Button>
                    )}
                    {account.formProof && (
                      <Button size="sm" variant="outline">
                        <Eye size={14} className="mr-1" />
                        Form
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleVerificationUpdate(account.id, 'verified')}
                      disabled={account.verificationStatus === 'verified'}
                      className="flex-1"
                    >
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerificationUpdate(account.id, 'rejected')}
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Batch</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Books</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Added to Group</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Registered on App</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{account.name}</p>
                        </td>
                        <td className="py-3 px-4">{account.phone}</td>
                        <td className="py-3 px-4">{account.batch}</td>
                        <td className="py-3 px-4">{account.books}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleOperationUpdate(account.id, 'addedToGroup', !account.addedToGroup)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              account.addedToGroup
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <CheckSquare size={14} />
                            <span>{account.addedToGroup ? 'Added' : 'Pending'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleOperationUpdate(account.id, 'registeredOnApp', !account.registeredOnApp)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              account.registeredOnApp
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <CheckSquare size={14} />
                            <span>{account.registeredOnApp ? 'Registered' : 'Pending'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-green-600">₹{account.amountPaid.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Ops Verification Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
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
                      // Find seller name from assignedTo
                      const seller = (leads.find(l => l.id === lead.id)?.assignedTo &&
                        leads.find(l => l.id === lead.id)?.assignedTo !== ''
                      )
                        ? (leads.find(l => l.id === lead.id)?.assignedTo &&
                          (leads.find(l => l.id === lead.id)?.assignedTo as string))
                        : '';
                      const sellerName = seller
                        ? (require('../data/sampleData').sampleUsers.find((u: any) => u.id === seller)?.name || 'Unknown')
                        : 'Unassigned';
                      return (
                        <tr key={lead.id} className="border-b border-gray-100 hover:bg-yellow-50">
                          <td className="py-3 px-4 font-bold">{lead.name}</td>
                          <td className="py-3 px-4">{lead.phone}</td>
                          <td className="py-3 px-4">{lead.batch || '-'}</td>
                          <td className="py-3 px-4">{sellerName}</td>
                          <td className="py-3 px-4">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                              Priority
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpsVerify(lead.id)}
                            >
                              Mark as Verified
                            </Button>
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
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Added to Group</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Registered on App</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount Paid</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{account.name}</p>
                          <p className="text-sm text-gray-500">{account.batch}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOperationUpdate(account.id, 'addedToGroup', !account.addedToGroup)}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            account.addedToGroup
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <CheckSquare size={14} />
                          <span>{account.addedToGroup ? 'Added' : 'Pending'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOperationUpdate(account.id, 'registeredOnApp', !account.registeredOnApp)}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            account.registeredOnApp
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <CheckSquare size={14} />
                          <span>{account.registeredOnApp ? 'Registered' : 'Pending'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-green-600">₹{account.amountPaid.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {filteredAccounts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">No accounts found matching your criteria.</p>
        </motion.div>
      )}
    </div>
  );
};