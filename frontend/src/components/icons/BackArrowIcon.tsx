import React from 'react';

interface BackArrowIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const BackArrowIcon: React.FC<BackArrowIconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24 
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M19 12H5M12 19L5 12L12 5" stroke="#573B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
