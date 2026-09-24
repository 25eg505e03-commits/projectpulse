import React, { useState, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { teamService } from '../services/api';
import MemberAvatar from '../components/common/MemberAvatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { Users, Plus, Shield, Briefcase } from 'lucide-react';

const Teams = () => {
  const { activeOrg } = useOrganization();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lead, setLead] = useState('');

  const fetchTeams = async () => {
    if (!activeOrg) return;
    setLoading(true);
    try {
      const { data } = await teamService.getTeams(activeOrg._id);
      if (data.success) {
        setTeams(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [activeOrg]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const { data } = await teamService.createTeam({
        organization: activeOrg._id,
        name,
        description,
        lead: lead || undefined,
      });
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        fetchTeams();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create team');
    }
  };

  if (loading) return <LoadingSpinner text="Loading teams..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Teams</h2>
          <p className="text-sm text-slate-400">
            Workspaces & functional teams inside {activeOrg?.name || 'Organization'}.
          </p>
        </div>
        {activeOrg && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team._id} className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-full text-xs font-semibold">
                {team.members?.length || 0} Members
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">{team.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1">{team.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Team Lead
              </span>
              <MemberAvatar user={team.lead} size="sm" showName />
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Members Roster
              </span>
              <div className="flex flex-wrap gap-1.5">
                {team.members?.map((m) => (
                  <MemberAvatar key={m._id || m} user={m} size="sm" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Team Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Team Name *</label>
            <input
              type="text"
              required
              placeholder="Frontend Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="React, Vite & UI Components team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Team Lead</label>
            <select
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">Select Member</option>
              {activeOrg?.members?.map((m) => (
                <option key={m.user._id} value={m.user._id}>
                  {m.user.name} ({m.user.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg text-sm">
              Create Team
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
