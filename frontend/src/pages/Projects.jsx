import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useOrganization } from '../context/OrganizationContext';
import { projectService } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import MemberAvatar from '../components/common/MemberAvatar';
import Modal from '../components/common/Modal';
import { FolderKanban, Plus, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const { projects, activeProject, selectProject, refreshProjects } = useProject();
  const { activeOrg } = useOrganization();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('planning');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!activeOrg) return alert('Please select or create an organization first');
    setLoading(true);
    setError('');
    try {
      const { data } = await projectService.createProject({
        organization: activeOrg._id,
        name,
        projectKey: projectKey.toUpperCase(),
        description,
        priority,
        status,
      });
      if (data.success) {
        await refreshProjects();
        selectProject(data.data);
        setIsModalOpen(false);
        setName('');
        setProjectKey('');
        setDescription('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Projects</h2>
          <p className="text-sm text-slate-400">
            Agile projects in {activeOrg?.name || 'Organization'}.
          </p>
        </div>
        {activeOrg && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj._id}
            className={`glass-card p-6 space-y-4 flex flex-col justify-between border ${
              activeProject?._id === proj._id ? 'border-sky-500/80 shadow-sky-500/10 shadow-2xl' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-800 font-mono text-xs font-bold rounded">
                  KEY: {proj.projectKey}
                </span>
                <StatusBadge status={proj.status} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">{proj.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{proj.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <PriorityBadge priority={proj.priority} />
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(proj.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden">
                {proj.members?.slice(0, 4).map((m) => (
                  <MemberAvatar key={m.user?._id || m.user} user={m.user} size="sm" />
                ))}
              </div>
              <button
                onClick={() => {
                  selectProject(proj);
                  navigate(`/projects/${proj._id}/board`);
                }}
                className="py-1.5 px-3 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                Open Project <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          {error && <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded text-xs">{error}</div>}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Project Name *</label>
              <input
                type="text"
                required
                placeholder="ProjectPulse Suite"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Key *</label>
              <input
                type="text"
                required
                placeholder="PULSE"
                value={projectKey}
                onChange={(e) => setProjectKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 uppercase font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Agile project and team collaboration software..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg text-sm">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
