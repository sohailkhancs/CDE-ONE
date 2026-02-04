
import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Home,
  Wrench,
  ClipboardCheck,
  Target,
  FileText,
  Users,
  Search,
  Clock,
  Camera,
  Image as ImageIcon,
  BarChart3,
  LayoutGrid,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { INITIAL_TASKS } from '../../../lib/constants';
import Badge from '../../../components/ui/Badge';

// --- Mock Data for Charts ---
const lineData = [
  { date: 'Week 27 2024', tasks: 0 },
  { date: 'Week 30', tasks: 15 },
  { date: 'Week 33', tasks: 70 },
  { date: 'Week 36', tasks: 75 },
  { date: 'Week 40 2024', tasks: 95 },
  { date: 'Week 43', tasks: 40 },
  { date: 'Week 46', tasks: 60 },
  { date: 'Week 50', tasks: 45 },
  { date: 'Week 53 2024', tasks: 42 },
  { date: 'Week 05 2025', tasks: 40 },
  { date: 'Week 10', tasks: 38 },
];

const barData = [
  { package: 'Carpentry', open: 25, overdue: 15 },
  { package: 'Electrical', open: 10, overdue: 5 },
  { package: 'Plumbing', open: 3, overdue: 10 },
];

const FieldView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'all-tasks'>('analytics');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    home: true,
    tasks: true,
    capture: true,
    meetings: true
  });

  const toggleMenu = (key: string) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSidebarItem = (
    icon: React.ComponentType<{ size?: number }>,
    label: string,
    id?: string,
    count?: number,
    isSubItem = false,
    hasSubItems = false,
    menuKey?: string
  ) => {
    const isExpanded = menuKey ? expandedMenus[menuKey] : false;
    const isActive = activeTab === id;

    return (
      <div className="flex flex-col">
        <button
          onClick={() => {
            if (hasSubItems && menuKey) toggleMenu(menuKey);
            if (id) setActiveTab(id as 'analytics' | 'all-tasks');
          }}
          className={`group flex items-center px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-slate-200/50 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            } ${isSubItem ? 'pl-10' : ''}`}
        >
          {hasSubItems && (
            <span className="mr-1 text-slate-400">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          {!hasSubItems && !isSubItem && <span className="w-4 mr-1"></span>}
          {icon && <span className={`mr-3 ${isActive ? 'text-red-600' : 'text-slate-500'}`}>{React.createElement(icon, { size: 18 })}</span>}
          <span className="flex-1 text-left truncate">{label}</span>
          {count !== undefined && <span className="ml-2 text-[11px] text-slate-400 font-bold">{count}</span>}
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Secondary Sidebar (Field Nav) */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="py-4 space-y-1 overflow-y-auto">
          {/* Home Section */}
          {renderSidebarItem(Home, 'Home', undefined, undefined, false, true, 'home')}
          {expandedMenus['home'] && (
            <>
              {renderSidebarItem(BarChart3, 'Analytics', 'analytics', undefined, true)}
              {renderSidebarItem(LayoutGrid, 'Task types', 'types', undefined, true)}
            </>
          )}

          {/* Tasks Section */}
          {renderSidebarItem(Wrench, 'Tasks', undefined, undefined, false, true, 'tasks')}
          {expandedMenus['tasks'] && (
            <>
              {renderSidebarItem(Search, 'All tasks', 'all-tasks', 284, true)}
            </>
          )}

          {/* Checklists */}
          {renderSidebarItem(ClipboardCheck, 'Checklists', 'checklists', undefined, false, true, 'checklists')}

          {/* Capture Section */}
          {renderSidebarItem(Target, 'Capture', undefined, undefined, false, true, 'capture')}
          {expandedMenus['capture'] && (
            <>
              {renderSidebarItem(Camera, '360° photos', '360', undefined, true)}
              {renderSidebarItem(ImageIcon, 'Photo albums', 'albums', undefined, true)}
            </>
          )}

          {/* Daily Log */}
          {renderSidebarItem(FileText, 'Daily log', 'log')}

          {/* Meetings Section */}
          {renderSidebarItem(Users, 'Meetings', undefined, undefined, false, true, 'meetings')}
          {expandedMenus['meetings'] && (
            <>
              {renderSidebarItem(Search, 'All meetings', 'all-meetings', undefined, true)}
              {renderSidebarItem(Search, 'All meeting items', 'all-items', undefined, true)}
              {renderSidebarItem(Users, 'My meeting items', 'my-items', undefined, true)}
              <div className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 pl-10 hover:bg-slate-100 cursor-pointer">
                <Clock size={18} className="mr-3 text-red-600" />
                <span className="flex-1 text-left">Overdue items</span>
              </div>
            </>
          )}
        </div>

        {/* Bottom Red Accent Area from Picture */}
        <div className="mt-auto p-4 bg-red-600 text-white flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest">Field Active</span>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-100 flex flex-col transition-all duration-500 ease-in-out">
        {activeTab === 'analytics' ? (
          <div className="p-6 space-y-6">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                <button className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border-r border-slate-200 rounded flex items-center">
                  Work package <ChevronDown size={14} className="ml-2" />
                </button>
                <div className="px-4 py-1.5 text-xs font-bold text-slate-400">
                  Select value...
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex space-x-1 border-b border-slate-200">
              <button className="px-6 py-3 text-sm font-bold border-b-2 border-red-600 text-slate-900 bg-white shadow-sm rounded-t-lg">
                Open <span className="ml-2 px-1.5 py-0.5 bg-slate-200 rounded text-[10px] text-slate-600">38</span>
              </button>
              <button className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 bg-transparent">
                Overdue <span className="ml-2 px-1.5 py-0.5 bg-red-600 rounded text-[10px] text-white">30</span>
              </button>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Tasks over time</h3>
                  <select className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none">
                    <option>All</option>
                  </select>
                </div>
                <div className="p-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        padding={{ left: 20, right: 20 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        label={{ value: 'Number of tasks', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b', fontWeight: 'bold' } }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="tasks"
                        stroke="#991b1b"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#991b1b', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end">
                  <button className="text-xs font-bold text-slate-600 hover:text-red-600 flex items-center">
                    View tasks <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Tasks by work package</h3>
                </div>
                <div className="p-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={barData} margin={{ left: 40, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis type="category" dataKey="package" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="open" stackId="a" fill="#a8a29e" radius={[0, 0, 0, 0]} barSize={40} />
                      <Bar dataKey="overdue" stackId="a" fill="#991b1b" radius={[0, 4, 4, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end">
                  <button className="text-xs font-bold text-slate-600 hover:text-red-600 flex items-center">
                    View tasks <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Task List View (Sub-window sliding into view) */
          <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">All Project Tasks</h2>
                <p className="text-sm text-slate-500 font-medium">Viewing 284 field observations</p>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center"
              >
                <ArrowLeft size={14} className="mr-2" /> BACK TO ANALYTICS
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none"
                />
              </div>
              <button className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700">
                <Filter size={18} className="mr-2 text-slate-400" /> STATUS
              </button>
              <button className="bg-red-600 text-white font-bold rounded-xl text-sm flex items-center justify-center shadow-lg shadow-red-900/10">
                <Plus size={18} className="mr-2" /> NEW TASK
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_TASKS.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 font-bold text-sm text-slate-800">{task.title}</td>
                      <td className="px-6 py-5 text-sm text-slate-500">{task.assignee}</td>
                      <td className="px-6 py-5"><Badge status={task.status} /></td>
                      <td className="px-6 py-5 text-right"><MoreHorizontal className="text-slate-400 inline cursor-pointer" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Simple icon wrapper for internal use
const ArrowLeft = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
);

const Plus = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);

export default FieldView;
