
export type Role = 'Admin' | 'Project Manager' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

// ISO 19650 Document Statuses
export type DocumentStatus = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

// Document Status Labels for UI
export const DocumentStatusLabels: Record<DocumentStatus, string> = {
  S0: 'Work in Progress',
  S1: 'Tender/Shared',
  S2: 'Construction',
  S3: 'Information Approval',
  S4: 'Published',
  S5: 'Archived',
};

// Document Permissions
export type Permission = 'view' | 'download' | 'upload' | 'update' | 'delete' | 'promote' | 'share';

// Role-based permission matrix
export const RolePermissions: Record<Role, Permission[]> = {
  Admin: ['view', 'download', 'upload', 'update', 'delete', 'promote', 'share'],
  'Project Manager': ['view', 'download', 'upload', 'update', 'promote', 'share'],
  Viewer: ['view', 'download'],
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return RolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a user can view a document based on RBAC rules
 * 
 * RBAC Rules:
 * - Admin users can view all documents regardless of status
 * - Non-Admin users can view:
 *   - All non-WIP (S1-S5) documents
 *   - Their own WIP (S0) documents only
 */
export function canViewDocument(
  userId: string,
  userRole: Role,
  documentStatus: DocumentStatus,
  documentAuthorId: string
): boolean {
  // Admin users can view all documents
  if (userRole === 'Admin') {
    return true;
  }

  // Non-Admin users can view non-WIP documents
  if (documentStatus !== 'S0') {
    return true;
  }

  // Non-Admin users can only view their own WIP documents
  return documentAuthorId === userId;
}

/**
 * Check if a user can download a document
 */
export function canDownloadDocument(
  userId: string,
  userRole: Role,
  documentStatus: DocumentStatus,
  documentAuthorId: string
): boolean {
  // Check if user has download permission
  if (!hasPermission(userRole, 'download')) {
    return false;
  }

  // Apply same visibility rules as viewing
  return canViewDocument(userId, userRole, documentStatus, documentAuthorId);
}

/**
 * Check if a user can update a document
 */
export function canUpdateDocument(
  userId: string,
  userRole: Role,
  documentStatus: DocumentStatus,
  documentAuthorId: string
): boolean {
  // Check if user has update permission
  if (!hasPermission(userRole, 'update')) {
    return false;
  }

  // Only document author can update WIP documents
  if (documentStatus === 'S0') {
    return documentAuthorId === userId;
  }

  // Admin can update any document
  if (userRole === 'Admin') {
    return true;
  }

  // Project Manager can update non-WIP documents
  if (userRole === 'Project Manager') {
    return true;
  }

  return false;
}

/**
 * Check if a user can delete a document
 */
export function canDeleteDocument(
  userId: string,
  userRole: Role,
  documentStatus: DocumentStatus,
  documentAuthorId: string
): boolean {
  // Check if user has delete permission
  if (!hasPermission(userRole, 'delete')) {
    return false;
  }

  // Only Admin can delete documents
  return userRole === 'Admin';
}

/**
 * Check if a user can promote a document
 */
export function canPromoteDocument(
  userId: string,
  userRole: Role,
  documentStatus: DocumentStatus,
  documentAuthorId: string,
  targetStatus: DocumentStatus
): boolean {
  // Check if user has promote permission
  if (!hasPermission(userRole, 'promote')) {
    return false;
  }

  // Only document author can promote WIP documents
  if (documentStatus === 'S0') {
    return documentAuthorId === userId;
  }

  // Admin can promote any document
  if (userRole === 'Admin') {
    return true;
  }

  // Project Manager can promote non-WIP documents
  if (userRole === 'Project Manager') {
    return true;
  }

  return false;
}

export type InspectionStatus = 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'Failed' | 'Verified' | 'Rejected';
export type InspectionType = 'QA' | 'QC' | 'Safety' | 'Environmental' | 'Commissioning';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  status: 'Pass' | 'Fail' | 'N/A';
  comment?: string;
}

export interface Inspection {
  id: string;
  title: string;
  type: InspectionType;
  status: InspectionStatus;
  location: string;
  assignedTo: string;
  date: string;
  isoSuitability: string;
  refContainer?: string;
  checklist: ChecklistItem[];
}

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface TaskDependency {
  id: string; // The ID of the predecessor task
  type: DependencyType;
  lag: number; // in days
}

export interface PlannedTask {
  id: string;
  wbs: string;
  name: string;
  start: string; // ISO Date
  finish: string; // ISO Date
  duration: number; // in days
  progress: number;
  resource: string;
  outlineLevel: number;
  isExpanded?: boolean;
  isCritical?: boolean;
  linkedFieldTaskId?: string; // Link to Field module
  dependencies?: TaskDependency[]; // Structured predecessors
  predecessors?: string[]; // Legacy support or simplified view
}

// Project status enumeration for construction projects
// Unused values are kept for type completeness and future use
/* eslint-disable */
export enum ProjectStatus {
  PLANNING = 'Planning',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold'
}
/* eslint-enable */

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Location {
  x: number;
  y: number;
}

export interface Task {
  id: string;
  type: 'Defect' | 'Safety' | 'RFI' | 'Observation';
  status: 'Open' | 'Pending' | 'Closed' | 'Draft';
  title: string;
  location: Location;
  assignee: string;
  priority: Priority;
  due: string;
  discipline: string;
}

export interface VersionInfo {
  rev: string;
  date: string;
  author: string;
  comment?: string;
  status: string;
}

export interface FileEntry {
  id: string;
  name: string;
  rev: string;
  status: string;
  size: string;
  date: string;
  discipline: string;
  author: string;
  description?: string;
  versions?: VersionInfo[];
}

export interface Folder {
  id: string;
  name: string;
  label: string;
  subfolders?: string[];
}
