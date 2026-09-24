import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { milestoneService, sprintService, projectService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { Calendar, Flag, Zap, Clock } from 'lucide-react';

const TimelinePage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const [projRes, mileRes, sprintRes] = await Promise.all([
          projectService.getProjectById(projectId),
          milestoneService.getMilestones(projectId),
          sprintService.getSprints(projectId),
        ]);

        if (projRes.data.success) setProject(projRes.data.data);
        if (mileRes.data.success) setMilestones(mileRes.data.data);
        if (sprintRes.data.success) setSprints(sprintRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [projectId]);

  if (loading) return <LoadingSpinner text="Loading project timeline..." />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sky-400" /> Project Timeline
        </h2>
        <p className="text-sm text-slate-400">
          Visual roadmap showing milestone target dates, sprint timelines, and release deadlines.
        </p>
      </div>

      {/* Project Start & End Dates Header */}
      {project && (
        <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4 border-sky-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{project.name} Roadmap</h3>
              <p className="text-xs text-slate-400">Project Key: [{project.projectKey}]</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <div>
              <span className="text-slate-500 uppercase block">Start Date</span>
              <span className="text-slate-200">{new Date(project.startDate).toLocaleDateString()}</span>
            </div>
            {project.endDate && (
              <div>
                <span className="text-slate-500 uppercase block">Target Completion</span>
                <span className="text-sky-400 font-bold">{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Milestones & Sprints Timeline Track */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Flag className="w-5 h-5 text-purple-400" /> Milestones Roadmap
        </h3>

        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6">
          {milestones.map((m) => (
            <div key={m._id} className="relative group">
              {/* Timeline Bullet */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-purple-500 group-hover:scale-125 transition-transform" />

              <div className="glass-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100">{m.name}</h4>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-xs text-slate-400">{m.description}</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Due Date: {new Date(m.dueDate).toLocaleDateString()}
                  </span>
                  <span className="font-mono font-bold text-purple-400">{m.progress}% Completed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" /> Sprint Iterations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sprints.map((s) => (
            <div key={s._id} className="glass-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100">{s.name}</h4>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{s.goal || 'No goal statement'}</p>
              <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                {s.startDate ? new Date(s.startDate).toLocaleDateString() : 'TBD'} -{' '}
                {s.endDate ? new Date(s.endDate).toLocaleDateString() : 'TBD'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
