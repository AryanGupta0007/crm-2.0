import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className = '', hover = false, onClick }: CardProps) => {
  const Component = motion.div;
  
  return (
    <Component
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${hover ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </Component>
  );
};