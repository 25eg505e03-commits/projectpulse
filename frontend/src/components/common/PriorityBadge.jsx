import React from 'react';
import { ArrowUp, ArrowDown, AlertTriangle, AlertCircle } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  const getBadgeDetails = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return {
          className: 'badge-low',
          icon: <ArrowDown className="w-3 h-3 text-emerald-400" />,
        };
      case 'medium':
        return {
          className: 'badge-medium',
          icon: <ArrowUp className="w-3 h-3 text-blue-400" />,
        };
      case 'high':
        return {
          className: 'badge-high',
          icon: <AlertTriangle className="w-3 h-3 text-amber-400" />,
        };
      case 'critical':
        return {
          className: 'badge-critical',
          icon: <AlertCircle className="w-3 h-3 text-rose-400" />,
        };
      default:
        return {
          className: 'badge-medium',
          icon: <ArrowUp className="w-3 h-3 text-blue-400" />,
        };
    }
  };

  const details = getBadgeDetails(priority);

  return (
    <span className={`inline-flex items-center gap-1 uppercase tracking-wider ${details.className}`}>
      {details.icon}
      {priority || 'MEDIUM'}
    </span>
  );
};

export default PriorityBadge;
