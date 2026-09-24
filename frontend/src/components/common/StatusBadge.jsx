import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'todo':
        return 'badge-todo';
      case 'in-progress':
        return 'badge-in-progress';
      case 'review':
        return 'badge-review';
      case 'done':
      case 'completed':
      case 'resolved':
        return 'badge-done';
      case 'open':
      case 'active':
        return 'bg-sky-950 text-sky-400 border border-sky-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
      case 'planning':
      case 'planned':
        return 'bg-purple-950 text-purple-400 border border-purple-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
      case 'on-hold':
        return 'bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
      case 'closed':
      case 'cancelled':
        return 'bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium';
      case 'overdue':
        return 'bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium';
    }
  };

  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/-/g, ' ').toUpperCase();
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${getBadgeClass(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
