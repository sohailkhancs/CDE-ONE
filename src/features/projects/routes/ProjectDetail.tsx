/**
 * Project Detail Page - Professional project view with module navigation
 * Similar to Procore/Dalux project workspace
 */
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Building2,
  Calendar,
  Map,
  Users,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  ChevronRight,
  Bell,
  Search,
  Grid,
  Menu,
  X,
  Star,
  FolderTree,
  Wrench,
  ClipboardList,
  Eye,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  LogOut,
  Plus,
  Filter
} from 'lucide-react';
import { PROJECTS, PROJECT_TYPE_INFO, PROJECT_STATUS_INFO } from '../../../data/projects';
import type { Project } from '../../../types/projects';
import { useAuth } from '../../../features/auth';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Find project
  const project = useMemo(() => {
    const stored = localStorage.getItem('cde_projects');
    const localProjects = stored ? JSON.parse(stored) : [];
    const allProjects = [...(localProjects as Project[]), ...PROJECTS];
    return allProjects.find((p) => p.id === projectId);
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h1>
          <button
            onClick={() => navigate('/project-hub')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const typeInfo = PROJECT_TYPE_INFO[project.type];
  const statusInfo = PROJECT_STATUS_INFO[project.status];

  // Module navigation items
  const modules = [
    { id: 'overview', name: 'Overview', icon: Home, path: `/project/${projectId}` },
    { id: 'documents', name: 'Documents', icon: FileText, path: `/project/${projectId}/documents`, badge: project.stats.documents },
    { id: 'bim', name: 'BIM Model', icon: Building2, path: `/project/${projectId}/bim` },
    { id: 'planner', name: 'Planner', icon: Calendar, path: `/project/${projectId}/planner` },
    { id: 'field', name: 'Field', icon: Map, path: `/project/${projectId}/field` },
    { id: 'inspections', name: 'Inspections', icon: ClipboardList, path: `/project/${projectId}/inspections`, badge: project.stats.inspections },
    { id: 'team', name: 'Team', icon: Users, path: `/project/${projectId}/team` },
    { id: 'reports', name: 'Reports', icon: BarChart3, path: `/project/${projectId}/reports` },
    { id: 'settings', name: 'Settings', icon: Settings, path: `/project/${projectId}/settings` },
  ];

  // Get current module
  const currentModule = modules.find((m) => location.pathname === m.path)?.id || 'overview';

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Project Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => navigate('/project-hub')}
            className="flex items-center text-slate-500 hover:text-slate-700 mb-4 text-sm font-medium transition-colors"
          >
            <ChevronRight size={16} className="rotate-180 mr-1" />
            Back to Projects
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl ${typeInfo.color} flex items-center justify-center text-xl`}>
                {typeInfo.icon}
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm leading-tight">{project.name}</h2>
                <p className="text-xs text-slate-500 font-mono">{project.code}</p>
              </div>
            </div>
            <button
              onClick={() => {/* Toggle favorite */ }}
              className="text-slate-300 hover:text-yellow-500 transition-colors"
            >
              {project.isFavorite ? <Star className="w-5 h-5 text-yellow-400 fill-current" /> : <Star className="w-5 h-5 text-slate-300" />}
            </button>
          </div>
        </div>

        {/* Project Quick Stats */}
        <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
            <span className="text-sm font-bold text-slate-900">{project.progress}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>{project.phase}</span>
            <span>{project.timeline.daysRemaining} days left</span>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {modules.map((module) => {
            const isActive = location.pathname === module.path;
            return (
              <Link
                key={module.id}
                to={module.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${isActive
                    ? 'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100'
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center">
                  <module.icon className={`mr-3 ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'} size={18}`} />
                  <span className="font-medium text-sm">{module.name}</span>
                </div>
                {module.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {module.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Budget Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget</span>
              <span className="text-xs font-bold text-slate-900">
                {project.budget.currency === 'GBP' ? '£' : '$'}{((project.budget.spent / project.budget.total) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(project.budget.spent / project.budget.total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Spent: {project.budget.currency === 'GBP' ? '£' : '$'}{(project.budget.spent / 1000000).toFixed(1)}M</span>
              <span>Total: {project.budget.currency === 'GBP' ? '£' : '$'}{(project.budget.total / 1000000).toFixed(1)}M</span>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                {user?.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => {/* Logout */ }}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Project Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-slate-500 text-sm">{project.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
