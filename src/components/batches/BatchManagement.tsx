import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Archive } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Batch } from '../../types';

interface BatchManagementProps {
  batches: Batch[];
  onAddBatch: (batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const BatchManagement = ({ batches, onAddBatch }: BatchManagementProps) => {
  const [newBatch, setNewBatch] = useState({
    name: '',
    batchPrice: 0,
    booksPrice: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBatch({
      ...newBatch,
      status: 'active'
    });
    setNewBatch({ name: '', batchPrice: 0, booksPrice: 0 });
  };

  const activeBatches = batches.filter(b => b.status === 'active');
  const completedBatches = batches.filter(b => b.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Add New Batch */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Batch</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Batch Name"
              value={newBatch.name}
              onChange={(value) => setNewBatch(prev => ({ ...prev, name: value }))}
              required
            />
            <Input
              label="Batch Price"
              type="number"
              value={newBatch.batchPrice}
              onChange={(value) => setNewBatch(prev => ({ ...prev, batchPrice: Number(value) }))}
              required
            />
            <Input
              label="Books Price"
              type="number"
              value={newBatch.booksPrice}
              onChange={(value) => setNewBatch(prev => ({ ...prev, booksPrice: Number(value) }))}
              required
            />
          </div>
          <Button type="submit" className="w-full md:w-auto">
            <Plus size={16} className="mr-2" />
            Add Batch
          </Button>
        </form>
      </Card>

      {/* Active Batches */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Batches</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Batch Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Batch Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Books Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeBatches.map((batch) => (
                <tr key={batch.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{batch.name}</td>
                  <td className="py-3 px-4">₹{batch.batchPrice.toLocaleString()}</td>
                  <td className="py-3 px-4">₹{batch.booksPrice.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline">
                      <Archive size={14} className="mr-2" />
                      Complete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Completed Batches */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Completed Batches</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Batch Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Batch Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Books Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {completedBatches.map((batch) => (
                <tr key={batch.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">{batch.name}</td>
                  <td className="py-3 px-4">₹{batch.batchPrice.toLocaleString()}</td>
                  <td className="py-3 px-4">₹{batch.booksPrice.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
