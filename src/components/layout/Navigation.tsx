import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Anchor, Users, BarChart3, CheckSquare, LogOut, DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navigation = ({ currentPath, onNavigate }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: BarChart3 },
          // { path: '/admin/leads', label: 'Lead Management', icon: Users },
          // { path: '/admin/employees', label: 'Employee Management', icon: Users },
          { path: '/accounts', label: 'Accounts', icon: DollarSign },
          { path: '/operations', label: 'Operations', icon: CheckSquare }, // Add operations access for admin
        ];
      case 'accounts':
        return [
          { path: '/accounts', label: 'Accounts Dashboard', icon: DollarSign },
        ];
      case 'sales':
        return [
          { path: '/sales', label: 'My Leads', icon: Users },
          // { path: '/sales/dnp', label: 'DNP Management', icon: X },
        ];
      case 'operations':
        return [
          // { path: '/operations', label: 'Verifications', icon: CheckSquare },
          { path: '/operations/tracker', label: 'Operations Tracker', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Anchor className="text-maritime-600" size={24} />
          <span className="font-bold text-maritime-900">Budding Mariners</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {user.avatar && (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user.name}
            </span>
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="lg:hidden fixed inset-0 z-50 bg-white"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Anchor className="text-maritime-600" size={24} />
                  <span className="font-bold text-maritime-900">Budding Mariners</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 px-4 py-6">
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;
                    
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          onNavigate(item.path);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-maritime-100 text-maritime-700 border-l-4 border-maritime-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={logout}
                  className="w-full"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex items-center space-x-2 px-6 py-4 border-b border-gray-200">
          <Anchor className="text-maritime-600" size={28} />
          <span className="font-bold text-xl text-maritime-900">Budding Mariners</span>
        </div>
        
        <div className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-maritime-100 text-maritime-700 border-l-4 border-maritime-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            {user.avatar && (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={logout}
            className="w-full"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};