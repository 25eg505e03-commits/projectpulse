import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orgService, invitationService } from '../services/api';
import MemberAvatar from '../components/common/MemberAvatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Building2, UserPlus, Shield, Trash2, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OrgDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [inviteStatus, setInviteStatus] = useState('');

  const fetchOrgDetails = async () => {
    try {
      const { data } = await orgService.getOrgById(id);
      if (data.success) {
        setOrg(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgDetails();
  }, [id]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteStatus('Sending...');
    try {
      const { data } = await invitationService.createInvitation({
        organizationId: id,
        email: inviteEmail,
        role: inviteRole,
      });
      if (data.success) {
        setInviteStatus('Invitation sent successfully!');
        setInviteEmail('');
      }
    } catch (err) {
      setInviteStatus(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from organization?')) return;
    try {
      const { data } = await orgService.removeMember(id, userId);
      if (data.success) {
        fetchOrgDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return <LoadingSpinner text="Loading organization details..." />;
  if (!org) return <div className="text-center py-12 text-slate-400">Organization not found</div>;

  const isAdmin = org.members.some(
    (m) => (m.user._id || m.user).toString() === user._id.toString() && m.role === 'admin'
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{org.name}</h2>
            <p className="text-sm text-slate-400 mt-1">{org.description || 'Enterprise Organization Workspace'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members Roster List */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" /> Organization Members ({org.members.length})
          </h3>

          <div className="divide-y divide-slate-800">
            {org.members.map((m) => (
              <div key={m.user._id} className="py-3 flex items-center justify-between gap-4">
                <MemberAvatar user={m.user} size="md" showName />
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase">
                    {m.role}
                  </span>
                  {isAdmin && m.user._id !== org.owner._id && m.user._id !== user._id && (
                    <button
                      onClick={() => handleRemoveMember(m.user._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Member Section */}
        {isAdmin && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" /> Invite New Member
            </h3>

            {inviteStatus && (
              <div className="p-3 bg-sky-950/60 border border-sky-800 text-sky-300 rounded-lg text-xs">
                {inviteStatus}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">User Email *</label>
                <input
                  type="email"
                  required
                  placeholder="member@technova.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Project Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="developer">Developer / Member</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="stakeholder">Stakeholder</option>
                  <option value="admin">Organization Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Send In-App Invite
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgDetails;
