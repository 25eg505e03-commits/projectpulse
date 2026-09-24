import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { useProject } from '../context/ProjectContext';
import { taskService, issueService, sprintService, activityService } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MemberAvatar from '../components/common/MemberAvatar';
import {
  FolderKanban,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { activeOrg } = useOrganization();
  const { projects, activeProject } = useProject();

  const [myTasks, setMyTasks] = useState([]);
  const [openIssuesCount, setOpenIssuesCount] = useState(0);
  const [activeSprint, setActiveSprint] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (user) {
          // Fetch my tasks
          const taskRes = await taskService.getTasks({ assignee: user._id, limit: 10 });
          if (taskRes.data.success) {
            setMyTasks(taskRes.data.data);
          }

          // Fetch open issues
          const issueRes = await issueService.getIssues({ status: 'open', limit: 1 });
          if (issueRes.data.success) {
            setOpenIssuesCount(issueRes.data.total);
          }

          // Fetch recent activity
          const actRes = await activityService.getActivities({ limit: 8 });
          if (actRes.data.success) {
            setActivities(actRes.data.data);
          }

          // Fetch active sprint for active project
          if (activeProject) {
            const sprintRes = await sprintService.getSprints(activeProject._id, 'active');
            if (sprintRes.data.success && sprintRes.data.data.length > 0) {
              setActiveSprint(sprintRes.data.data[0]);
            } else {
              setActiveSprint(null);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, activeProject]);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard metrics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            Welcome back, <span className="text-sky-400">{user?.name}</span> 👋
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Organization:{' '}
            <span className="font-semibold text-slate-200">
              {activeOrg ? activeOrg.name : 'None Selected'}
            </span>
          </p>
        </div>
        {activeProject && (
          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${activeProject._id}/board`}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20"
            >
              Open Kanban Board
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Projects</p>
            <h3 className="text-2xl font-extrabold text-slate-100">{projects.length}</h3>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Tasks Assigned</p>
            <h3 className="text-2xl font-extrabold text-slate-100">{myTasks.length}</h3>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Open Issues</p>
            <h3 className="text-2xl font-extrabold text-slate-100">{openIssuesCount}</h3>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Active Sprint</p>
            <h3 className="text-sm font-bold text-slate-100 truncate max-w-[130px]">
              {activeSprint ? activeSprint.name : 'No active sprint'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid: My Tasks & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Tasks List */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-400" /> My Assigned Tasks
            </h3>
            <span className="text-xs text-slate-400">{myTasks.length} tasks</span>
          </div>

          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No active tasks assigned to you.</p>
            ) : (
              myTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{task.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed Stream */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Audit Stream
            </h3>
          </div>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent activity</p>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="flex gap-3 text-xs">
                  <MemberAvatar user={act.user} size="sm" />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-slate-300 font-medium leading-snug">{act.description}</p>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
