import React from 'react';

export function KpiCard({ title, value, change, changeType, icon: Icon, iconColor }) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  return (
    <div className="bg-sidebar p-5 rounded-xl border border-gray-800 relative shadow-sm">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
      >
        {Icon && <Icon size={24} />}
      </div>
      
      <div className="flex flex-col">
        <span className="text-3xl font-bold tracking-tight mb-1">{value}</span>
        <span className="text-sm text-gray-400">{title}</span>
      </div>

      {change && (
        <span className={`absolute top-5 right-5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          isPositive ? 'bg-green-500/10 text-green-500' :
          isNegative ? 'bg-red-500/10 text-red-500' :
          'bg-gray-800 text-gray-300'
        }`}>
          {change}
        </span>
      )}
    </div>
  );
}
