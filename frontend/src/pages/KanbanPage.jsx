import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { taskService, sprintService, labelService, attachmentService } from '../services/api';
import { useProject } from '../context/ProjectContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import CommentSection from '../components/comments/CommentSection';
import RoleGuard from '../components/common/RoleGuard';
import MemberAvatar from '../components/common/MemberAvatar';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import { Plus, Filter, Search, Paperclip, AlertTriangle } from 'lucide-react';

const KanbanPage = () => {
  const { projectId } = useParams();
  const { activeProject, isRole } = useProject();

  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSprint, setSelectedSprint] = useState('');
  const [search, setSearch] = useState('');

  // Task Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState('todo');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('task');
  const [newPriority, setNewPriority] = useState('medium');
  const [newStoryPoints, setNewStoryPoints] = useState(1);
  const [newAssignee, setNewAssignee] = useState('');
  const [newSprint, setNewSprint] = useState('');

  // Task Detail Modal
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchBoardData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [taskRes, sprintRes, labelRes] = await Promise.all([
        taskService.getTasks({ project: projectId, search: search || undefined, sprint: selectedSprint || undefined }),
        sprintService.getSprints(projectId),
        labelService.getLabels(projectId),
      ]);

      if (taskRes.data.success) setTasks(taskRes.data.data);
      if (sprintRes.data.success) setSprints(sprintRes.data.data);
      if (labelRes.data.success) setLabels(labelRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [projectId, selectedSprint, search]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await taskService.createTask({
        project: projectId,
        title: newTitle,
        description: newDescription,
        type: newType,
        status: createInitialStatus,
        priority: newPriority,
        storyPoints: Number(newStoryPoints),
        assignee: newAssignee || undefined,
        sprint: newSprint || undefined,
      });

      if (data.success) {
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        fetchBoardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedTask) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await attachmentService.uploadFile(formData);
      if (data.success) {
        const attachmentId = data.data._id;
        const updatedAttachments = [...(selectedTask.attachments || []).map((a) => a._id || a), attachmentId];
        const updatedRes = await taskService.updateTask(selectedTask._id, {
          attachments: updatedAttachments,
        });
        if (updatedRes.data.success) {
          setSelectedTask(updatedRes.data.data);
          fetchBoardData();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed');
    }
  };

  if (loading && tasks.length === 0) {
    return <LoadingSpinner text="Loading Kanban Board tasks..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Kanban Board
            {activeProject && (
              <span className="text-xs font-mono px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-800 rounded">
                [{activeProject.projectKey}]
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-400">
            Interactive drag and drop task management with real-time status sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RoleGuard allowedRoles={['admin', 'project_manager', 'team_lead', 'developer']}>
            <button
              onClick={() => {
                setCreateInitialStatus('todo');
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </RoleGuard>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Sprints</option>
              {sprints.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-sky-400 font-bold">{tasks.length}</span> board cards
        </div>
      </div>

      {/* Kanban Board Component */}
      <KanbanBoard
        tasks={tasks}
        onTaskUpdate={(updated) => {
          setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        }}
        onTaskClick={(task) => setSelectedTask(task)}
        onCreateTask={(status) => {
          if (!isRole(['admin', 'project_manager', 'team_lead', 'developer'])) {
            alert('Stakeholders have read-only access.');
            return;
          }
          setCreateInitialStatus(status);
          setIsCreateModalOpen(true);
        }}
      />

      {/* Task Creation Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="Build API endpoint for..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Technical specifications and acceptance criteria..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              >
                <option value="task">Task</option>
                <option value="story">User Story</option>
                <option value="bug">Bug</option>
                <option value="improvement">Improvement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Story Points</label>
              <input
                type="number"
                min={1}
                max={21}
                value={newStoryPoints}
                onChange={(e) => setNewStoryPoints(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Assignee</label>
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              >
                <option value="">Unassigned</option>
                {activeProject?.members?.map((m) => (
                  <option key={m.user._id || m.user} value={m.user._id || m.user}>
                    {m.user.name || 'Member'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Sprint</label>
              <select
                value={newSprint}
                onChange={(e) => setNewSprint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              >
                <option value="">Backlog (No Sprint)</option>
                {sprints.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg text-sm">
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Detail View Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`[${activeProject?.projectKey || 'TASK'}] ${selectedTask.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Task Status & Priority Metadata */}
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTask.status} />
                <PriorityBadge priority={selectedTask.priority} />
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {selectedTask.storyPoints} Story Points
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Assignee:</span>
                <MemberAvatar user={selectedTask.assignee} size="sm" showName />
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Description</h4>
              <p className="text-sm text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Blockers */}
            {selectedTask.blockers?.length > 0 && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Blocker Information
                </h4>
                {selectedTask.blockers.map((b, i) => (
                  <p key={i} className="text-xs text-rose-200">
                    • {b}
                  </p>
                ))}
              </div>
            )}

            {/* Attachments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-400 uppercase">Attachments</h4>
                <label className="text-xs text-sky-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                  <Paperclip className="w-3.5 h-3.5" /> Upload File
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selectedTask.attachments?.map((att) => (
                  <a
                    key={att._id || att}
                    href={`http://localhost:5000/${att.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 hover:border-sky-500 truncate flex items-center gap-2"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{att.originalName || att.filename}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Comments Stream */}
            <CommentSection entityType="Task" entityId={selectedTask._id} projectId={projectId} />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default KanbanPage;
