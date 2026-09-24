import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { reportService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MemberAvatar from '../components/common/MemberAvatar';
import { Users, CheckCircle2, Clock, BarChart } from 'lucide-react';

const WorkloadPage = () => {
  const { projectId } = useParams();
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkload = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const { data } = await reportService.getWorkloadReport(projectId);
        if (data.success) {
          setWorkload(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkload();
  }, [projectId]);

  if (loading) return <LoadingSpinner text="Calculating team workload distribution..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-sky-400" /> Team Workload Dashboard
        </h2>
        <p className="text-sm text-slate-400">
          Oversight of task distribution, active sprint commitments, and story point load per developer.
        </p>
      </div>

      {/* Workload Roster Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Team Member</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Assigned Tasks</th>
                <th className="p-4 text-center">In Progress</th>
                <th className="p-4 text-center">Completed</th>
                <th className="p-4 text-center">Story Points</th>
                <th className="p-4 text-center">Active Sprint Workload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workload.map((item) => (
                <tr key={item.userId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <MemberAvatar
                      user={{ name: item.name, email: item.email, avatar: item.avatar }}
                      size="md"
                      showName
                    />
                  </td>
                  <td className="p-4 font-semibold uppercase text-slate-300">{item.role}</td>
                  <td className="p-4 text-center font-extrabold text-slate-100">{item.totalAssigned}</td>
                  <td className="p-4 text-center font-bold text-sky-400">{item.inProgress}</td>
                  <td className="p-4 text-center font-bold text-emerald-400">{item.completed}</td>
                  <td className="p-4 text-center font-mono font-bold text-purple-400">
                    {item.storyPoints} pts
                  </td>
                  <td className="p-4 text-center font-bold text-amber-400">
                    {item.activeSprintWorkload} tasks
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkloadPage;
