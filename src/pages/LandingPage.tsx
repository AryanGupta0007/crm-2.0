import { motion } from 'framer-motion';
import { Anchor, Users, TrendingUp, Shield, ArrowRight, Waves } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LandingPageProps {
  onShowLogin: () => void;
  onShowSignup: () => void;
}

export const LandingPage = ({ onShowLogin, onShowSignup }: LandingPageProps) => {
  const features = [
    {
      icon: Users,
      title: 'Lead Management',
      description: 'Streamline your lead capture, assignment, and conversion process with intuitive tools.'
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'Track performance metrics and conversion rates with real-time dashboard insights.'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure, role-specific interfaces for Admin, Sales, and Operations teams.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-maritime-900 via-maritime-800 to-maritime-700">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Anchor className="text-coral-400" size={32} />
            <span className="text-2xl font-bold text-white">Budding Mariners</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            <Button 
              variant="ghost" 
              onClick={onShowLogin}
              className="text-white hover:bg-white/10"
            >
              Sign In
            </Button>
            <Button 
              variant="primary" 
              onClick={onShowSignup}
            >
              Join Team
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Streamline Lead Management for
            <span className="text-coral-400 block">Maritime Education</span>
          </h1>
          
          <p className="text-xl text-maritime-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Comprehensive CRM solution designed specifically for maritime education providers. 
            Manage leads, track conversions, and streamline operations with role-based access.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              variant="primary" 
              size="lg"
              onClick={onShowSignup}
              className="text-lg px-8 py-4"
            >
              Get Started Today
              <ArrowRight className="ml-2" size={20} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              onClick={onShowLogin}
              className="text-white hover:bg-white/10 text-lg px-8 py-4"
            >
              Demo Login
            </Button>
          </motion.div>
        </motion.div>

        {/* Animated Waves */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <motion.div
            className="text-maritime-600 opacity-20"
            animate={{ 
              x: [-20, 20, -20],
              y: [0, -10, 0] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <Waves size={200} />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features for Maritime Education
          </h2>
          <p className="text-xl text-maritime-100 max-w-2xl mx-auto">
            Everything you need to manage leads, track conversions, and grow your maritime education business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-coral-500 rounded-full mb-6">
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-maritime-100 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Lead Management?
          </h2>
          <p className="text-xl text-maritime-100 mb-8 max-w-2xl mx-auto">
            Join maritime education providers who trust Budding Mariners CRM to streamline their operations and boost conversions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={onShowSignup}
              className="text-lg px-12 py-4"
            >
              Start Your Journey
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={onShowLogin}
              className="text-white hover:bg-white/10 text-lg px-12 py-4"
            >
              Try Demo
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};