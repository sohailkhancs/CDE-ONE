
import { Folder, FileEntry, Task, Inspection, PlannedTask } from '../types';

export const INITIAL_SCHEDULE: PlannedTask[] = [
  { id: '1', wbs: '1', name: 'Project Mobilization', start: '2024-03-01', finish: '2024-03-15', duration: 14, progress: 100, resource: 'Site Team', outlineLevel: 1, isExpanded: true, isCritical: true },
  { id: '2', wbs: '1.1', name: 'Site Office Setup', start: '2024-03-01', finish: '2024-03-05', duration: 4, progress: 100, resource: 'Admin', outlineLevel: 2 },
  { id: '3', wbs: '1.2', name: 'Temporary Utilities', start: '2024-03-06', finish: '2024-03-15', duration: 9, progress: 80, resource: 'Electrical Sub', outlineLevel: 2, predecessors: ['2'] },
  { id: '4', wbs: '2', name: 'Substructure', start: '2024-03-16', finish: '2024-05-10', duration: 55, progress: 10, resource: 'Civil Team', outlineLevel: 1, isExpanded: true, isCritical: true, predecessors: ['1'] },
  { id: '5', wbs: '2.1', name: 'Excavation Zone A', start: '2024-03-16', finish: '2024-03-30', duration: 14, progress: 40, resource: 'Excavation Co', outlineLevel: 2, linkedFieldTaskId: 't1' },
  { id: '6', wbs: '2.2', name: 'Piling Works', start: '2024-04-01', finish: '2024-04-20', duration: 19, progress: 0, resource: 'Piling Specialist', outlineLevel: 2, predecessors: ['5'], isCritical: true },
  { id: '7', wbs: '3', name: 'Superstructure', start: '2024-05-11', finish: '2024-12-20', duration: 223, progress: 0, resource: 'Concrete Team', outlineLevel: 1, predecessors: ['4'], isCritical: true },
];

// ISO 19650 Disciplines/Roles
export const DISCIPLINES = [
  { code: 'ARC', name: 'Architecture', originator: 'A' },
  { code: 'STR', name: 'Structural', originator: 'S' },
  { code: 'MEP', name: 'MEP', originator: 'M' },
  { code: 'CIV', name: 'Civil', originator: 'C' },
  { code: 'FIR', name: 'Fire Protection', originator: 'F' },
  { code: 'HVA', name: 'HVAC', originator: 'H' },
  { code: 'ELC', name: 'Electrical', originator: 'E' },
  { code: 'PLU', name: 'Plumbing', originator: 'P' }
];

export const ISO_FOLDERS: Folder[] = [
  { id: 'wip', name: 'WIP', label: 'Work In Progress' },
  { id: 'shared', name: 'SHARED', label: 'Shared Environment' },
  {
    id: 'published',
    name: 'PUBLISHED',
    label: 'Published (Client-Ready)',
    subfolders: ['Architecture', 'Structural', 'MEP', 'Civil', 'Electrical', 'Plumbing']
  },
  { id: 'archive', name: 'ARCHIVE', label: 'Historical Data' },
];

export const MOCK_FILES: FileEntry[] = [
  {
    id: 'wip-1', name: 'A-SK-001_Sketch_Entryway.dwg', rev: 'P01', status: 'S0', size: '12.4 MB', date: '2024-02-15', discipline: 'Architecture', author: 'Alex Mercer',
    description: 'Initial sketch for the main entrance redesign.',
    versions: [{ rev: 'P01', date: '2024-02-15', author: 'Alex Mercer', comment: 'First draft for coordination', status: 'S0' }]
  },
  {
    id: 'f1', name: 'A-101_L1_Floorplan.pdf', rev: 'C03', status: 'S4', size: '2.4 MB', date: '2023-10-24', discipline: 'Architecture', author: 'Alex Mercer',
    description: 'Ground floor layout including room schedules.',
    versions: [
      { rev: 'C03', date: '2023-10-24', author: 'Alex Mercer', comment: 'Final coordination issue', status: 'S4' }
    ]
  }
];

export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'INS-001',
    title: 'Reinforcement Pre-Pour Inspection',
    type: 'QC',
    status: 'In Progress',
    location: 'L2 Zone A - Foundation Slabs',
    assignedTo: 'John Smith',
    date: '2024-02-14',
    isoSuitability: 'S3',
    refContainer: 'S-201_Foundation_Details.pdf',
    checklist: [
      { id: '1', label: 'Rebar spacing matches structural drawings', checked: true, status: 'Pass' },
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  { id: 't1', type: 'Defect', status: 'Open', title: 'Cracked Tile in Lobby', location: { x: 30, y: 40 }, assignee: 'John Doe', priority: 'High', due: '2024-02-10', discipline: 'Architecture' },
];
