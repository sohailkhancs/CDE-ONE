/**
 * Project Hub - Professional Project Selection Dashboard
 * Similar to Procode/Dalux project home screen
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Grid,
  List,
  Filter,
  Plus,
  Star,
  TrendingUp,
  Clock,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Calendar,
  MapPin,
  Building2,
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { PROJECTS, PROJECT_TYPE_INFO, PROJECT_STATUS_INFO } from '../../../data/projects';
import type { Project, ProjectType, ProjectStatus } from '../../../types/projects';
import { useAuth } from '../../../features/auth';

import CreateProjectModal from '../components/CreateProjectModal';

const ProjectHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem('cde_projects');
    const localProjects = stored ? JSON.parse(stored) : [];
    // Combine local projects (newly created) with static demo projects
    // Put local projects first so they appear at the top
    return [...localProjects, ...PROJECTS];
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ProjectType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress'>('recent');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      // Search filter
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = filterType === 'all' || project.type === filterType;

      // Status filter
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return b.progress - a.progress;
        case 'recent':
        default:
          return new Date(b.timeline.start).getTime() - new Date(a.timeline.start).getTime();
      }
    });

    return filtered;
  }, [projects, searchQuery, filterType, filterStatus, sortBy]);

  const handleCreateProject = (newProjectData: Partial<Project>) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...newProjectData as Project,
      // Ensure complex objects are initialized if missing from form data
      team: newProjectData.team || { total: 1, members: [] },
      stats: newProjectData.stats || { documents: 0, rfis: 0, defects: 0, inspections: 0, tasks: { total: 0, completed: 0 } },
      timeline: newProjectData.timeline || { start: new Date().toISOString(), end: new Date().toISOString(), daysRemaining: 0 },
      budget: newProjectData.budget || { total: 0, spent: 0, currency: 'USD' }
    };

    // Save to local storage
    const stored = localStorage.getItem('cde_projects');
    const localProjects = stored ? JSON.parse(stored) : [];
    localStorage.setItem('cde_projects', JSON.stringify([newProject, ...localProjects]));

    setProjects(prev => [newProject, ...prev]);

    // Close modal and navigate to the new project dashboard
    setIsCreateModalOpen(false);
    navigate(`/project/${newProject.id}`);
  };

  const getProjectHealthColor = (project: Project) => {
    if (project.progress >= 80) return 'text-emerald-600 bg-emerald-50';
    if (project.progress >= 50) return 'text-blue-600 bg-blue-50';
    if (project.progress >= 25) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getProjectTypeColor = (type: ProjectType) => {
    const colors: Record<ProjectType, string> = {
      Hospital: 'text-red-600 bg-red-50 border-red-200',
      Housing: 'text-blue-600 bg-blue-50 border-blue-200',
      Commercial: 'text-purple-600 bg-purple-50 border-purple-200',
      Infrastructure: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      Industrial: 'text-amber-600 bg-amber-50 border-amber-200',
      Education: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    };
    return colors[type];
  };

  const toggleFavorite = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    // In a real app, this would update the backend
    console.log('Toggle favorite:', projectId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Building2 className="mr-3 text-red-600" size={28} />
                My Projects
              </h1>
              <p className="text-slate-500 mt-1">Select a project to access the Common Data Environment</p>
            </div>

            {/* Create Project Button - Admin Only */}
            {user?.role === 'Admin' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
              >
                <Plus size={18} className="mr-2" />
                New Project
              </button>
            )}
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search projects by name, code, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition"
              />
            </div>

            {/* Filter dropdowns */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ProjectType | 'all')}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
            >
              <option value="all">All Types</option>
              <option value="Hospital">🏥 Hospital</option>
              <option value="Housing">🏠 Housing</option>
              <option value="Commercial">🏢 Commercial</option>
              <option value="Infrastructure">🛣️ Infrastructure</option>
              <option value="Industrial">🏭 Industrial</option>
              <option value="Education">🎓 Education</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
            >
              <option value="all">All Status</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Alphabetical</option>
              <option value="progress">Progress</option>
            </select>

            {/* View toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Results count */}
            <div className="ml-auto text-sm text-slate-500">
              <span className="font-bold text-slate-900">{filteredProjects.length}</span> projects
            </div>
          </div>
        </div>
      </header>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => {
              const typeInfo = PROJECT_TYPE_INFO[project.type];
              const statusInfo = PROJECT_STATUS_INFO[project.status];

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Project Cover Image */}
                  <div className={`h-36 bg-gradient-to-br ${typeInfo.gradient} relative overflow-hidden`}>
                    {/* Type Icon Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${typeInfo.color}`}>
                        <span className="mr-1">{typeInfo.icon}</span>
                        {project.type}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusInfo.color} flex items-center`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} mr-1.5`}></div>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(e, project.id)}
                      className="absolute bottom-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition"
                    >
                      {project.isFavorite ? (
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      ) : (
                        <Star className="w-5 h-5 text-white/70" />
                      )}
                    </button>

                    {/* Project Code */}
                    <div className="absolute bottom-4 left-4">
                      <span className="text-white/80 text-xs font-mono bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                        {project.code}
                      </span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-base mb-1 truncate group-hover:text-red-600 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 flex items-center">
                      <MapPin size={12} className="mr-1 flex-shrink-0" />
                      {project.location}
                    </p>

                    {/* Client */}
                    <div className="mb-4">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Client</p>
                      <p className="text-sm text-slate-700 font-medium truncate">{project.client}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-bold text-slate-900">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 to-red-600"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {new Date(project.timeline.end).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {project.timeline.daysRemaining} days left
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center text-xs text-slate-500">
                        <FileText size={14} className="mr-1 text-slate-400" />
                        <span className="font-bold text-slate-900">{project.stats.documents}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Users size={14} className="mr-1 text-slate-400" />
                        <span className="font-bold text-slate-900">{project.team.total}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <AlertCircle size={14} className="mr-1 text-slate-400" />
                        <span className="font-bold text-slate-900">{project.stats.rfis}</span>
                      </div>
                    </div>

                    {/* Health Indicator */}
                    <div className={`mt-4 pt-4 border-t border-slate-100 flex items-center justify-between`}>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Project Health</span>
                      <div className={`flex items-center space-x-1 text-xs font-bold ${getProjectHealthColor(project)}`}>
                        {project.progress >= 80 ? (
                          <>
                            <CheckCircle size={14} />
                            <span>On Track</span>
                          </>
                        ) : project.progress >= 50 ? (
                          <>
                            <TrendingUp size={14} />
                            <span>Good</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} />
                            <span>Needs Attention</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => {
                  const typeInfo = PROJECT_TYPE_INFO[project.type];
                  const statusInfo = PROJECT_STATUS_INFO[project.status];

                  return (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-xl ${typeInfo.color} flex items-center justify-center text-lg mr-4`}>
                            {typeInfo.icon}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{project.name}</div>
                            <div className="text-xs text-slate-500">{project.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${statusInfo.color}`}>
                          {project.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{project.client}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div>{new Date(project.timeline.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div className="text-xs text-slate-500">{project.timeline.daysRemaining} days left</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {project.team.members.slice(0, 3).map((member, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600"
                              title={member.name}
                            >
                              {member.avatar}
                            </div>
                          ))}
                          {project.team.total > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                              +{project.team.total - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* ISO 19650 Badge */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3">
          <ShieldCheck size={20} className="text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">CDE Platform</div>
            <div className="text-sm font-bold">ISO 19650 Compliant</div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default ProjectHub;
