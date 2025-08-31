import React from 'react';

interface ChevronRightIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24 
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M9 18L15 12L9 6" stroke="#573B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
