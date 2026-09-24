import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { issueService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import MemberAvatar from '../components/common/MemberAvatar';
import Modal from '../components/common/Modal';
import CommentSection from '../components/comments/CommentSection';
import { AlertOctagon, Plus, CheckCircle, RefreshCw } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const IssuesPage = () => {
  const { projectId } = useParams();
  const { activeProject } = useProject();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');

  // Detail Modal
  const [selectedIssue, setSelectedIssue] = useState(null);

  const fetchIssues = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await issueService.getIssues({
        project: projectId,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
      });
      if (data.success) {
        setIssues(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [projectId, severityFilter, statusFilter]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const { data } = await issueService.createIssue({
        project: projectId,
        title,
        description,
        severity,
        reproductionSteps,
        expectedResult,
        actualResult,
      });
      if (data.success) {
        setIsCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setReproductionSteps('');
        fetchIssues();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to report issue');
    }
  };

  const handleStatusUpdate = async (issueId, status, resolution = '') => {
    try {
      const { data } = await issueService.updateIssueStatus(issueId, status, resolution);
      if (data.success) {
        if (selectedIssue && selectedIssue._id === issueId) {
          setSelectedIssue(data.data);
        }
        fetchIssues();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update issue status');
    }
  };

  if (loading && issues.length === 0) return <LoadingSpinner text="Loading issue tracker..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-500" /> Issue Tracker
          </h2>
          <p className="text-sm text-slate-400">
            Log software bugs, track severity levels, and document reproduction steps.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" />
          Report Issue
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex items-center gap-4">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
        >
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Issues Table List */}
      <div className="glass-card p-6 space-y-3">
        {issues.map((issue) => (
          <div
            key={issue._id}
            onClick={() => setSelectedIssue(issue)}
            className="p-4 bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/50 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  issue.severity === 'critical' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  issue.severity === 'high' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {issue.severity}
                </span>
                <h4 className="text-sm font-semibold text-slate-100 truncate">{issue.title}</h4>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{issue.description}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={issue.status} />
              <MemberAvatar user={issue.reporter} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Create Issue Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Report New Issue">
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Issue Title *</label>
            <input
              type="text"
              required
              placeholder="CORS header missing on Login endpoint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Overview of the defect..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Reproduction Steps</label>
            <textarea
              rows={2}
              placeholder="1. Open browser console&#10;2. Click login button..."
              value={reproductionSteps}
              onChange={(e) => setReproductionSteps(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg text-sm">
              Submit Issue
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedIssue && (
        <Modal
          isOpen={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
          title={`Issue Detail: ${selectedIssue.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedIssue.status} />
                <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-xs font-bold uppercase">
                  {selectedIssue.severity} Severity
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusUpdate(selectedIssue._id, 'resolved', 'Fixed and verified in build.')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedIssue._id, 'reopened')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reopen
                </button>
              </div>
            </div>

            {selectedIssue.reproductionSteps && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Reproduction Steps</h4>
                <pre className="p-3 bg-slate-950 text-xs text-slate-300 rounded-xl border border-slate-800 font-mono whitespace-pre-wrap">
                  {selectedIssue.reproductionSteps}
                </pre>
              </div>
            )}

            <CommentSection entityType="Issue" entityId={selectedIssue._id} projectId={projectId} />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default IssuesPage;
