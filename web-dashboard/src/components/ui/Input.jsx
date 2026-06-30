import React from 'react';

export function Input({ label, type = 'text', className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className="w-full bg-[#111827] border-[1.5px] border-gray-800 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors duration-200 placeholder:text-gray-600"
        {...props}
      />
    </div>
  );
}
