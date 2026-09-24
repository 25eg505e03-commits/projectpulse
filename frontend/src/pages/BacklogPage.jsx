import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sprintService, taskService } from '../services/api';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import MemberAvatar from '../components/common/MemberAvatar';
import Modal from '../components/common/Modal';
import RoleGuard from '../components/common/RoleGuard';
import { Play, CheckCircle, Plus, ListTodo, ChevronRight } from 'lucide-react';

const BacklogPage = () => {
  const { projectId } = useParams();
  const { isRole } = useProject();

  const [sprints, setSprints] = useState([]);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Sprint Modal
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');

  const fetchBacklogData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [sprintRes, taskRes] = await Promise.all([
        sprintService.getSprints(projectId),
        taskService.getTasks({ project: projectId, unassignedSprint: 'true' }),
      ]);

      if (sprintRes.data.success) setSprints(sprintRes.data.data);
      if (taskRes.data.success) setBacklogTasks(taskRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklogData();
  }, [projectId]);

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      const { data } = await sprintService.createSprint({
        project: projectId,
        name: sprintName,
        goal: sprintGoal,
      });
      if (data.success) {
        setIsSprintModalOpen(false);
        setSprintName('');
        setSprintGoal('');
        fetchBacklogData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create sprint');
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      const { data } = await sprintService.startSprint(sprintId);
      if (data.success) fetchBacklogData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start sprint');
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    if (!window.confirm('Complete this sprint? Incomplete tasks will move back to the backlog.')) return;
    try {
      const { data } = await sprintService.completeSprint(sprintId);
      if (data.success) fetchBacklogData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete sprint');
    }
  };

  const handleMoveTaskSprint = async (taskId, targetSprintId) => {
    try {
      await taskService.assignSprint(taskId, targetSprintId);
      fetchBacklogData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Agile Backlog..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Backlog & Sprints</h2>
          <p className="text-sm text-slate-400">
            Plan agile iterations, manage backlog velocity, and assign story points.
          </p>
        </div>
        <RoleGuard allowedRoles={['admin', 'project_manager']}>
          <button
            onClick={() => setIsSprintModalOpen(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Sprint
          </button>
        </RoleGuard>
      </div>

      {/* Sprints Accordions */}
      <div className="space-y-6">
        {sprints.map((sprint) => {
          const totalPoints = (sprint.tasks || []).reduce((acc, t) => acc + (t.storyPoints || 0), 0);
          return (
            <div key={sprint._id} className="glass-card p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-100">{sprint.name}</h3>
                    <StatusBadge status={sprint.status} />
                    <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      {totalPoints} story pts
                    </span>
                  </div>
                  {sprint.goal && <p className="text-xs text-slate-400">{sprint.goal}</p>}
                </div>

                <RoleGuard allowedRoles={['admin', 'project_manager']}>
                  <div className="flex items-center gap-2">
                    {sprint.status === 'planned' && (
                      <button
                        onClick={() => handleStartSprint(sprint._id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Start Sprint
                      </button>
                    )}
                    {sprint.status === 'active' && (
                      <button
                        onClick={() => handleCompleteSprint(sprint._id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Complete Sprint
                      </button>
                    )}
                  </div>
                </RoleGuard>
              </div>

              {/* Sprint Tasks List */}
              <div className="space-y-2">
                {(!sprint.tasks || sprint.tasks.length === 0) ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No tasks assigned to this sprint.</p>
                ) : (
                  sprint.tasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusBadge status={task.status} />
                        <span className="font-semibold text-slate-200 truncate">{task.title}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <PriorityBadge priority={task.priority} />
                        <span className="font-mono font-bold text-slate-400">{task.storyPoints} pts</span>
                        <MemberAvatar user={task.assignee} size="sm" />
                        <button
                          onClick={() => handleMoveTaskSprint(task._id, null)}
                          className="text-[10px] text-slate-400 hover:text-sky-400 underline"
                        >
                          Move to Backlog
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unplanned Backlog Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-sky-400" /> Unplanned Backlog ({backlogTasks.length})
          </h3>
        </div>

        <div className="space-y-2">
          {backlogTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">All tasks are currently assigned to active or planned sprints.</p>
          ) : (
            backlogTasks.map((task) => (
              <div
                key={task._id}
                className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PriorityBadge priority={task.priority} />
                  <span className="font-semibold text-slate-200 truncate">{task.title}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-slate-400">{task.storyPoints} pts</span>
                  <MemberAvatar user={task.assignee} size="sm" />

                  {sprints.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleMoveTaskSprint(task._id, e.target.value);
                      }}
                      defaultValue=""
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300"
                    >
                      <option value="" disabled>Move to Sprint...</option>
                      {sprints.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Sprint Modal */}
      <Modal isOpen={isSprintModalOpen} onClose={() => setIsSprintModalOpen(false)} title="Create Sprint">
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Sprint Name *</label>
            <input
              type="text"
              required
              placeholder="Sprint 4 - UI Polish & Analytics"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Sprint Goal</label>
            <textarea
              rows={3}
              placeholder="Key objectives to achieve in this 2-week iteration..."
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsSprintModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg text-sm">
              Create Sprint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BacklogPage;
