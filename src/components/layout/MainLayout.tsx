
import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderTree,
  GanttChartSquare,
  HardHat,
  Box,
  ClipboardCheck,
  NotebookPen,
  Users,
  Sparkles,
  Sliders,
  Bell,
  Search,
  ChevronDown,
  Menu,
  LogOut,
  Map as MapIcon // Keep generic map just in case
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/features/auth';

// Items mapping
// We use 'path' instead of 'id' to map to routes directly.
const MENU_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/docs', label: 'Documents', icon: FolderTree },
  { path: '/planner', label: 'Planner (WBS)', icon: GanttChartSquare },
  { path: '/field', label: 'Field Tasks', icon: HardHat },
  { path: '/bim', label: 'BIM Viewer', icon: Box },
  { path: '/inspections', label: 'Inspections', icon: ClipboardCheck },
  { path: '/reports', label: 'Daily Reports', icon: NotebookPen },
  { path: '/team', label: 'Team', icon: Users, roles: ['Admin', 'Project Manager'] },
  { path: '/ai', label: 'AI Assistant', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: Sliders, roles: ['Admin'] },
];

interface LayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredMenuItems = MENU_ITEMS.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-[#0f172a] text-slate-300 transition-all duration-300 flex flex-col flex-shrink-0 z-30 shadow-xl ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center mr-3 shrink-0 shadow-lg shadow-red-900/30">
            <span className="font-bold text-white text-xs">C1</span>
          </div>
          {isSidebarOpen && <span className="font-bold text-white text-lg tracking-tight">CDE-ONE</span>}
        </div>

        <div className="p-4">
          <button className="w-full bg-slate-800/50 hover:bg-slate-800 text-left rounded-lg p-2 border border-slate-700/50 flex items-center justify-between transition-all">
            {isSidebarOpen ? (
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Project</span>
                <span className="text-xs font-semibold text-white truncate">Skyline Tower Ph 2</span>
              </div>
            ) : <div className="mx-auto"><MapIcon size={16} /></div>}
            {isSidebarOpen && <ChevronDown size={14} className="text-slate-500" />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center p-3 rounded-lg transition-all group ${isActive(item.path)
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
            >
              <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
              {isSidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto space-y-2">
          <div className="flex items-center p-2 rounded-lg bg-slate-800/50 group">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {user?.avatar || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-[9px] uppercase font-bold text-slate-500">{user?.role}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button
                onClick={logout}
                className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
          {!isSidebarOpen && (
            <button onClick={logout} className="w-full flex justify-center p-2 text-slate-500 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500">ST-P2</span>
              <span className="text-sm font-semibold text-slate-700">Skyline Tower Phase 2</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search drawings, tasks..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
