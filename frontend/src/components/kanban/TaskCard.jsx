import React from 'react';
import PriorityBadge from '../common/PriorityBadge';
import MemberAvatar from '../common/MemberAvatar';
import { Clock, AlertTriangle, Bookmark, Bug, CheckSquare, Sparkles } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'story':
        return <Bookmark className="w-3.5 h-3.5 text-emerald-400" />;
      case 'bug':
        return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case 'improvement':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      onClick={onClick}
      className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-xl shadow-lg hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all cursor-pointer space-y-2.5 group"
    >
      {/* Top Meta: Type & Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {getTypeIcon(task.type)}
          <span>{task.type}</span>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 group-hover:text-sky-300 transition-colors">
        {task.title}
      </h4>

      {/* Labels & Blockers */}
      {(task.labels?.length > 0 || task.blockers?.length > 0) && (
        <div className="flex flex-wrap gap-1 items-center">
          {task.blockers?.length > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px] font-bold rounded flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              BLOCKED
            </span>
          )}
          {task.labels?.map((lbl) => (
            <span
              key={lbl._id || lbl}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
              style={{ borderColor: lbl.color ? `${lbl.color}80` : undefined }}
            >
              {lbl.name || 'Label'}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Story Points, Due Date, Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {/* Story Points */}
          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 font-mono font-bold rounded text-[10px]">
            {task.storyPoints || 1} pts
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Clock className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Assignee */}
        <MemberAvatar user={task.assignee} size="sm" />
      </div>
    </div>
  );
};

export default TaskCard;
