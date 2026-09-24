import React from 'react';

const MemberAvatar = ({ user, size = 'md', showName = false }) => {
  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  // Generate deterministic color based on name length
  const colors = [
    'bg-sky-600 border-sky-400',
    'bg-indigo-600 border-indigo-400',
    'bg-purple-600 border-purple-400',
    'bg-emerald-600 border-emerald-400',
    'bg-amber-600 border-amber-400',
    'bg-rose-600 border-rose-400',
  ];
  const colorIndex = (user.name ? user.name.length : 0) % colors.length;

  return (
    <div className="inline-flex items-center gap-2">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-700`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full ${colors[colorIndex]} border flex items-center justify-center font-bold text-white shadow-sm shrink-0`}
          title={user.name || user.email}
        >
          {initials}
        </div>
      )}
      {showName && (
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium text-slate-200">{user.name}</span>
          {user.email && <span className="text-xs text-slate-400">{user.email}</span>}
        </div>
      )}
    </div>
  );
};

export default MemberAvatar;
