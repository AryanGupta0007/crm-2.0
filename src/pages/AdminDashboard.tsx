import { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, UserCheck, UserX, Upload, Settings, Download, Save, Search } from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { BatchManagement } from '../components/batches/BatchManagement';
import { Lead } from '../types';
import { AdminContext } from '../contexts/AdminContext';

export const AdminDashboard = () => {
  const { leads, fetchLeads, batches, fetchBatches, updateLeadAssignedTo, dashboardStats, fetchDashboardStats, users, fetchUsers, createBatch } = useContext(AdminContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [leadsToShow, setLeadsToShow] = useState(10);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [highlightedLeadId, setHighlightedLeadId] = useState<string | null>(null); // NEW
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'dnp' | 'ctc' | 'last10days'>('all');
  const [callerNeededLeads, setCallerNeededLeads] = useState<{ [callerId: string]: number }>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const leadRowRefs = useRef<{ [leadId: string]: HTMLTableRowElement | null }>({}); // NEW
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchBatches();
    fetchUsers();
    fetchDashboardStats();
    if (activeTab !== 'leads') return;
    const handleScroll = () => {
      const container = tableContainerRef.current;
      if (!container) return;
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        setLeadsToShow(prev => Math.min(prev + 10, leads.length));
      }
    };
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeTab, leads.length]);

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleUploadClick2 = () => {
    if (fileInputRef2.current) fileInputRef2.current.click();
  };
  
  // Duplicate Lead Handling on Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('Selected file:', file);
      // Simulate parsing uploaded leads (replace with actual parsing logic)
      const uploadedLeads: Lead[] = []; // <-- Fill this with parsed leads from file

      // Duplicate handling logic
      const updatedLeads = [...leads];
      uploadedLeads.forEach(uploadedLead => {
        const existing = leads.find(
          l => l.phone === uploadedLead.phone || l.email === uploadedLead.email
        );
        if (existing) {
          // Duplicate found: assign to same caller, mark as new
          updatedLeads.push({
            ...uploadedLead,
            assignedTo: existing.assignedTo,
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Not duplicate, add as is
          updatedLeads.push({
            ...uploadedLead,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
      fetchLeads();
    }
  };

  const handleGlobalSearch = (searchTerm: string) => {
    setGlobalSearch(searchTerm);
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const results = leads.filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.global-search-container')) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Scroll and highlight when highlightedLeadId changes
  useEffect(() => {
    if (highlightedLeadId && activeTab === 'leads') {
      // Ensure enough leads are shown
      const idx = leads.findIndex(l => l.id === highlightedLeadId);
      if (idx >= 0 && leadsToShow < idx + 1) {
        setLeadsToShow(idx + 1);
      }
      setTimeout(() => {
        const row = leadRowRefs.current[highlightedLeadId];
        if (row && tableContainerRef.current) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100); // Wait for DOM update
      // Remove highlight after a short delay
      const timeout = setTimeout(() => setHighlightedLeadId(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [highlightedLeadId, activeTab, leadsToShow]);

  const salesTeamMembers = users.filter(user => user.employee_details.type === 'sales');

  // Filtered leads for table
  const filteredLeads = leads.filter(lead => {
    if (leadStatusFilter === 'dnp') return lead.status === 'dnp';
    if (leadStatusFilter === 'ctc') return lead.status === 'contacted';
    if (leadStatusFilter === 'last10days') {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      return new Date(lead.createdAt) >= tenDaysAgo;
    }
    return true;
  });

  // Helper to get needed leads for a caller
  const getNeededLeads = (callerId: string) => {
    if (callerNeededLeads[callerId] !== undefined) return callerNeededLeads[callerId];
    return Math.max(0, 50 - leads.filter(l => l.assignedTo === callerId).length);
  };

  // Handler to reset needed leads for a caller
  const handleResetNeededLeads = (callerId: string) => {
    setCallerNeededLeads(prev => ({ ...prev, [callerId]: 50 }));
  };

  // File upload handler for leads
  const handleLeadsFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8000/api/admin/leads/', {
        method: 'POST',
        headers: token ? { 'Authorization': `${token}` } : undefined,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to upload leads');
      }
      setUploadSuccess('Leads uploaded successfully!');
      fetchLeads(); // Refresh leads after upload
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload leads');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 lg:ml-64 space-y-6">
      {/* Header with Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your maritime education CRM system</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Global Search */}
          <div className="relative global-search-container">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search leads by name, phone or source..."
                value={globalSearch}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {searchResults.map((lead) => (
                  <div
                    key={lead.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setGlobalSearch('');
                      setShowSearchResults(false);
                      setActiveTab('leads');
                      setHighlightedLeadId(lead.id);
                    }}
                  >
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-600">
                      {lead.phone} • {lead.source}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Existing Upload Button */}
          <input
            type="file"
            accept=".csv,.xlsx"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button variant="primary" onClick={handleUploadClick}>
            <Upload size={16} className="mr-2" />
            Upload Leads
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Leads"
          value={dashboardStats?.totalLeads ?? 0}
          icon={Users}
          color="blue"
          trend={12}
        />
        <StatsCard
          title="Active Leads"
          value={dashboardStats?.activeLeads ?? 0}
          icon={TrendingUp}
          color="orange"
          trend={8}
        />
        <StatsCard
          title="Converted"
          value={dashboardStats?.convertedLeads ?? 0}
          icon={UserCheck}
          color="green"
          trend={15}
        />
        <StatsCard
          title="DNP Leads"
          value={dashboardStats?.dnpLeads ?? 0}
          icon={UserX}
          color="coral"
          trend={-5}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'leads', 'employees', 'callers', 'batches'].map((tab) => (
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

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Lead Activity</h3>
              <div className="space-y-4">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-maritime-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">Status: {lead.status}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(lead.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Team Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
              <div className="space-y-4">
                {users.filter(u => u.employee_details.type !== 'admin').map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{user.employee_details.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {user.employee_details.type === 'sales' ? '45' : '23'} processed
                      </p>
                      <p className="text-sm text-green-600">92% efficiency</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-2">
              <div className="flex flex-wrap gap-3 items-center">
                <label className="font-medium text-gray-700">Filter:</label>
                <select
                  value={leadStatusFilter}
                  onChange={e => setLeadStatusFilter(e.target.value as typeof leadStatusFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500"
                >
                  <option value="all">All Leads</option>
                  <option value="dnp">DNP (Do Not Pick)</option>
                  <option value="ctc">CTC (Could Not Connect)</option>
                  <option value="last10days">Last 10 Days</option>
                </select>
              </div>
            </div>

            {/* Upload Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Leads</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  ref={fileInputRef2}
                  style={{ display: 'none' }}
                  onChange={handleLeadsFileUpload}
                />
                <Button variant="primary" onClick={handleUploadClick2} disabled={uploading}>
                  <Upload size={16} className="mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Leads'}
                </Button>
                {uploadError && <span className="text-red-600 ml-2">{uploadError}</span>}
                {uploadSuccess && <span className="text-green-600 ml-2">{uploadSuccess}</span>}
              </div>
            </Card>

            {/* Lead Management Table */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Lead Management</h3>
              </div>
              <div className="overflow-x-auto" ref={tableContainerRef} style={{ maxHeight: 500, minHeight: 200 }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Lead Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Source / Upload Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Assign To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.slice(0, leadsToShow).map((lead) => (
                      <tr
                        key={lead.id}
                        ref={el => (leadRowRefs.current[lead.id] = el)}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          highlightedLeadId === lead.id ? 'bg-yellow-100 animate-pulse' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{lead.name}</p>
                        </td>
                        <td className="py-3 px-4">{lead.contact_number}</td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium">{lead.source}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select 
                            className="text-sm border rounded p-1.5 w-full"
                            value={lead.status}
                            onChange={(e) => {
                              // Handle status change
                              console.log('Status changed:', e.target.value);
                            }}
                          >
                            <option value="new">NEW</option>
                            <option value="pick">PICK</option>
                            <option value="dnp">DNP</option>
                            <option value="contacted">CTC</option>
                            <option value="callback">CB</option>
                            <option value="not_interested">NA</option>
                            <option value="delete">DELETE</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={lead.assignedTo || ''}
                            onChange={(e) => {
                              // Handle assignment change
                              updateLeadAssignedTo({ userID: Number(e.target.value), leadID: Number(lead.id) })
                              console.log('Assigned to:', e.target.value);
                            }}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500"
                          >
                            <option value="">Unassigned</option>
                            {salesTeamMembers.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {leadsToShow < filteredLeads.length && (
                  <div className="text-center py-2 text-gray-400 text-sm">Scroll to load more...</div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'employees' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Employee Management</h3>
              <Button variant="primary">Add Employee</Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user.id} className="p-4" hover>
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src={'data:image/jpeg;base64,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'} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{user.employee_details.type}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    {user.employee_details.type !== 'admin' && (
                      <Button size="sm" variant="ghost" className="flex-1">
                        Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'callers' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Caller Management</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned Leads</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Remaining Leads</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Closed Deals</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue Generated</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Needed Leads</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salesTeamMembers.map((caller) => (
                    <tr key={caller.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAogMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBAwQCB//EADsQAAICAQICBQcKBgMAAAAAAAABAgMEBREGQRIhMVFxEyIyUmGBkRQzRGJyobHB0eEjQkNzkvE0NVP/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAQMEAgX/xAAgEQEAAgIBBQEBAAAAAAAAAAAAAQIDEUEEEiIxUSEy/9oADAMBAAIRAxEAPwC3AA9N5oACQABAAE7o2i+VisjMT6D9Gvv9rObXisbl3Ws2nUIejGvyG1RVOe3b0Ud0NBz5r0IR+1MtsK4VxUK4qMV2KK2PRlnqLcNEYI5VKWgZ8exVS8JnHkYGXjpu6icUv5tt0Xkw0I6i3JOCvD58C1arolWQpW4yVd3cupSKvOLhJxlFxkns0+Rppki/pnvSay8gA7cAAAAAAACQABAAAAAAO7RsT5ZnQhJb1x86ftXcXRJJdRAcKVfwsi3vkor3Lf8AMnzFmtu+vjbhrqoAClaAAAVvifDUZwy4L0vNnt38mWQ4daq8rpeQucY9Je7rO8du20OMld1UsAHoMAAAAAAAAAAAAAJAAAWnhX/r5/3X+CJkgeE7P4ORX3TUviv2J48/L/ct2L+IAAVrAAADn1H/AIGT/al+B0HDrc/J6Xkvm49H49RNf2Yc29SpYAPSeeAAAAAAAAAAAAAAACUtw1f5PUHW/wCrFpeK6/1LYUCm2VF0LYelB9JF8ouhdTC2D3jNboydRXVttWC35p7ABnXhkADBCcU3dHFrp52S39yJtvYpuuZXyrUJ9F7wr8yP5luGu7qs1tV0jwAbmIAAAAAAAAAAAAAAD1CErJdGuLlLuit2EvJN8PakqZfJLntCT3hJ8n3GjE0LLvalalTD63b8Dzquk24L6cd7KPW27H7Sq00v47WVrevlpbzJVNO127Giq74u6tdkt/OX6kzVrmBYlvc4N8pxaMtsVq8NNctZ5SQOCes4EPpEX9lNkZm8RdJOGHW0/Xny9xFcd54TOSscuzXdSWLS6apb3zXL+Vd5UzqxMXI1LJfR3m2952S7F4khl8O31+dizVq9WXU/0NVOzF47/Wa3df8AdIUGy6i6iXRurlB/WRrLo/VU/gAAgAAAAAAAAANuNTLIyaqY9s5Je4T62mElo2jvNXlshtUp+al2y/Ys1GNVjxUaa4wj7EeqaoU1RrrW0YrZI2Hn3vNpbqUisMbGHFNNNJp8megcO0NmcP410nOhumT7UlvF+4jbOHMyPoTpkvFr8i1gtrmvCucVZVKPD2dJ9bpivbP9juxeG64tPJuc16sFsifAnNeURhrDVRRXj1qumEYRXJI2GQVLXicIzi4zipRfamtyD1XQoShK7Cj0JpbutdkvD2k8Dqt5rO4c2pFo1L56CS1/FWNqEpQW0LV0148yNPQrbujbDaNToABLkAAAAACX4Zq8pqDn/wCcG/e+oiCycJ1bVZFr7ZSUfh/srzTqkrMUbvCfABgbgwZAGAAAAAGTAAAAAQnFVSliV27dcJ7fErBdNbq8rpeRHmo9Je7rKWbOnnx0x548tgAL1IAAAAAFt4bh0dMi/WnJ/ft+RUi56CttJx/Bv4tlHUfyvwR5JAAGNrAABhBhBgZ5GEZ5GEAMswZYGAABryIeUosh60WvuKCuw+hM+fzj0ZyiuTaNPTT7Zuoj08gA1MwACQABAE9o2tVY9EcbJjJKHVGaXVt7SBBzekXjUuq3ms7hfKMqjIW9FsJ+D7DefPYtxacW012NHbTq2dR6GQ5LumukZp6eeJaI6j7C6grFXEl6+dohP2xex11cR40vnKrYfBlc4bxwsjLSeU2COhreny/rOP2os2rVcB/S6ve9jnst8dd9frt5GDkeqYC7cun/ACNU9Z0+P0hPwi2Oy3w7q/UgCHt4iw4+hG2fhHb8Tkt4lm/msZL2yludRivPDmctI5WM8WWQri5WTjGK5yeyKjfrefb1K1Vr6kdjhstsul0rZynLvk9yyOnty4nPHELRm69jUxlHHflbOWy834lU7et9oBopjinpRe829gALFYAAAAIAAAAAAAAAPsACTkAAAACAAAAAAAAAAEj/2Q=='} 
                            alt={caller.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <p className="font-medium text-gray-900">{caller.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{caller.email}</td>
                      <td className="py-3 px-4">{leads.filter(l => l.assignedTo === caller.id).length}</td>
                      <td className="py-3 px-4">
                        {leads.filter(l => l.assignedTo === caller.id && !['converted', 'dnp'].includes(l.status)).length}
                      </td>
                      <td className="py-3 px-4">
                        {leads.filter(l => l.assignedTo === caller.id && l.status === 'converted').length}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-green-600">
                          ₹{(leads.filter(l => l.assignedTo === caller.id && l.status === 'converted').length * 50000).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {/* <span>{getNeededLeads(caller.id)}</span>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleResetNeededLeads(caller.id)}
                            className="ml-2"
                          >
                            Reset
                          </Button> */}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Save size={14} className="mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download size={14} className="mr-1" />
                            Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'batches' && (
          <BatchManagement 
            batches={batches}
            onAddBatch={(newBatch) => {
              console.log('Adding new batch:', newBatch);
              createBatch(newBatch);
              // Add batch handling logic here
            }}
          />
        )}
      </motion.div>
    </div>
  );
};