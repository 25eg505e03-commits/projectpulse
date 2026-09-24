import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { milestoneService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import RoleGuard from '../components/common/RoleGuard';
import { Milestone as MilestoneIcon, Plus, Calendar, CheckCircle2 } from 'lucide-react';

const MilestonesPage = () => {
  const { projectId } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchMilestones = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await milestoneService.getMilestones(projectId);
      if (data.success) {
        setMilestones(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    try {
      const { data } = await milestoneService.createMilestone({
        project: projectId,
        name,
        description,
        dueDate,
      });
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        setDueDate('');
        fetchMilestones();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create milestone');
    }
  };

  const handleStatusChange = async (id, status, progress) => {
    try {
      await milestoneService.updateMilestone(id, { status, progress });
      fetchMilestones();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading milestones..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Project Milestones</h2>
          <p className="text-sm text-slate-400">
            Track major release goals, target dates, and progress percentages.
          </p>
        </div>
        <RoleGuard allowedRoles={['admin', 'project_manager']}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Milestone
          </button>
        </RoleGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {milestones.map((m) => (
          <div key={m._id} className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                  <MilestoneIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{m.name}</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> Due: {new Date(m.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <StatusBadge status={m.status} />
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">{m.description}</p>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Progress</span>
                <span className="font-mono font-bold text-purple-400">{m.progress}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-purple-500 to-sky-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${m.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Controls */}
            <RoleGuard allowedRoles={['admin', 'project_manager']}>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800 text-xs">
                <span className="text-slate-500">Update Status:</span>
                <button
                  onClick={() => handleStatusChange(m._id, 'in-progress', 50)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(m._id, 'completed', 100)}
                  className="px-2 py-1 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 rounded flex items-center gap-1 font-semibold"
                >
                  <CheckCircle2 className="w-3 h-3" /> Complete
                </button>
              </div>
            </RoleGuard>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Milestone">
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Milestone Name *</label>
            <input
              type="text"
              required
              placeholder="Phase 1: Core REST APIs & Auth"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Key release deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg text-sm">
              Create Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MilestonesPage;
