/**
 * RBACGuideModal Component
 *
 * Educational modal explaining ISO 19650 RBAC system, roles, and document workflow.
 * Helps users understand their permissions and the document lifecycle.
 */
import React from 'react';
import {
  X,
  Shield,
  Lock,
  Eye,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Workflow
} from 'lucide-react';
import { useAuth } from '@/src/features/auth';
import { usePermissions } from '@/src/features/rbac';
import { cn } from '@/src/lib/utils';

export interface RBACGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkflowStep {
  status: string;
  label: string;
  description: string;
  whoCanSee: string[];
  color: string;
}

const workflowSteps: WorkflowStep[] = [
  {
    status: 'S0',
    label: 'Work in Progress',
    description: 'Initial draft - only visible to author and Admin',
    whoCanSee: ['Author', 'Admin'],
    color: 'bg-amber-100 text-amber-700 border-amber-300'
  },
  {
    status: 'S1-S3',
    label: 'Shared/Coordination',
    description: 'Shared for review - visible to all team members',
    whoCanSee: ['All Roles'],
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  {
    status: 'S4',
    label: 'Published',
    description: 'Final approved version - immutable construction issue',
    whoCanSee: ['All Roles'],
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  {
    status: 'S5',
    label: 'Archived',
    description: 'Historical record - read-only',
    whoCanSee: ['All Roles'],
    color: 'bg-slate-100 text-slate-700 border-slate-300'
  }
];

const rolePermissions = {
  Admin: {
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    permissions: [
      { action: 'View All Documents', allowed: true, note: 'Including others\' WIP documents' },
      { action: 'Download', allowed: true },
      { action: 'Upload', allowed: true },
      { action: 'Edit/Update', allowed: true, note: 'Any document' },
      { action: 'Delete', allowed: true, note: 'Only Admin can delete' },
      { action: 'Promote/Publish', allowed: true },
      { action: 'Share Externally', allowed: true }
    ]
  },
  'Project Manager': {
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    permissions: [
      { action: 'View Documents', allowed: true, note: 'Except others\' WIP' },
      { action: 'Download', allowed: true },
      { action: 'Upload', allowed: true },
      { action: 'Edit/Update', allowed: true, note: 'Non-WIP documents' },
      { action: 'Delete', allowed: false, note: 'Contact Admin' },
      { action: 'Promote/Publish', allowed: true, note: 'Own WIP and published docs' },
      { action: 'Share Externally', allowed: true }
    ]
  },
  Viewer: {
    icon: Eye,
    color: 'text-slate-400',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    permissions: [
      { action: 'View Published', allowed: true, note: 'S1-S5 documents only' },
      { action: 'Download', allowed: true, note: 'Published documents' },
      { action: 'Upload', allowed: false },
      { action: 'Edit/Update', allowed: false },
      { action: 'Delete', allowed: false },
      { action: 'Promote/Publish', allowed: false },
      { action: 'Share Externally', allowed: false }
    ]
  }
};

export const RBACGuideModal: React.FC<RBACGuideModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { can } = usePermissions();

  if (!isOpen || !user) return null;

  const userRoleInfo = rolePermissions[user.role];
  const RoleIcon = userRoleInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-xl', userRoleInfo.bgColor, userRoleInfo.borderColor, 'border')}>
              <Shield className={cn('w-5 h-5', userRoleInfo.color)} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">ISO 19650 Access Control</h2>
              <p className="text-sm text-slate-500">Your role and permissions in the CDE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Role Card */}
          <div className={cn('rounded-2xl p-5 border-2', userRoleInfo.bgColor, userRoleInfo.borderColor)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={cn('p-3 rounded-xl bg-white shadow-sm', userRoleInfo.color)}>
                  <RoleIcon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{user.role}</h3>
                  <p className="text-sm text-slate-600">
                    {user.role === 'Admin' && 'Full system access including user management'}
                    {user.role === 'Project Manager' && 'Document management and workflow control'}
                    {user.role === 'Viewer' && 'Read-only access to published documents'}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userRoleInfo.permissions.map((perm, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl border transition-all',
                    perm.allowed
                      ? 'bg-white border-green-200 shadow-sm'
                      : 'bg-white/50 border-slate-200 opacity-60'
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {perm.allowed ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={cn('text-sm font-medium', perm.allowed ? 'text-slate-900' : 'text-slate-500')}>
                      {perm.action}
                    </span>
                  </div>
                  {perm.note && (
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {perm.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Document Workflow */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
              <Workflow className="w-4 h-4 mr-2 text-slate-400" />
              Document Workflow (ISO 19650)
            </h4>
            <div className="relative">
              {/* Workflow Steps */}
              <div className="space-y-3">
                {workflowSteps.map((step, idx) => (
                  <div key={step.status} className="flex items-start space-x-4">
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm shrink-0',
                      step.color
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-bold text-slate-900">{step.label}</h5>
                        <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{step.status}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{step.description}</p>
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Eye size={12} />
                        <span>Visible to: {step.whoCanSee.join(', ')}</span>
                      </div>
                    </div>
                    {idx < workflowSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-slate-300 mt-4 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WIP Document Rules */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-amber-900 mb-2">WIP (S0) Document Rules</h5>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Work in Progress documents are <strong>only visible to their author and Admin users</strong>.
                  This protects draft work from premature review. To share a WIP document with the team,
                  promote it to S1 (Shared) status using the &quot;Share for Coordination&quot; button.
                </p>
              </div>
            </div>
          </div>

          {/* Role Comparison Table */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Role Comparison</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Action</th>
                    <th className="text-center py-2 px-3 font-semibold text-red-600">Admin</th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-600">PM</th>
                    <th className="text-center py-2 px-3 font-semibold text-slate-500">Viewer</th>
                  </tr>
                </thead>
                <tbody>
                  {['View Docs', 'Download', 'Upload', 'Edit', 'Delete', 'Promote'].map((action) => (
                    <tr key={action} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 px-3 text-slate-700">{action}</td>
                      <td className="py-2 px-3 text-center">
                        {action === 'Delete' ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {action === 'Delete' ? (
                          <Lock className="w-4 h-4 text-slate-300 mx-auto" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {action === 'View Docs' || action === 'Download' ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            All actions are logged for ISO 19650 audit compliance
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default RBACGuideModal;
