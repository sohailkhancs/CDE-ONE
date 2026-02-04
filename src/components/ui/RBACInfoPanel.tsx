/**
 * RBACInfoPanel Component
 *
 * Displays comprehensive RBAC information for the current user.
 * Shows permissions, role information, and what actions are available.
 * Part of ISO 19650 compliant access control system.
 */
import React from 'react';
import {
  ShieldCheck,
  Shield,
  Eye,
  Download,
  Upload,
  Edit,
  Trash2,
  Share2,
  CheckCircle,
  Lock,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { usePermissions } from '@/src/features/rbac';
import { useAuth } from '@/src/features/auth';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';

export interface RBACInfoPanelProps {
  className?: string;
  compact?: boolean;
}

const permissionInfo = [
  { key: 'view', label: 'View Documents', icon: Eye, description: 'Access to view documents in the CDE' },
  { key: 'download', label: 'Download', icon: Download, description: 'Download documents from the CDE' },
  { key: 'upload', label: 'Upload', icon: Upload, description: 'Upload new documents to the CDE' },
  { key: 'update', label: 'Edit/Update', icon: Edit, description: 'Modify document metadata and content' },
  { key: 'delete', label: 'Delete', icon: Trash2, description: 'Permanently remove documents' },
  { key: 'promote', label: 'Promote/Publish', icon: Share2, description: 'Move documents through workflow states' },
];

export const RBACInfoPanel: React.FC<RBACInfoPanelProps> = ({
  className,
  compact = false
}) => {
  const { user } = useAuth();
  const { can, getPermissions, hasRole } = usePermissions();
  const [isExpanded, setIsExpanded] = useState(!compact);
  const permissions = getPermissions();

  if (!user) return null;

  const roleColors = {
    Admin: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-500',
      gradient: 'from-red-500 to-red-600'
    },
    'Project Manager': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    Viewer: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      icon: 'text-slate-400',
      gradient: 'from-slate-500 to-slate-600'
    }
  };

  const colors = roleColors[user.role];

  return (
    <div className={cn(
      'rounded-2xl border shadow-sm overflow-hidden',
      colors.bg,
      colors.border,
      className
    )}>
      {/* Header */}
      <div
        className={cn(
          'px-4 py-3 flex items-center justify-between cursor-pointer transition-colors hover:bg-black/5',
          colors.gradient,
          !isExpanded && colors.bg
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={cn('p-2 rounded-xl bg-white/20', colors.text === 'text-white' && '!text-white')}>
            <Shield className={cn('w-5 h-5', colors.text === 'text-white' ? 'text-white' : '')} />
          </div>
          <div>
            <div className={cn('font-bold text-sm', colors.text === 'text-white' ? 'text-white' : colors.text)}>
              {user.role}
            </div>
            <div className={cn('text-[10px] opacity-80', colors.text === 'text-white' ? 'text-white/80' : 'text-slate-500')}>
              {permissions.length} permissions available
            </div>
          </div>
        </div>
        {compact && (
          <div className={cn(colors.text === 'text-white' ? 'text-white' : colors.text)}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </div>

      {/* Permissions Grid */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Permissions */}
          <div className="grid grid-cols-2 gap-2">
            {permissionInfo.map((perm) => {
              const hasPermission = can(perm.key as any);
              const Icon = perm.icon;

              return (
                <div
                  key={perm.key}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all',
                    hasPermission
                      ? 'bg-white border-green-200 shadow-sm'
                      : 'bg-slate-100/50 border-slate-200 opacity-60'
                  )}
                  title={perm.description}
                >
                  {hasPermission ? (
                    <CheckCircle className={cn('w-4 h-4 flex-shrink-0', colors.icon)} />
                  ) : (
                    <Lock className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  )}
                  <Icon className={cn(
                    'w-4 h-4 flex-shrink-0',
                    hasPermission ? colors.icon : 'text-slate-400'
                  )} />
                  <span className={cn(
                    'text-xs font-medium truncate',
                    hasPermission ? colors.text : 'text-slate-500'
                  )}>
                    {perm.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Info Banner */}
          {user.role === 'Viewer' && (
            <div className="flex items-start space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                <span className="font-semibold">Viewer Role:</span> Read-only access to published documents.
                Contact your administrator to request additional permissions.
              </p>
            </div>
          )}

          {user.role === 'Project Manager' && (
            <div className="flex items-start space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
              <Info className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-green-700 leading-relaxed">
                <span className="font-semibold">Project Manager:</span> Full document management except deletion.
                You can upload, edit, and publish documents. Contact Admin for delete requests.
              </p>
            </div>
          )}

          {user.role === 'Admin' && (
            <div className="flex items-start space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700 leading-relaxed">
                <span className="font-semibold">Administrator:</span> Full system access including user management
                and document deletion. All actions are logged for audit purposes.
              </p>
            </div>
          )}

          {/* ISO 19650 Compliance Note */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-[9px] text-slate-400 text-center">
              Access control follows ISO 19650:2018 standards • All actions logged
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RBACInfoPanel;
