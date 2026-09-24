import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { activityService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MemberAvatar from '../components/common/MemberAvatar';
import { Activity as ActivityIcon, Clock } from 'lucide-react';

const ActivityPage = () => {
  const { projectId } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const { data } = await activityService.getActivities({
          project: projectId || undefined,
          limit: 50,
        });
        if (data.success) {
          setActivities(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [projectId]);

  if (loading) return <LoadingSpinner text="Loading activity audit log stream..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ActivityIcon className="w-6 h-6 text-sky-400" /> Project Activity Audit Feed
        </h2>
        <p className="text-sm text-slate-400">
          Chronological record of project mutations, sprint changes, task status transitions, and issue reports.
        </p>
      </div>

      <div className="glass-card p-6 divide-y divide-slate-800">
        {activities.map((act) => (
          <div key={act._id} className="py-4 flex items-start gap-4">
            <MemberAvatar user={act.user} size="md" />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-slate-200">{act.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(act.createdAt).toLocaleString()}
                </span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-sky-400 border border-slate-800">
                  {act.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityPage;
