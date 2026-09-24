import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      <span className="text-sm font-medium text-slate-300">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
