import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({ title = 'No items found', description = 'There are no records to display at this time.', action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
      <div className="p-4 bg-slate-800/50 text-slate-400 rounded-full mb-4">
        <FolderOpen className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
