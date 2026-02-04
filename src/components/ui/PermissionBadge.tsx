/**
 * PermissionBadge Component
 *
 * Displays visual indicators for user permissions and document access states.
 * Part of ISO 19650 compliant RBAC system.
 */
import React from 'react';
import { Lock, ShieldCheck, ShieldAlert, Ban, Eye } from 'lucide-react';
import type { Role, DocumentStatus } from '@/src/types';
import { cn } from '@/src/lib/utils';

export interface PermissionBadgeProps {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<PermissionBadgeProps> = ({
  role,
  size = 'md',
  showLabel = true,
  className
}) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  const styles = {
    Admin: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-500',
      label: 'Admin',
      description: 'Full Access'
    },
    'Project Manager': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-500',
      label: 'PM',
      description: 'Manage & Publish'
    },
    Viewer: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      icon: 'text-slate-400',
      label: 'Viewer',
      description: 'Read Only'
    }
  };

  const style = styles[role];

  return (
    <div className={cn(
      'inline-flex items-center space-x-1.5 rounded-full border',
      sizes[size],
      style.bg,
      style.border,
      style.text,
      className
    )}>
      <ShieldCheck className={cn('w-3 h-3', style.icon)} />
      {showLabel && (
        <>
          <span className="font-semibold">{style.label}</span>
          <span className="text-[9px] opacity-60 border-l border-current pl-1.5 ml-0.5">
            {style.description}
          </span>
        </>
      )}
    </div>
  );
};

export interface AccessIndicatorProps {
  canAccess: boolean;
  reason?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * AccessIndicator - Shows locked/unlocked state for actions
 */
export const AccessIndicator: React.FC<AccessIndicatorProps> = ({
  canAccess,
  reason,
  size = 'md',
  className
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (canAccess) {
    return (
      <div className={cn('flex items-center text-green-600', className)}>
        <ShieldCheck className={sizes[size]} />
      </div>
    );
  }

  return (
    <div className={cn('relative group inline-flex', className)}>
      <div className="flex items-center text-slate-400">
        <Lock className={sizes[size]} />
      </div>
      {reason && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {reason}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 w-1.5 h-1.5 bg-slate-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export interface PermissionLockProps {
  children: React.ReactNode;
  locked: boolean;
  reason?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * PermissionLock - Wraps content with a lock overlay when permission is denied
 */
export const PermissionLock: React.FC<PermissionLockProps> = ({
  children,
  locked,
  reason = 'You do not have permission for this action',
  tooltipPosition = 'top'
}) => {
  if (!locked) {
    return <>{children}</>;
  }

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-0.5',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-0.5',
    left: 'left-full top-1/2 -translate-y-1/2 -mr-0.5',
    right: 'right-full top-1/2 -translate-y-1/2 -ml-0.5'
  };

  return (
    <div className="relative group inline-block">
      <div className="opacity-50 pointer-events-none filter grayscale">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 rounded-xl backdrop-blur-[1px]">
        <Lock className="w-5 h-5 text-slate-600" />
      </div>
      <div className={cn(
        'absolute px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 max-w-xs',
        positions[tooltipPosition]
      )}>
        <div className="flex items-center space-x-2">
          <Ban size={12} className="text-red-400 flex-shrink-0" />
          <span>{reason}</span>
        </div>
        <div className={cn('absolute w-1.5 h-1.5 bg-slate-800 rotate-45', arrowPositions[tooltipPosition])}></div>
      </div>
    </div>
  );
};

export interface DocumentAccessBadgeProps {
  status: DocumentStatus;
  isOwnDocument: boolean;
  userRole: Role;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * DocumentAccessBadge - Shows access level for a document
 */
export const DocumentAccessBadge: React.FC<DocumentAccessBadgeProps> = ({
  status,
  isOwnDocument,
  userRole,
  size = 'md'
}) => {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  // WIP documents
  if (status === 'S0') {
    if (userRole === 'Admin') {
      return (
        <span className={cn('inline-flex items-center space-x-1 rounded-full bg-green-50 text-green-700 border border-green-200', sizes[size])}>
          <Eye className="w-3 h-3" />
          <span className="font-medium">Accessible</span>
        </span>
      );
    }
    if (isOwnDocument) {
      return (
        <span className={cn('inline-flex items-center space-x-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200', sizes[size])}>
          <ShieldCheck className="w-3 h-3" />
          <span className="font-medium">Your Document</span>
        </span>
      );
    }
    return (
      <span className={cn('inline-flex items-center space-x-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200', sizes[size])}>
        <Lock className="w-3 h-3" />
        <span className="font-medium">Restricted</span>
      </span>
    );
  }

  // Published documents - accessible to all
  return (
    <span className={cn('inline-flex items-center space-x-1 rounded-full bg-green-50 text-green-700 border border-green-200', sizes[size])}>
      <Eye className="w-3 h-3" />
      <span className="font-medium">Visible</span>
    </span>
  );
};

export interface PermissionTooltipProps {
  permission: string;
  granted: boolean;
  children: React.ReactNode;
  deniedReason?: string;
}

/**
 * PermissionTooltip - Adds permission-aware tooltip to any element
 */
export const PermissionTooltip: React.FC<PermissionTooltipProps> = ({
  permission,
  granted,
  children,
  deniedReason = `Permission required: ${permission}`
}) => {
  if (granted) {
    return <>{children}</>;
  }

  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-red-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        <div className="flex items-center space-x-2">
          <ShieldAlert size={12} className="text-red-300" />
          <span>{deniedReason}</span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-red-900 rotate-45"></div>
      </div>
    </div>
  );
};

export default RoleBadge;
