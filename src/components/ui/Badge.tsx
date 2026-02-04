
import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = "" }) => {
  const getStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'open':
      case 'high':
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'closed':
      case 'a1':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'draft':
      case 's4':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-tight ${getStyles(status)} ${className}`}>
      {status}
    </span>
  );
};

export default Badge;
