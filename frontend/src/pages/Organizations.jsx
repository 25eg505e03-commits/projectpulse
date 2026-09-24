import React, { useState } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { Building2, Plus, Users, Shield, ArrowRight } from 'lucide-react';
import Modal from '../components/common/Modal';
import { orgService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Organizations = () => {
  const { organizations, activeOrg, selectOrganization, refreshOrganizations } = useOrganization();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await orgService.createOrg({ name, description });
      if (data.success) {
        await refreshOrganizations();
        selectOrganization(data.data);
        setIsModalOpen(false);
        setName('');
        setDescription('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Organizations</h2>
          <p className="text-sm text-slate-400">
            Manage your organizations, teams, and access permissions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          Create Organization
        </button>
      </div>

      {/* Org Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div
            key={org._id}
            className={`glass-card p-6 space-y-4 flex flex-col justify-between border ${
              activeOrg?._id === org._id ? 'border-sky-500/80 shadow-sky-500/10 shadow-2xl' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                {activeOrg?._id === org._id && (
                  <span className="px-2.5 py-0.5 bg-sky-950 text-sky-400 border border-sky-800 rounded-full text-xs font-semibold">
                    ACTIVE
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{org.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {org.description || 'No description available'}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {org.members?.length || 1} Members
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Owner: {org.owner?.name || 'Admin'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => selectOrganization(org)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Set Active
              </button>
              <button
                onClick={() => navigate(`/organizations/${org._id}`)}
                className="py-2 px-3 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Org Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Organization">
        <form onSubmit={handleCreateOrg} className="space-y-4">
          {error && <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded text-xs">{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Organization Name *</label>
            <input
              type="text"
              required
              placeholder="TechNova Solutions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Enterprise software division..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg text-sm">
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Organizations;
