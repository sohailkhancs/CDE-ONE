/**
 * Project Types for CDE-ONE
 * ISO 19650 compliant project management
 */

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived';
export type ProjectType = 'Hospital' | 'Housing' | 'Commercial' | 'Infrastructure' | 'Industrial' | 'Education';
export type ProjectPhase = 'Design' | 'Tender' | 'Construction' | 'Commissioning' | 'Handover';

export interface Project {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  description: string;
  location: string;
  client: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  progress: number;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  timeline: {
    start: string;
    end: string;
    daysRemaining: number;
  };
  team: {
    total: number;
    members: ProjectMember[];
  };
  stats: {
    documents: number;
    rfis: number;
    defects: number;
    inspections: number;
    tasks: {
      total: number;
      completed: number;
    };
  };
  thumbnail?: string;
  coverImage?: string;
  lastAccessed?: string;
  isFavorite?: boolean;

  // Extended Details for Create Project Form
  projectNumber?: string;
  squareFeet?: number;
  template?: string;
  isActive?: boolean;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  timezone?: string;
  phone?: string;
  region?: string;
  language?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export interface ProjectStats {
  health: 'excellent' | 'good' | 'warning' | 'critical';
  onTime: boolean;
  onBudget: boolean;
  qualityScore: number;
  safetyScore: number;
}
