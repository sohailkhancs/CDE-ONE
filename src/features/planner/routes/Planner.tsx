
import React, { useState, useRef, useMemo } from 'react';
import {
  Download,
  Plus
} from 'lucide-react';
import { PlannedTask, DependencyType } from '../../../types';
import { INITIAL_SCHEDULE } from '../../../lib/constants';

const CELL_HEIGHT = 48;
const DAY_WIDTH = 20; // Pixels per day
const PROJECT_START_DATE = new Date('2024-02-25');

const PlannerView: React.FC = () => {
  const [tasks, setTasks] = useState<PlannedTask[]>(INITIAL_SCHEDULE.map(t => ({
    ...t,
    dependencies: t.predecessors ? t.predecessors.map(id => ({ id, type: 'FS' as DependencyType, lag: 0 })) : []
  })));
  // const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  // const [isSyncing, setIsSyncing] = useState(false);
  // const [showDetails, setShowDetails] = useState(false);
  const [ganttScrollLeft, setGanttScrollLeft] = useState(0);

  const ganttBodyRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  // Sync scroll between table and gantt
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, target: 'table' | 'gantt') => {
    if (target === 'table' && ganttBodyRef.current) {
      ganttBodyRef.current.scrollTop = e.currentTarget.scrollTop;
    } else if (target === 'gantt') {
      if (tableBodyRef.current) {
        tableBodyRef.current.scrollTop = e.currentTarget.scrollTop;
      }
      setGanttScrollLeft(e.currentTarget.scrollLeft);
    }
  };

  // --- Date Math ---
  const getXFromDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffTime = Math.abs(date.getTime() - PROJECT_START_DATE.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * DAY_WIDTH;
  };

  // const getDateFromX = (x: number) => {
  //   const days = Math.floor(x / DAY_WIDTH);
  //   const result = new Date(PROJECT_START_DATE);
  //   result.setDate(result.getDate() + days);
  //   return result.toISOString().split('T')[0];
  // };

  // --- Dependency Arrow Calculation ---
  const dependencyLinks = useMemo(() => {
    const links: { fromX: number, fromY: number, toX: number, toY: number, color: string, type: DependencyType }[] = [];
    tasks.forEach((task, index) => {
      if (task.dependencies) {
        task.dependencies.forEach(dep => {
          const predIndex = tasks.findIndex(t => t.id === dep.id);
          const pred = tasks[predIndex];
          if (pred) {
            let fromX = 0;
            let toX = 0;
            const fromY = (predIndex * CELL_HEIGHT) + (CELL_HEIGHT / 2);
            const toY = (index * CELL_HEIGHT) + (CELL_HEIGHT / 2);

            // Calculate anchor points based on link type
            if (dep.type === 'FS') {
              fromX = getXFromDate(pred.finish);
              toX = getXFromDate(task.start);
            } else if (dep.type === 'SS') {
              fromX = getXFromDate(pred.start);
              toX = getXFromDate(task.start);
            } else if (dep.type === 'FF') {
              fromX = getXFromDate(pred.finish);
              toX = getXFromDate(task.finish);
            } else if (dep.type === 'SF') {
              fromX = getXFromDate(pred.start);
              toX = getXFromDate(task.finish);
            }

            links.push({
              fromX, fromY, toX, toY,
              color: task.isCritical ? '#ef4444' : '#94a3b8',
              type: dep.type
            });
          }
        });
      }
    });
    return links;
  }, [tasks]);

  // --- Drag and Drop logic for Gantt ---
  const [dragging, setDragging] = useState<{ id: string, type: 'move' | 'resize', startX: number, initialDate: string, initialDuration: number } | null>(null);
  const [drawingLink, setDrawingLink] = useState<{ fromId: string, fromHandle: 'start' | 'finish', mouseX: number, mouseY: number } | null>(null);

  const handleDragStart = (e: React.MouseEvent, id: string, type: 'move' | 'resize') => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setDragging({
      id,
      type,
      startX: e.clientX,
      initialDate: task.start,
      initialDuration: task.duration
    });
  };

  // const handleLinkStart = (e: React.MouseEvent, id: string, handle: 'start' | 'finish') => {
  //   e.stopPropagation();
  //   const rect = ganttContainerRef.current?.getBoundingClientRect();
  //   if (!rect) return;
  //   setDrawingLink({
  //     fromId: id,
  //     fromHandle: handle,
  //     mouseX: e.clientX - rect.left + (ganttBodyRef.current?.scrollLeft || 0),
  //     mouseY: e.clientY - rect.top + (ganttBodyRef.current?.scrollTop || 0)
  //   });
  // };

  const handleDragMove = (e: React.MouseEvent) => {
    if (dragging) {
      const deltaX = e.clientX - dragging.startX;
      const deltaDays = Math.round(deltaX / DAY_WIDTH);

      setTasks(prev => prev.map(t => {
        if (t.id !== dragging.id) return t;

        if (dragging.type === 'move') {
          const startDate = new Date(dragging.initialDate);
          startDate.setDate(startDate.getDate() + deltaDays);
          const newStart = startDate.toISOString().split('T')[0];

          const finishDate = new Date(newStart);
          finishDate.setDate(finishDate.getDate() + t.duration);
          const newFinish = finishDate.toISOString().split('T')[0];

          return { ...t, start: newStart, finish: newFinish };
        } else {
          const newDuration = Math.max(1, dragging.initialDuration + deltaDays);
          const finishDate = new Date(dragging.initialDate);
          finishDate.setDate(finishDate.getDate() + newDuration);
          const newFinish = finishDate.toISOString().split('T')[0];

          return { ...t, duration: newDuration, finish: newFinish };
        }
      }));
    }

    if (drawingLink && ganttContainerRef.current) {
      const rect = ganttContainerRef.current.getBoundingClientRect();
      setDrawingLink(prev => prev ? {
        ...prev,
        mouseX: e.clientX - rect.left,
        mouseY: e.clientY - rect.top
      } : null);
    }
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDrawingLink(null);
  };

  // Bind globals for mouse move/up if dragging (optional, but React events are usually enough if covering the whole area)
  // For better UX, we'd use document listeners, but let's stick to the container for now.

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900" onMouseMove={handleDragMove} onMouseUp={handleDragEnd}>
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">Project Planner</h1>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">v2.4.0</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded border"><Plus className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-slate-100 rounded border"><Download className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel: Table */}
        <div className="w-[400px] flex flex-col border-r bg-white z-10 shrink-0">
          <div className="h-10 bg-slate-100 border-b flex items-center px-4 text-xs font-semibold text-slate-500 uppercase">
            <div className="w-20">WBS</div>
            <div className="flex-1">Task Name</div>
            <div className="w-20">Start</div>
            <div className="w-16">Dur.</div>
          </div>
          <div
            ref={tableBodyRef}
            className="flex-1 overflow-y-auto no-scrollbar"
            onScroll={(e) => handleScroll(e, 'table')}
          >
            {tasks.map(task => (
              <div key={task.id} className="h-[48px] flex items-center px-4 border-b hover:bg-blue-50 text-sm">
                <div className="w-20 font-mono text-slate-500">{task.wbs}</div>
                <div className="flex-1 truncate font-medium flex items-center gap-2">
                  {task.outlineLevel > 0 && <span style={{ width: task.outlineLevel * 16 }} />}
                  {task.name}
                </div>
                <div className="w-20 text-xs">{task.start.substring(5)}</div>
                <div className="w-16 text-xs text-center bg-slate-100 rounded px-1">{task.duration}d</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Gantt */}
        <div className="flex-1 flex flex-col overflow-hidden relative select-none">
          {/* Timeline Header */}
          <div className="h-10 bg-slate-50 border-b relative overflow-hidden flex" style={{ marginLeft: -1 * ganttScrollLeft }}>
            {/* Simplified Timeline */}
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="absolute border-l text-[10px] pl-1 text-slate-400" style={{ left: i * DAY_WIDTH * 7, width: DAY_WIDTH * 7 }}>
                Wk {i + 1}
              </div>
            ))}
          </div>

          <div
            ref={ganttBodyRef}
            className="flex-1 overflow-auto relative bg-slate-50"
            onScroll={(e) => handleScroll(e, 'gantt')}
          >
            <div className="relative" style={{ height: tasks.length * CELL_HEIGHT, width: 3000 }}>
              {/* Grid Lines */}
              {Array.from({ length: 150 }).map((_, i) => (
                <div key={i} className={`absolute top-0 bottom-0 border-r ${i % 7 === 0 ? 'border-slate-300' : 'border-slate-100'}`} style={{ left: i * DAY_WIDTH }} />
              ))}

              {/* Links (SVG) */}
              <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
                {dependencyLinks.map((link, i) => (
                  <path
                    key={i}
                    d={`M ${link.fromX} ${link.fromY} L ${link.toX} ${link.toY}`}
                    stroke={link.color}
                    strokeWidth="1.5"
                    markerEnd="url(#arrowhead)"
                  />
                ))}
              </svg>

              {/* Task Bars */}
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`absolute h-8 rounded shadow-sm text-xs flex items-center px-2 cursor-pointer
                                ${task.isCritical ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}
                            `}
                  style={{
                    top: index * CELL_HEIGHT + 8,
                    left: getXFromDate(task.start),
                    width: task.duration * DAY_WIDTH
                  }}
                  onMouseDown={(e) => handleDragStart(e, task.id, 'move')}
                >
                  <span className="truncate">{task.name}</span>

                  {/* Resize Handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/20"
                    onMouseDown={(e) => handleDragStart(e, task.id, 'resize')}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerView;