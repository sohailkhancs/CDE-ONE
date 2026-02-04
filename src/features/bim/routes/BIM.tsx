
import React, { useState } from 'react';
import {
  Plus,
  Layers,
  AlertCircle,
  CheckCircle2,
  Box,
  Compass,
  Sliders,
  Eye,
  EyeOff,
  BoxSelect,
  MousePointer2,
  Rotate3d
} from 'lucide-react';
import { Task } from '../../../types';
import { INITIAL_TASKS } from '../../../lib/constants';

type ViewMode = '2d' | '3d' | 'overlay';

const BIMView: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  // const [activeLayer, setActiveLayer] = useState('arch');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('overlay');
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  const [showLayers, setShowLayers] = useState(false);
  const [visibleDisciplines, setVisibleDisciplines] = useState({
    architecture: true,
    structural: true,
    mep: false
  });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingTask) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newTask: Task = {
      id: `t${Date.now()}`,
      type: 'Defect',
      status: 'Open',
      title: 'New Site Issue',
      location: { x, y },
      assignee: 'Unassigned',
      priority: 'Medium',
      due: '2024-12-31',
      discipline: 'General'
    };

    setTasks([...tasks, newTask]);
    setIsAddingTask(false);
  };

  const toggleDiscipline = (disc: keyof typeof visibleDisciplines) => {
    setVisibleDisciplines(prev => ({ ...prev, [disc]: !prev[disc] }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Viewer Toolbar */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="bg-red-50 p-2 rounded-lg border border-red-100">
            <Box size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Coordinate View: L1 - Ground Floor</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Live Federated Model • ISO 19650 Compliant
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200 shadow-inner">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === '2d' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              2D PLAN
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'overlay' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              OVERLAY
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === '3d' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              3D MODEL
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200 shadow-inner">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.2))} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition font-bold">-</button>
            <span className="px-3 flex items-center text-[10px] font-bold text-slate-500 min-w-[50px] justify-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.2))} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition font-bold">+</button>
          </div>

          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg border ${isAddingTask
                ? 'bg-red-700 text-white border-red-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {isAddingTask ? <span>CANCEL</span> : <><Plus size={16} /><span>ADD SNAG</span></>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Floating Layer Panel */}
        <div className="absolute top-6 left-6 space-y-3 z-30">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-2 flex flex-col space-y-1">
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`p-3 rounded-xl transition-all ${showLayers ? 'bg-red-50 text-red-600 border border-red-100' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Layers"
            >
              <Layers size={20} />
            </button>
            <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all" title="Selection Mode">
              <MousePointer2 size={20} />
            </button>
            <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all" title="Measurement">
              <BoxSelect size={20} />
            </button>
            <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all" title="Orbit">
              <Rotate3d size={20} />
            </button>
          </div>

          {showLayers && (
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl w-64 p-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Discipline Layers</h3>
              <div className="space-y-1">
                {[
                  { id: 'architecture', label: 'Architecture (AR)', color: 'text-blue-500' },
                  { id: 'structural', label: 'Structural (ST)', color: 'text-red-500' },
                  { id: 'mep', label: 'Mechanical/MEP (ME)', color: 'text-emerald-500' }
                ].map((disc) => (
                  <button
                    key={disc.id}
                    onClick={() => toggleDiscipline(disc.id as keyof typeof visibleDisciplines)}
                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${visibleDisciplines[disc.id as keyof typeof visibleDisciplines] ? disc.color.replace('text-', 'bg-') : 'bg-slate-200'}`}></div>
                      <span className={`text-xs font-bold ${visibleDisciplines[disc.id as keyof typeof visibleDisciplines] ? 'text-slate-800' : 'text-slate-400'}`}>{disc.label}</span>
                    </div>
                    {visibleDisciplines[disc.id as keyof typeof visibleDisciplines] ? <Eye size={14} className="text-slate-400" /> : <EyeOff size={14} className="text-slate-300" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Overlay Controls (When applicable) */}
        {viewMode === 'overlay' && (
          <div className="absolute top-6 right-6 z-30 w-48 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-4 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overlay Scale</h3>
              <Sliders size={14} className="text-red-500" />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-full accent-red-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mb-2"
            />
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
              <span>3D Model</span>
              <span>2D Plan</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-6 right-6 z-30">
          <div className="w-12 h-12 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl">
            <Compass size={24} className="text-red-600" />
          </div>
        </div>

        {/* The Interactive Surface */}
        <div className="flex-1 flex items-center justify-center bg-[#f0f4f8] p-12 overflow-hidden">
          <div
            className="relative bg-white shadow-2xl transition-all duration-300 ease-out border border-slate-200 rounded-sm overflow-hidden"
            style={{
              width: '1000px',
              height: '700px',
              transform: `scale(${zoom})`,
              cursor: isAddingTask ? 'crosshair' : 'grab'
            }}
            onClick={handleMapClick}
          >
            {/* 3D BASE LAYER (Mocked 3D Axonometric) */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${viewMode === '2d' ? 'opacity-0' : 'opacity-100'}`}
              style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
            >
              <svg width="100%" height="100%" viewBox="0 0 1000 700" className="opacity-40">
                <g transform="translate(100, 100)">
                  {/* Mock Axonometric Slab */}
                  <path d="M50,150 L400,0 L750,150 L400,300 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
                  <path d="M50,150 L50,180 L400,330 L400,300 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
                  <path d="M400,300 L400,330 L750,180 L750,150 Z" fill="#64748b" stroke="#475569" strokeWidth="2" />

                  {/* Mock Vertical Elements */}
                  <rect x="200" y="50" width="20" height="120" fill="#f1f5f9" stroke="#94a3b8" transform="skewY(-20)" />
                  <rect x="580" y="50" width="20" height="120" fill="#f1f5f9" stroke="#94a3b8" transform="skewY(20)" />
                </g>
                <text x="500" y="650" className="text-[10px] font-bold fill-slate-300 text-center uppercase tracking-[0.4em]">Proprietary 3D Engine V2.4 • Render Active</text>
              </svg>
            </div>

            {/* 2D OVERLAY LAYER */}
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                opacity: viewMode === '3d' ? 0 : (viewMode === 'overlay' ? overlayOpacity : 1),
                backgroundColor: viewMode === '2d' ? 'white' : 'transparent'
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 1000 700" className="absolute top-0 left-0 pointer-events-none select-none">
                {/* Structural Walls */}
                {visibleDisciplines.structural && (
                  <g stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" opacity="1">
                    <path d="M100,100 L900,100 L900,600 L100,600 Z" />
                    <path d="M100,250 L900,250" />
                    <path d="M400,100 L400,600" />
                  </g>
                )}

                {/* Architectural Partitions */}
                {visibleDisciplines.architecture && (
                  <g stroke="#64748b" strokeWidth="2" strokeDasharray="5,5" fill="none">
                    <path d="M600,250 L600,600" />
                    <path d="M400,450 L600,450" />
                    <circle cx="250" cy="175" r="40" stroke="#cbd5e1" strokeWidth="1" />
                  </g>
                )}

                {/* MEP Elements */}
                {visibleDisciplines.mep && (
                  <g stroke="#ef4444" strokeWidth="4" fill="none" opacity="0.6">
                    <path d="M150,150 L850,150 L850,550" stroke="#3b82f6" />
                    <circle cx="300" cy="300" r="15" fill="#3b82f6" fillOpacity="0.2" />
                    <circle cx="700" cy="400" r="15" fill="#3b82f6" fillOpacity="0.2" />
                  </g>
                )}

                {/* Grid Lines */}
                <g stroke="#f1f5f9" strokeWidth="1">
                  {[...Array(14)].map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} />
                  ))}
                  {[...Array(20)].map((_, i) => (
                    <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="700" />
                  ))}
                </g>

                {/* Annotation Labels */}
                <g className="text-[10px] font-bold uppercase tracking-widest fill-slate-300 select-none">
                  <text x="120" y="120">Sector A1</text>
                  <text x="820" y="120">Sector B4</text>
                </g>
              </svg>
            </div>

            {/* TASK MARKERS (Always Top Layer) */}
            {tasks.map(task => (
              <div
                key={task.id}
                className="absolute -ml-4 -mt-8 group cursor-pointer z-40"
                style={{ left: `${task.location.x}%`, top: `${task.location.y}%` }}
                onClick={(e) => { e.stopPropagation(); alert(`Issue: ${task.title}`); }}
              >
                <div className={`w-9 h-9 rounded-full border-4 border-white shadow-2xl flex items-center justify-center transition-all hover:scale-125 hover:rotate-12 ${task.status === 'Open' ? 'bg-red-600' : 'bg-emerald-500'
                  }`}>
                  {task.type === 'Defect' ? <AlertCircle size={18} className="text-white" /> : <CheckCircle2 size={18} className="text-white" />}
                </div>
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-2xl pointer-events-none transition-all duration-300">
                  {task.title.toUpperCase()}
                  <div className="text-[8px] opacity-60 mt-0.5 tracking-normal">REV: C04 • {task.priority} Priority</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 flex items-center space-x-4">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-2.5 rounded-2xl text-[10px] font-bold text-slate-500 shadow-xl uppercase tracking-widest flex items-center">
            <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
            Active Project Datum: G-002
          </div>
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-2.5 rounded-2xl text-[10px] font-bold text-slate-500 shadow-xl uppercase tracking-widest flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            Grid Alignment: Precise
          </div>
        </div>
      </div>
    </div>
  );
};

export default BIMView;
