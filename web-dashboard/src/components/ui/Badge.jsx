import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantStyles()} ${className}`}>
      {children}
    </span>
  );
};
