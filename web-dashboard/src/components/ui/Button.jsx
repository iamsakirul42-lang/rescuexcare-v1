import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200";
  
  const variants = {
    primary: "bg-primary hover:bg-[#4931b2] text-white",
    outline: "border-[1.5px] border-gray-700 bg-[#111827] text-white hover:border-gray-500",
    danger: "bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
    success: "bg-green-500 text-white hover:bg-green-600",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
