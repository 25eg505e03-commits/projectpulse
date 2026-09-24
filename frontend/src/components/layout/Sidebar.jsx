import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  Milestone,
  AlertOctagon,
  Calendar,
  Users,
  BarChart3,
  Activity,
  FolderKanban,
  Building2,
  Mail,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const Sidebar = () => {
  const { projects, activeProject, selectProject, userRole } = useProject();

  const projectNavItems = activeProject
    ? [
        { name: 'Kanban Board', path: `/projects/${activeProject._id}/board`, icon: Kanban },
        { name: 'Backlog & Sprints', path: `/projects/${activeProject._id}/backlog`, icon: ListTodo },
        { name: 'Milestones', path: `/projects/${activeProject._id}/milestones`, icon: Milestone },
        { name: 'Issue Tracker', path: `/projects/${activeProject._id}/issues`, icon: AlertOctagon },
        { name: 'Timeline', path: `/projects/${activeProject._id}/timeline`, icon: Calendar },
        { name: 'Workload', path: `/projects/${activeProject._id}/workload`, icon: Users },
        { name: 'Reports', path: `/projects/${activeProject._id}/reports`, icon: BarChart3 },
        { name: 'Activity Feed', path: `/projects/${activeProject._id}/activity`, icon: Activity },
      ]
    : [];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-lg tracking-tight leading-none">
            PROJECT<span className="text-sky-400">PULSE</span>
          </h1>
          <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
            Agile Suite
          </span>
        </div>
      </div>

      {/* Active Project Switcher */}
      {projects.length > 0 && (
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
            Active Project
          </label>
          <select
            value={activeProject?._id || ''}
            onChange={(e) => {
              const p = projects.find((proj) => proj._id === e.target.value);
              if (p) selectProject(p);
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {projects.map((proj) => (
              <option key={proj._id} value={proj._id}>
                [{proj.projectKey}] {proj.name}
              </option>
            ))}
          </select>
          {activeProject && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Role: <span className="font-semibold text-sky-300 uppercase">{userRole}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div>
          <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Overview
          </span>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <FolderKanban className="w-4 h-4" />
            All Projects
          </NavLink>
        </div>

        {/* Project Scoped Nav */}
        {activeProject && (
          <div>
            <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Current Project
            </span>
            <div className="space-y-1">
              {projectNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Organization & Team Management */}
        <div>
          <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Organization & Teams
          </span>
          <NavLink
            to="/organizations"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <Building2 className="w-4 h-4" />
            Organizations
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <Users className="w-4 h-4" />
            Teams
          </NavLink>
          <NavLink
            to="/invitations"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <Mail className="w-4 h-4" />
            Invitations
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
