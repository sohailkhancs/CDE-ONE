/**
 * React hooks for Role-Based Access Control
 */
import React, { useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import type { Permission, DocumentStatus, Role } from '../../types';
import {
  hasPermission,
  canViewDocument,
  canDownloadDocument,
  canUpdateDocument,
  canDeleteDocument,
  canPromoteDocument,
  getVisibleStatuses,
  isValidTransition,
  userCan,
  logAuditEvent,
} from './rbac';

/**
 * Hook to get current user's permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  return {
    user,
    isAuthenticated: !!user,
    role: user?.role ?? null,

    // Check if user has a specific permission
    can: (permission: Permission): boolean => userCan(user, permission),

    // Check if user has a specific role
    hasRole: (role: Role): boolean => user?.role === role,

    // Check if user has any of the specified roles
    hasAnyRole: (roles: Role[]): boolean => user ? roles.includes(user.role) : false,

    // Get all permissions for current user's role
    getPermissions: (): Permission[] => {
      if (!user) return [];

      const rolePermissions: Record<Role, Permission[]> = {
        Admin: ['view', 'download', 'upload', 'update', 'delete', 'promote', 'share'],
        'Project Manager': ['view', 'download', 'upload', 'update', 'promote', 'share'],
        Viewer: ['view', 'download'],
      };

      return rolePermissions[user.role] ?? [];
    },

    // Get visible document statuses for current user
    getVisibleStatuses: (): DocumentStatus[] => {
      return user ? getVisibleStatuses(user.role) : [];
    },
  };
}

/**
 * Hook for document-specific access control
 */
export function useDocumentAccess(documentStatus: DocumentStatus, documentAuthorId: string) {
  const { user } = useAuth();

  return {
    canView: canViewDocument(user, documentStatus, documentAuthorId),
    canDownload: canDownloadDocument(user, documentStatus, documentAuthorId),
    canUpdate: canUpdateDocument(user, documentStatus, documentAuthorId),
    canDelete: canDeleteDocument(user, documentStatus, documentAuthorId),
    canPromote: (targetStatus: DocumentStatus) =>
      canPromoteDocument(user, documentStatus, documentAuthorId, targetStatus),
    isValidTransition: (targetStatus: DocumentStatus) =>
      isValidTransition(documentStatus, targetStatus),
  };
}

/**
 * Hook for audit logging with user context
 */
export function useAuditLog() {
  const { user } = useAuth();

  return (
    action: string,
    resourceType: string,
    resourceId?: string,
    resourceName?: string,
    details?: Record<string, unknown>,
    success: boolean = true,
    errorMessage?: string
  ) => {
    if (!user) {
      console.warn('Cannot log audit event: No authenticated user');
      return;
    }

    logAuditEvent(
      action,
      user,
      resourceType,
      resourceId,
      resourceName,
      details,
      success,
      errorMessage
    );
  };
}

/**
 * Hook for filtering documents based on RBAC
 */
export function useDocumentFilter<T extends { status: DocumentStatus; authorId: string }>() {
  const { user } = useAuth();

  return {
    /**
     * Filter documents based on user's RBAC permissions
     * Admin: See all documents
     * Non-Admin: See all non-WIP documents + own WIP documents
     */
    filterDocuments: (documents: T[]): T[] => {
      if (!user) return [];

      if (user.role === 'Admin') {
        return documents;
      }

      return documents.filter(
        (doc) => doc.status !== 'S0' || doc.authorId === user.id
      );
    },

    /**
     * Check if a specific document is visible to the user
     */
    isVisible: (document: T): boolean => {
      if (!user) return false;
      if (user.role === 'Admin') return true;
      return document.status !== 'S0' || document.authorId === user.id;
    },
  };
}

/**
 * Hook for role-based UI rendering
 */
export function useRoleGate(allowedRoles: Role[]) {
  const { user } = useAuth();

  return {
    isAllowed: user ? allowedRoles.includes(user.role) : false,
    user,
  };
}

/**
 * HOC for protecting components based on permission
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission,
  fallback?: React.ReactNode
) {
  return function PermissionProtectedComponent(props: P) {
    const { can } = usePermissions();

    if (!can(permission)) {
      return <>{fallback ?? null}</>;
    }

    return <Component {...props} />;
  };
}

/**
 * HOC for protecting components based on role
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: Role[],
  fallback?: React.ReactNode
) {
  return function RoleProtectedComponent(props: P) {
    const { user } = useAuth();
    const isAllowed = user ? allowedRoles.includes(user.role) : false;

    if (!isAllowed) {
      return <>{fallback ?? null}</>;
    }

    return <Component {...props} />;
  };
}
