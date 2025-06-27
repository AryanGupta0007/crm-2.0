import { motion } from 'framer-motion';
import { Phone, Mail, Calendar, MessageSquare, User } from 'lucide-react';
import { Lead } from '../../types';
import { Button } from '../ui/Button';
import { format } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onStatusUpdate: (leadId: string, status: Lead['status']) => void;
  onAddComment: (leadId: string, comment: string) => void;
}

export const LeadCard = ({ lead, onStatusUpdate, onAddComment }: LeadCardProps) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-maritime-100 rounded-full flex items-center justify-center">
            <User className="text-maritime-600" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{lead.name}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
              {lead.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone size={14} />
          <span>{lead.contact_number}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail size={14} />
          <span>{lead.source}</span>
        </div>
        {lead.sale_details.followUpDate && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>Follow up: {format(new Date(lead.sale_details.followUpDate), 'MMM dd, yyyy')}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Academics:</p>
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${lead.board_score.pcm_score ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            PCM: {lead.board_score.pcm_score ? lead.board_score.pcm_score : 'Null'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${lead.board_score.english_score ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            English: {lead.board_score.english_score ? lead.board_score.english_score : 'Null'}
          </span>
        </div>
      </div>

      {lead.sale_details.batch && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Batch:</p>
          <p className="text-sm text-gray-600">{lead.batch.name}</p>
        </div>
      )}

      {lead.sale_details.comment && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MessageSquare size={14} className="text-gray-500" />
            <p className="text-sm font-medium text-gray-700">Latest Comment:</p>
          </div>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {lead.sale_details.comment}
          </p>
        </div>
      )}

      <div className="flex space-x-2 pt-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => onStatusUpdate(lead.id, 'interested')}
          className="flex-1"
        >
          Interested
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusUpdate(lead.id, 'closed-success')}
          className="flex-1"
        >
          Closed Success
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onStatusUpdate(lead.id, 'under-review')}
          className="flex-1"
        >
          Under Review
        </Button>
      </div>
    </motion.div>
  );
};