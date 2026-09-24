import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { reportService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, CheckCircle, AlertOctagon, Zap } from 'lucide-react';

const COLORS = ['#38bdf8', '#818cf8', '#f59e0b', '#34d399', '#f43f5e'];

const ReportsPage = () => {
  const { projectId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const { data } = await reportService.getProjectReport(projectId);
        if (data.success) {
          setReportData(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [projectId]);

  if (loading) return <LoadingSpinner text="Generating Recharts project analytics..." />;
  if (!reportData) return <div className="text-center py-12 text-slate-400">No report data available</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sky-400" /> Project Velocity & Reporting
        </h2>
        <p className="text-sm text-slate-400">
          Visual metrics for task completion status, defect severity, and story point velocity.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Tasks</span>
          <h3 className="text-2xl font-extrabold text-slate-100">{reportData.totalTasks}</h3>
          <p className="text-xs text-emerald-400 font-semibold">{reportData.completedTasks} completed</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Story Points</span>
          <h3 className="text-2xl font-extrabold text-sky-400">{reportData.totalStoryPoints} pts</h3>
          <p className="text-xs text-slate-400">{reportData.completedStoryPoints} pts delivered</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Defect Issues</span>
          <h3 className="text-2xl font-extrabold text-rose-400">{reportData.totalIssues}</h3>
          <p className="text-xs text-emerald-400 font-semibold">{reportData.resolvedIssues} resolved</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Release Milestones</span>
          <h3 className="text-2xl font-extrabold text-purple-400">{reportData.totalMilestones}</h3>
          <p className="text-xs text-slate-400">{reportData.completedMilestones} achieved</p>
        </div>
      </div>

      {/* Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Distribution Chart */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-sky-400" /> Task Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.taskStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {reportData.taskStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Task Priority Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.taskPriorityDistribution}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
