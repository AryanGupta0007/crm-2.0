import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Navigation } from './components/layout/Navigation';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { SalesDashboard } from './pages/SalesDashboard';
import { OperationsDashboard } from './pages/OperationsDashboard';
import { AccountsDashboard } from './pages/AccountsDashboard';
import { ProofViewer } from './pages/ProofViewer';

function App() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Check if we're on a proof viewer URL
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('leadId');
    const field = urlParams.get('field');
    
    if (leadId && field && window.location.pathname === '/proof') {
      setCurrentPath('/proof');
      return;
    }

    let userType = localStorage.getItem('userType')
    if (userType) {

      // Redirect based on user type after successful login/signup
      switch (userType) {
        case 'accounts':
          setCurrentPath('/accounts');
          break;
        case 'admin':
          setCurrentPath('/admin');
          break;
        case 'sales':
          setCurrentPath('/sales');
          break;
        case 'operations':
          setCurrentPath('/operations');
          break;
        default:
          setCurrentPath('/');
      }
      // Close any open modals
      setShowLogin(false);
      setShowSignup(false);
    } else {
      setCurrentPath('/');
    }
  }, [user]);

  const handleAuthSuccess = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Update renderCurrentPage to handle accounts user and admin access to /accounts
  const renderCurrentPage = () => {
    if (currentPath === '/proof') {
      return <ProofViewer />;
    }
    if (!user) {
      return (
        <LandingPage 
          onShowLogin={() => setShowLogin(true)} 
          onShowSignup={() => setShowSignup(true)}
        />
      );
    }

    // Special case: accounts user only sees accounts dashboard
    if (localStorage.getItem('userType') === 'accounts') {
      return <AccountsDashboard />;
    }

    switch (currentPath) {
      case '/admin':
      case '/admin/leads':
      case '/admin/employees':
        return <AdminDashboard />;
      case '/accounts':
        // Allow admin to view AccountsDashboard
        
        if (localStorage.getItem('userType') === 'admin') {
          return <AccountsDashboard />;
        }
        // For any other type, redirect to home/landing
        return (
          <LandingPage 
            onShowLogin={() => setShowLogin(true)} 
            onShowSignup={() => setShowSignup(true)}
          />
        );
      case '/sales':
      case '/sales/dnp':
        return <SalesDashboard />;
      case '/operations':
      case '/operations/tracker':
        return <OperationsDashboard />;
      default:
        return (
          <LandingPage 
            onShowLogin={() => setShowLogin(true)} 
            onShowSignup={() => setShowSignup(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <Navigation currentPath={currentPath} onNavigate={handleNavigate} />
      )}
      
      <main className={user ? '' : ''}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowLogin(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LoginForm 
                onSuccess={handleAuthSuccess} 
                onSwitchToSignup={handleSwitchToSignup}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {showSignup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowSignup(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SignupForm 
                onSuccess={handleAuthSuccess} 
                onSwitchToLogin={handleSwitchToLogin}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;