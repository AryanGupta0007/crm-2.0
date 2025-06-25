import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-maritime-900 to-maritime-800">
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-coral-400"
        >
          <Anchor size={48} />
        </motion.div>
        <motion.p
          className="text-white text-lg font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading Budding Mariners CRM...
        </motion.p>
      </motion.div>
    </div>
  );
};