/**
 * Project Overview Dashboard - Comprehensive project statistics and quick actions
 */
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  ClipboardList,
  MessageSquare,
  Eye,
  Download,
  Upload,
  Plus,
  ArrowRight,
  Building2,
  Wrench,
  ShieldCheck,
  BarChart3,
  Grid3x3,
  Activity
} from 'lucide-react';
import { PROJECTS, PROJECT_TYPE_INFO, PROJECT_STATUS_INFO } from '../../../data/projects';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ProjectOverview: React.FC = () => {
  const { projectId } = useParams();
  const project = PROJECTS.find((p) => p.id === projectId);

  if (!project) return null;

  const typeInfo = PROJECT_TYPE_INFO[project.type];
  const statusInfo = PROJECT_STATUS_INFO[project.status];

  // Sample chart data
  const progressData = [
    { month: 'Jan', planned: 10, actual: 10 },
    { month: 'Feb', planned: 20, actual: 18 },
    { month: 'Mar', planned: 35, actual: 32 },
    { month: 'Apr', planned: 50, actual: 45 },
    { month: 'May', planned: 65, actual: 60 },
    { month: 'Jun', planned: 75, actual: 68 },
  ];

  const documentStats = [
    { name: 'Published', value: project.stats.documents * 0.6, color: '#10b981' },
    { name: 'WIP', value: project.stats.documents * 0.25, color: '#f59e0b' },
    { name: 'Archive', value: project.stats.documents * 0.15, color: '#64748b' },
  ];

  const activities = [
    { id: '1', type: 'upload', user: 'Sarah Chen', item: 'A-101 Floor Plan v2.3', time: '5 min ago', avatar: 'SC' },
    { id: '2', type: 'rfi', user: 'James Wilson', item: 'RFI-045: Structural query', time: '1 hour ago', avatar: 'JW' },
    { id: '3', type: 'inspection', user: 'Maria Garcia', item: 'MEP inspection passed', time: '2 hours ago', avatar: 'ME' },
    { id: '4', type: 'comment', user: 'David Kim', item: 'Re: Phase 3 deliverables', time: '3 hours ago', avatar: 'DK' },
    { id: '5', type: 'alert', user: 'System', item: 'Weather delay alert issued', time: '5 hours ago', avatar: '!' },
    { id: '6', type: 'task', user: 'Sarah Chen', item: 'Task marked complete', time: 'Yesterday', avatar: 'SC' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload size={16} className="text-blue-500" />;
      case 'rfi': return <MessageSquare size={16} className="text-purple-500" />;
      case 'inspection': return <ClipboardList size={16} className="text-green-500" />;
      case 'comment': return <MessageSquare size={16} className="text-slate-400" />;
      case 'alert': return <AlertCircle size={16} className="text-red-500" />;
      case 'task': return <CheckCircle size={16} className="text-emerald-500" />;
      default: return <Activity size={16} className="text-slate-400" />;
    }
  };

  const quickActions = [
    { id: 'docs', label: 'Documents', icon: FileText, count: project.stats.documents, color: 'bg-blue-500', link: `documents` },
    { id: 'rfis', label: 'RFIs', icon: MessageSquare, count: project.stats.rfis, color: 'bg-purple-500', link: `rfis` },
    { id: 'defects', label: 'Issues', icon: AlertCircle, count: project.stats.defects, color: 'bg-red-500', link: `issues` },
    { id: 'inspections', label: 'Inspections', icon: ClipboardList, count: project.stats.inspections, color: 'bg-green-500', link: `inspections` },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`bg-gradient-to-r ${typeInfo.gradient} rounded-2xl p-8 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2 opacity-80">
            {typeInfo.icon}
            <span className="text-sm font-medium uppercase tracking-wider">{project.type}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-white/80 max-w-2xl">{project.description}</p>
          <div className="flex items-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <MapPin size={18} />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 size={18} />
              <span>{project.client}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={18} />
              <span>
                {new Date(project.timeline.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' - '}
                {new Date(project.timeline.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-xl">
              <FileText size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{project.stats.documents}</div>
          <div className="text-sm text-slate-500">Documents</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-xl">
              <MessageSquare size={20} className="text-purple-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{project.stats.rfis}</div>
          <div className="text-sm text-slate-500">RFIs</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-xl">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{project.stats.defects}</div>
          <div className="text-sm text-slate-500">Issues</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-xl">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Done</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{project.stats.inspections}</div>
          <div className="text-sm text-slate-500">Inspections</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Progress vs Plan</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-300 mr-1"></div>Planned</span>
              <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>Actual</span>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="actual" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.link}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                    <action.icon size={18} className={action.color} />
                  </div>
                  <span className="font-medium text-slate-900">{action.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-slate-900">{action.count}</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Recent Activity</h3>
            <Link to="#" className="text-sm text-red-600 hover:text-red-700 font-medium">View All</Link>
          </div>
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 transition">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{activity.user}</span>
                      <span className="mx-1 text-slate-300">•</span>
                      <span className="text-slate-900 font-medium">{activity.item}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Project Team</h3>
            <Link to="team" className="text-sm text-red-600 hover:text-red-700 font-medium">Manage</Link>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {project.team.members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {member.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                  <p className="text-xs text-slate-500 truncate">{member.role}</p>
                </div>
              </div>
            ))}
            {project.team.total > project.team.members.length && (
              <div className="flex items-center justify-center p-3 rounded-xl border border-slate-100 text-sm text-slate-500">
                <Plus size={16} className="mr-1" />
                {project.team.total - project.team.members.length} more
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Clock size={20} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800">Timeline</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Start Date</span>
              <span className="text-sm font-medium text-slate-900">{new Date(project.timeline.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">End Date</span>
              <span className="text-sm font-medium text-slate-900">{new Date(project.timeline.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Duration</span>
              <span className="text-sm font-medium text-slate-900">{Math.ceil((new Date(project.timeline.end).getTime() - new Date(project.timeline.start).getTime()) / (1000 * 60 * 60 * 24))} days</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-600">Remaining</span>
              <span className="text-sm font-bold text-amber-600">{project.timeline.daysRemaining} days</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-50 rounded-xl">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <h3 className="font-bold text-slate-800">Budget</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Budget</span>
              <span className="text-sm font-medium text-slate-900">
                {project.budget.currency === 'GBP' ? '£' : '$'}{(project.budget.total / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Spent to Date</span>
              <span className="text-sm font-medium text-slate-900">
                {project.budget.currency === 'GBP' ? '£' : '$'}{(project.budget.spent / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Remaining</span>
              <span className="text-sm font-medium text-slate-900">
                {project.budget.currency === 'GBP' ? '£' : '$'}{((project.budget.total - project.budget.spent) / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-600">Utilization</span>
              <span className="text-sm font-bold text-slate-900">{((project.budget.spent / project.budget.total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Grid3x3 size={20} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800">Project Info</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Project Code</span>
              <span className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{project.code}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Current Phase</span>
              <span className="text-sm font-medium text-slate-900">{project.phase}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Status</span>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ISO Badge */}
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-xl">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span className="text-sm font-medium text-slate-700">ISO 19650 Compliant CDE</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
