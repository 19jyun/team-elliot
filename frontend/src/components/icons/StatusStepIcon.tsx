import React from 'react';

interface StatusStepIconProps {
  className?: string;
  width?: number;
  height?: number;
  state: 'completed' | 'active' | 'inactive' | 'payment-completed';
}

export const StatusStepIcon: React.FC<StatusStepIconProps> = ({ 
  className = '', 
  width = 32, 
  height = 32, 
  state 
}) => {
  const getIconPath = () => {
    switch (state) {
      case 'completed':
        return (
          <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="16" fill="#573B30"/>
            <path d="M12 16L15 19L20 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'active':
        return (
          <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="15" stroke="#573B30" strokeWidth="2" fill="none"/>
            <circle cx="16" cy="16" r="6" fill="#573B30"/>
          </svg>
        );
      case 'payment-completed':
        return (
          <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="16" fill="#573B30"/>
            <path d="M12 16L15 19L20 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H24" stroke="white" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        );
      case 'inactive':
      default:
        return (
          <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="15" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
            <circle cx="16" cy="16" r="6" fill="#D1D5DB"/>
          </svg>
        );
    }
  };

  return getIconPath();
};
