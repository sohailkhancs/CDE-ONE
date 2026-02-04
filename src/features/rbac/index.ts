/**
 * RBAC module exports
 *
 * ISO 19650 compliant Role-Based Access Control
 */

export {
  hasPermission,
  userCan,
  canViewDocument,
  canDownloadDocument,
  canUpdateDocument,
  canDeleteDocument,
  canPromoteDocument,
  getVisibleStatuses,
  isValidTransition,
  getTransitionActionType,
  logAuditEvent,
  getPendingAuditLogs,
  clearAuditLogs,
  CONTAINER_TYPES,
  ORIGINATOR_CODES,
  DISCIPLINE_CLASSIFICATIONS,
} from './rbac';

export {
  usePermissions,
  useDocumentAccess,
  useAuditLog,
  useDocumentFilter,
  useRoleGate,
  withPermission,
  withRole,
} from './useRBAC';

// Re-export components from rbac.tsx
export {
  PermissionGate,
  RoleGate,
  DocumentAccessGate,
} from './rbac';
