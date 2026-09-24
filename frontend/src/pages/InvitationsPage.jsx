import React, { useState, useEffect } from 'react';
import { invitationService } from '../services/api';
import { useOrganization } from '../context/OrganizationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

const InvitationsPage = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshOrganizations } = useOrganization();

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const { data } = await invitationService.getInvitations();
      if (data.success) {
        setInvitations(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (id, action) => {
    try {
      const { data } = await invitationService.respondInvitation(id, action);
      if (data.success) {
        alert(data.message);
        await refreshOrganizations();
        fetchInvitations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process invitation response');
    }
  };

  if (loading) return <LoadingSpinner text="Loading invitations..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Mail className="w-6 h-6 text-sky-400" /> Organization Invitations
        </h2>
        <p className="text-sm text-slate-400">
          In-app portal to accept or decline pending organization membership invitations.
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        {invitations.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No pending or historical invitations found.</p>
        ) : (
          invitations.map((inv) => (
            <div
              key={inv._id}
              className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-100">
                    {inv.organization?.name || 'Organization'}
                  </h4>
                  <StatusBadge status={inv.status} />
                </div>
                <p className="text-xs text-slate-400">
                  Invited as <span className="font-semibold text-sky-300 uppercase">{inv.role}</span> by{' '}
                  {inv.invitedBy?.name || inv.invitedBy?.email}
                </p>
              </div>

              {inv.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespond(inv._id, 'accept')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept Invite
                  </button>
                  <button
                    onClick={() => handleRespond(inv._id, 'reject')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InvitationsPage;
