/**
 * Role-Based Access Control (RBAC) utilities for ISO 19650 compliance.
 *
 * This module provides:
 * - Permission checking functions
 * - Role-based UI element visibility
 * - Document access control based on status and ownership
 * - Audit logging for frontend actions
 */

import React from 'react';
import type { Role, DocumentStatus, Permission, User } from '../../types';

// ISO 19650:2018 requires detailed audit trails for all document operations
const AUDIT_LOG_KEY = 'cde_one_audit_log';

interface AuditEntry {
  timestamp: string;
  action: string;
  user: {
    id: string;
    email: string;
    role: Role;
  };
  resource: {
    type: string;
    id?: string;
    name?: string;
  };
  outcome: {
    success: boolean;
    errorMessage?: string;
  };
  details?: Record<string, unknown>;
}

/**
 * Log an audit event for ISO 19650 compliance
 */
export function logAuditEvent(
  action: string,
  user: User,
  resourceType: string,
  resourceId?: string,
  resourceName?: string,
  details?: Record<string, unknown>,
  success: boolean = true,
  errorMessage?: string
): void {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    resource: {
      type: resourceType,
      id: resourceId,
      name: resourceName,
    },
    outcome: {
      success,
      errorMessage,
    },
    details,
  };

  try {
    // Store in localStorage for batch sending to server
    const logs = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
    logs.push(entry);

    // Keep only last 100 entries in localStorage
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }

    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));

    // Also send to server immediately for critical actions
    if (action.startsWith('document.') || action.startsWith('auth.')) {
      sendAuditToServer(entry).catch((err) =>
        console.error('Failed to send audit log:', err)
      );
    }
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

/**
 * Send audit log to server
 */
async function sendAuditToServer(entry: AuditEntry): Promise<void> {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('cde_one_token');

  if (!token) return;

  try {
    await fetch(`${API_URL}/audit/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entry),
    });
  } catch (err) {
    // Silently fail - will be retried via batch upload
  }
}

/**
 * Get pending audit logs for server sync
 */
export function getPendingAuditLogs(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear sent audit logs from localStorage
 */
export function clearAuditLogs(sentLogs: AuditEntry[]): void {
  try {
    const currentLogs = getPendingAuditLogs();
    const sentIds = new Set(sentLogs.map((log) => JSON.stringify(log)));
    const remaining = currentLogs.filter((log) => !sentIds.has(JSON.stringify(log)));
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(remaining));
  } catch (err) {
    console.error('Failed to clear audit logs:', err);
  }
}

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const rolePermissions: Record<Role, Permission[]> = {
    Admin: ['view', 'download', 'upload', 'update', 'delete', 'promote', 'share'],
    'Project Manager': ['view', 'download', 'upload', 'update', 'promote', 'share'],
    Viewer: ['view', 'download'],
  };

  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if current user can perform an action
 */
export function userCan(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  return hasPermission(user.role, permission);
}

/**
 * ISO 19650 document visibility rules
 *
 * WIP (S0) documents:
 * - Admin: Can view ALL WIP documents
 * - Non-Admin: Can only view their OWN WIP documents
 *
 * Published (S1-S5) documents:
 * - All roles: Can view all published documents
 */
export function canViewDocument(
  user: User | null,
  documentStatus: DocumentStatus,
  documentAuthorId: string
): boolean {
  if (!user) return false;

  // Admin can view all documents
  if (user.role === 'Admin') return true;

  // Non-admin users can view non-WIP documents
  if (documentStatus !== 'S0') return true;

  // Non-admin users can only view their own WIP documents
  return documentAuthorId === user.id;
}

/**
 * Check if user can download a document
 */
export function canDownloadDocument(
  user: User | null,
  documentStatus: DocumentStatus,
  documentAuthorId: string
): boolean {
  if (!user) return false;
  if (!hasPermission(user.role, 'download')) return false;
  return canViewDocument(user, documentStatus, documentAuthorId);
}

/**
 * Check if user can update a document
 */
export function canUpdateDocument(
  user: User | null,
  documentStatus: DocumentStatus,
  documentAuthorId: string
): boolean {
  if (!user) return false;
  if (!hasPermission(user.role, 'update')) return false;

  // Admin can update any document
  if (user.role === 'Admin') return true;

  // Only document author can update WIP documents
  if (documentStatus === 'S0') {
    return documentAuthorId === user.id;
  }

  // Project Manager can update non-WIP documents
  return user.role === 'Project Manager';
}

/**
 * Check if user can delete a document
 */
export function canDeleteDocument(
  user: User | null,
  documentStatus: DocumentStatus,
  documentAuthorId: string
): boolean {
  if (!user) return false;
  if (!hasPermission(user.role, 'delete')) return false;

  // Only Admin can delete documents
  return user.role === 'Admin';
}

/**
 * Check if user can promote a document to a new status
 */
export function canPromoteDocument(
  user: User | null,
  documentStatus: DocumentStatus,
  documentAuthorId: string,
  targetStatus: DocumentStatus
): boolean {
  if (!user) return false;
  if (!hasPermission(user.role, 'promote')) return false;

  // Admin can promote any document
  if (user.role === 'Admin') return true;

  // Only document author can promote WIP documents
  if (documentStatus === 'S0') {
    return documentAuthorId === user.id;
  }

  // Project Manager can promote non-WIP documents
  return user.role === 'Project Manager';
}

/**
 * Get visible document statuses for a user role
 */
export function getVisibleStatuses(role: Role): DocumentStatus[] {
  if (role === 'Admin') {
    return ['S0', 'S1', 'S2', 'S3', 'S4', 'S5'];
  }

  // Non-admin users don't see WIP documents (except their own)
  return ['S1', 'S2', 'S3', 'S4', 'S5'];
}

/**
 * ISO 19650 valid state transitions
 */
export const VALID_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  S0: ['S1', 'S2', 'S3'], // Work in Progress -> Shared states
  S1: ['S2', 'S3', 'S4'], // Tender -> Construction/Info Approval/Published
  S2: ['S3', 'S4'], // Construction -> Info Approval/Published
  S3: ['S4'], // Info Approval -> Published
  S4: ['S5'], // Published -> Archived
  S5: [], // Archived - no transitions allowed
};

/**
 * Check if a state transition is valid per ISO 19650
 */
export function isValidTransition(
  currentStatus: DocumentStatus,
  targetStatus: DocumentStatus
): boolean {
  if (currentStatus === targetStatus) return false;
  return VALID_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
}

/**
 * Get action type for a transition
 */
export function getTransitionActionType(
  currentStatus: DocumentStatus,
  targetStatus: DocumentStatus
): string | null {
  if (currentStatus === 'S0' && ['S1', 'S2', 'S3'].includes(targetStatus)) {
    return 'share';
  }
  if (['S1', 'S2', 'S3'].includes(currentStatus) && targetStatus === 'S4') {
    return 'publish';
  }
  if (currentStatus === 'S4' && targetStatus === 'S5') {
    return 'archive';
  }
  if (['S1', 'S2', 'S3'].includes(currentStatus) && ['S2', 'S3'].includes(targetStatus)) {
    return 'coordinate';
  }
  return null;
}

/**
 * Permission component props
 */
export interface PermissionGateProps {
  user: User | null;
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component to conditionally render based on user permissions
 */
export function PermissionGate({
  user,
  permission,
  fallback = null,
  children,
}: PermissionGateProps): React.ReactElement | null {
  if (userCan(user, permission)) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return <React.Fragment>{fallback}</React.Fragment>;
}

/**
 * Role gate component props
 */
export interface RoleGateProps {
  user: User | null;
  roles: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component to conditionally render based on user role
 */
export function RoleGate({
  user,
  roles,
  fallback = null,
  children,
}: RoleGateProps): React.ReactElement | null {
  if (user && roles.includes(user.role)) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return <React.Fragment>{fallback}</React.Fragment>;
}

/**
 * Document access gate component props
 */
export interface DocumentAccessGateProps {
  user: User | null;
  documentStatus: DocumentStatus;
  documentAuthorId: string;
  access: 'view' | 'update' | 'delete' | 'promote' | 'download';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component to conditionally render based on document access
 */
export function DocumentAccessGate({
  user,
  documentStatus,
  documentAuthorId,
  access,
  fallback = null,
  children,
}: DocumentAccessGateProps): React.ReactElement | null {
  let hasAccess = false;

  switch (access) {
    case 'view':
      hasAccess = canViewDocument(user, documentStatus, documentAuthorId);
      break;
    case 'update':
      hasAccess = canUpdateDocument(user, documentStatus, documentAuthorId);
      break;
    case 'delete':
      hasAccess = canDeleteDocument(user, documentStatus, documentAuthorId);
      break;
    case 'promote':
      hasAccess = canPromoteDocument(user, documentStatus, documentAuthorId, 'S1');
      break;
    case 'download':
      hasAccess = canDownloadDocument(user, documentStatus, documentAuthorId);
      break;
  }

  if (hasAccess) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return <React.Fragment>{fallback}</React.Fragment>;
}

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: Permission): (user: User | null) => boolean {
  // This would typically use the auth context
  // For now, returning a function that accepts user
  return (user: User | null) => userCan(user, permission);
}

/**
 * Hook to get document access permissions
 */
export function useDocumentAccess(document: {
  status: DocumentStatus;
  authorId: string;
}) {
  return {
    canView: (user: User | null) =>
      canViewDocument(user, document.status, document.authorId),
    canUpdate: (user: User | null) =>
      canUpdateDocument(user, document.status, document.authorId),
    canDelete: (user: User | null) =>
      canDeleteDocument(user, document.status, document.authorId),
    canPromote: (user: User | null, target: DocumentStatus) =>
      canPromoteDocument(user, document.status, document.authorId, target),
    canDownload: (user: User | null) =>
      canDownloadDocument(user, document.status, document.authorId),
  };
}

/**
 * ISO 19650 Container Types (BS EN ISO 19650-2:2018)
 */
export const CONTAINER_TYPES = {
  M3: '3D Model',
  M2: '2D Model',
  D1: 'Drawing',
  D2: 'Diagram',
  C1: 'Document/Report',
  C2: 'Certificate',
  P1: ' Photograph',
  P2: 'Panorama Image',
  R1: 'Revision Information',
} as const;

export type ContainerType = keyof typeof CONTAINER_TYPES;

/**
 * ISO 19650 Originator Codes
 */
export const ORIGINATOR_CODES = {
  ARC: 'Architect',
  STR: 'Structural',
  MEP: 'MEP',
  CIV: 'Civil',
  FIR: 'Fire Safety',
  ACC: 'Acoustic',
  SUR: 'Surveyor',
  QTY: 'Quantity Surveyor',
  PLA: 'Planning',
  CON: 'Construction',
  FAC: 'Facilities Management',
} as const;

export type OriginatorCode = keyof typeof ORIGINATOR_CODES;

/**
 * ISO 19650 Discipline classifications (Uniclass 2015 based)
 */
export const DISCIPLINE_CLASSIFICATIONS = {
  SPr_20_30_10: 'Architecture - Design',
  SPr_25_10_10: 'Structural - Design',
  SPr_30_50_10: 'Mechanical - Design',
  SPr_30_55_10: 'Electrical - Design',
  SPr_30_60_10: 'Public Health - Design',
  SPr_40_10_10: 'Civil - Design',
  SPr_50_10_10: 'Fire Safety - Design',
  SPr_60_10_10: 'Acoustic - Design',
  SPr_70_10_10: 'Landscape - Design',
  SPr_80_10_10: 'Interior Design',
} as const;
