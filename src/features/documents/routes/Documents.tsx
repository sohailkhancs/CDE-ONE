
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FolderTree,
  FileText,
  UploadCloud,
  Search,
  MoreVertical,
  Download,
  X,
  Plus,
  ShieldCheck,
  CheckCircle,
  Archive,
  Share2,
  Loader2,
  FileCode,
  Menu,
  Image as ImageIcon,
  Layout,
  List,
  LayoutGrid,
  ArrowUpDown,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Filter,
  Lock,
  AlertCircle,
  Ban
} from 'lucide-react';
import { ISO_FOLDERS, DISCIPLINES } from '@/src/lib/constants';
import Badge from '@/src/components/ui/Badge';
import { useToast } from '@/src/contexts/ToastContext';
import { FileEntry } from '@/src/types';
import { useAuth } from '@/src/features/auth';
import { DocumentsService } from '../api/documentsService';
import UploadModal from '../components/UploadModal';
import DocumentViewer from '../components/DocumentViewer';
import DocumentHoverPreview from '../components/DocumentHoverPreview';
import ConfirmationModal, { ConfirmationType } from '@/src/components/ui/ConfirmationModal';
import { RBACInfoPanel } from '@/src/components/ui/RBACInfoPanel';
import { RBACGuideModal } from '@/src/components/ui/RBACGuideModal';
import {
  usePermissions,
  useDocumentAccess,
  useAuditLog
} from '@/src/features/rbac';
import { canPromoteDocument, isValidTransition } from '@/src/features/rbac/rbac';

const DocsView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  // RBAC Hooks
  const { can: hasPermission, hasRole } = usePermissions();
  const auditLog = useAuditLog();

  // Helper: Get document access permissions
  const getDocumentPermissions = useCallback((file: FileEntry) => {
    const docStatus = file.status as 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
    const authorId = file.author;

    return {
      canView: hasPermission('view') && (
        hasRole('Admin') ||
        docStatus !== 'S0' ||
        authorId === user?.id
      ),
      canDownload: hasPermission('download') && (
        hasRole('Admin') ||
        docStatus !== 'S0' ||
        authorId === user?.id
      ),
      canUpdate: hasPermission('update') && (
        hasRole('Admin') ||
        (docStatus !== 'S0' && hasRole('Project Manager')) ||
        (docStatus === 'S0' && authorId === user?.id)
      ),
      canDelete: hasPermission('delete') && hasRole('Admin'),
      canPromote: (targetStatus: 'S1' | 'S2' | 'S3' | 'S4' | 'S5') => {
        if (!hasPermission('promote')) return false;
        if (hasRole('Admin')) return true;
        if (docStatus === 'S0') return authorId === user?.id && isValidTransition(docStatus, targetStatus);
        return hasRole('Project Manager') && isValidTransition(docStatus, targetStatus);
      },
      canUpload: hasPermission('upload')
    };
  }, [hasPermission, hasRole, user]);

  // Helper: Disabled Button with Tooltip
  const DisabledActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    reason: string;
  }> = ({ icon, label, reason }) => (
    <div className="relative group">
      <button
        disabled
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-100 text-slate-400 text-sm font-bold rounded-xl cursor-not-allowed border border-slate-200"
      >
        {icon}
        <span>{label}</span>
        <Lock size={14} className="ml-auto" />
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="flex items-center space-x-2">
          <Lock size={12} />
          <span>{reason}</span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45"></div>
      </div>
    </div>
  );

  // Helper: Disabled Icon Button
  const DisabledIconAction: React.FC<{
    icon: React.ReactNode;
    reason: string;
  }> = ({ icon, reason }) => (
    <div className="relative group inline-block">
      <button
        disabled
        className="p-2 text-slate-300 cursor-not-allowed rounded-full"
      >
        {icon}
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="flex items-center space-x-2">
          <Lock size={12} />
          <span>{reason}</span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45"></div>
      </div>
    </div>
  );

  // State
  const [activeFolder, setActiveFolder] = useState('published');
  const [activeSubFolder, setActiveSubFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [viewerDocument, setViewerDocument] = useState<FileEntry | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isRbacGuideOpen, setIsRbacGuideOpen] = useState(false);
  const [isTreeExpanded, setIsTreeExpanded] = useState(true);

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'default',
    confirmText: 'Confirm',
    onConfirm: () => { },
  });

  // Effect: Load Data (must be before any conditional returns)
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await DocumentsService.getAll();
      setFiles(data || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Effect: Close sidebar when switching folders or subfolders
  useEffect(() => {
    setSelectedFile(null);
    setActionMenuOpen(null);
  }, [activeFolder, activeSubFolder]);

  // Effect: Close sidebar on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isViewerOpen) {
          setIsViewerOpen(false);
          setViewerDocument(null);
        }
        if (selectedFile) {
          setSelectedFile(null);
        }
        if (actionMenuOpen) {
          setActionMenuOpen(null);
        }
        if (isUploadModalOpen) {
          setIsUploadModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedFile, isViewerOpen, actionMenuOpen, isUploadModalOpen]);

  // Helper: Check if file belongs to a folder
  const fileBelongsToFolder = (f: FileEntry, folderId: string) => {
    const id = f.id.toLowerCase();
    const status = f.status.toUpperCase();

    if (folderId === 'wip') return status === 'S0' || id.includes('wip') || status === 'WIP';
    if (folderId === 'shared') return ['S1', 'S2', 'S3'].some(s => status.startsWith(s)) || id.includes('shared');
    if (folderId === 'published') return ['S4', 'A1'].some(s => status.startsWith(s)) || id.includes('published') || id.startsWith('f');
    if (folderId === 'archive') return status === 'S5' || id.includes('arc');
    return false;
  };

  // Helper: Normalize discipline to name
  // e.g. "ARC" -> "Architecture", "Architecture" -> "Architecture"
  const getDisciplineName = (codeOrName: string) => {
    const found = DISCIPLINES.find(d => d.code === codeOrName || d.name === codeOrName);
    return found ? found.name : codeOrName;
  };

  // Filter Logic
  const filteredFiles = useMemo(() => {
    if (!files) return [];
    return files.filter(f => {
      // 1. Folder check
      if (!fileBelongsToFolder(f, activeFolder)) return false;

      // 2. Subfolder (Discipline) check
      if (activeSubFolder) {
        const fileDiscName = getDisciplineName(f.discipline);
        // activeSubFolder is the full name (e.g. "Architecture")
        if (fileDiscName !== activeSubFolder) return false;
      }

      // 3. Search check
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [activeFolder, activeSubFolder, searchQuery, files]);

  // Counts Logic
  const counts = useMemo(() => {
    const folderCounts: Record<string, number> = {};
    const subFolderCounts: Record<string, Record<string, number>> = {};

    ISO_FOLDERS.forEach(folder => {
      // Initialize
      folderCounts[folder.id] = 0;
      if (folder.subfolders) {
        subFolderCounts[folder.id] = {};
        folder.subfolders.forEach(sub => subFolderCounts[folder.id][sub] = 0);
      }
    });

    // Count matches
    files.forEach(f => {
      ISO_FOLDERS.forEach(folder => {
        if (fileBelongsToFolder(f, folder.id)) {
          folderCounts[folder.id]++;

          // For subfolders (disciplines), we need to match the file's discipline to the folder's list
          if (folder.subfolders && f.discipline) {
            const fileDiscName = getDisciplineName(f.discipline);
            if (subFolderCounts[folder.id][fileDiscName] !== undefined) {
              subFolderCounts[folder.id][fileDiscName]++;
            }
          }
        }
      });
    });

    return { folderCounts, subFolderCounts };
  }, [files]);

  // Defensive Check
  if (!ISO_FOLDERS || !Array.isArray(ISO_FOLDERS)) {
    return <div className="p-10 text-red-600">Configuration Error: ISO defined folders missing.</div>;
  }

  const currentFolder = ISO_FOLDERS.find(f => f.id === activeFolder);

  // Helpers
  const getFileIcon = (filename: string) => {
    if (filename.includes('captain')) return <FileText size={20} className="text-red-600" />;
    if (filename.includes('shawl')) return <ImageIcon size={20} className="text-purple-600" />;
    if (filename.endsWith('.dwg') || filename.endsWith('.rvt')) return <Layout size={20} className="text-blue-600" />;
    if (filename.endsWith('.pdf')) return <FileText size={20} className="text-red-600" />;
    if (filename.endsWith('.jpg') || filename.endsWith('.png')) return <ImageIcon size={20} className="text-purple-600" />;
    return <FileCode size={20} className="text-slate-500" />;
  };

  const getFileExtension = (filename: string): string => {
    if (filename.includes('captain')) return 'PDF';
    if (filename.includes('shawl')) return 'JPG';
    if (filename.endsWith('.pdf')) return 'PDF';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'JPG';
    if (filename.endsWith('.png')) return 'PNG';
    if (filename.endsWith('.dwg')) return 'DWG';
    if (filename.endsWith('.rvt')) return 'RVT';
    return 'FILE';
  };

  const currentISOCode = activeFolder === 'wip' ? 'S0'
    : activeFolder === 'shared' ? 'S1-S3'
      : activeFolder === 'published' ? 'A1/S4'
        : 'S5';

  return (
    <div className="flex h-full bg-slate-50 relative overflow-hidden font-sans">

      {/* 1. LEFT SIDEBAR: CDE Structure (Tree View) */}
      <div className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10 transition-all duration-300 ${isTreeExpanded ? 'w-72' : 'w-16'}`}>
        <div className={`h-16 flex items-center ${isTreeExpanded ? 'px-6 justify-between' : 'justify-center'} border-b border-slate-100 bg-gradient-to-r from-white to-slate-50`}>
          {isTreeExpanded && (
            <div className="flex items-center space-x-2 text-slate-900 font-extrabold tracking-tight">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <FolderTree size={18} className="text-red-600" />
              </div>
              <span className="text-lg">CDE Explorer</span>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsTreeExpanded(!isTreeExpanded)}
            className={`p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all`}
            title={isTreeExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 px-2">
          {ISO_FOLDERS.map((folder) => {
            const isActive = activeFolder === folder.id;
            const count = counts.folderCounts[folder.id] || 0;
            return (
              <div key={folder.id} className="relative group/item">
                <button
                  onClick={() => { setActiveFolder(folder.id); setActiveSubFolder(null); if (!isTreeExpanded) setIsTreeExpanded(true); }}
                  className={`w-full flex items-center ${isTreeExpanded ? 'justify-between px-3' : 'justify-center px-1'} py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${isActive ? 'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  title={!isTreeExpanded ? folder.name : ''}
                >
                  <div className={`flex items-center flex-1 min-w-0 z-10 ${!isTreeExpanded && 'justify-center'}`}>
                    <span className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white text-red-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover/item:bg-white group-hover/item:text-slate-600'} ${isTreeExpanded ? 'mr-3' : ''}`}>
                      {folder.id === 'wip' && <Plus size={16} />}
                      {folder.id === 'shared' && <Share2 size={16} />}
                      {folder.id === 'published' && <CheckCircle size={16} />}
                      {folder.id === 'archive' && <Archive size={16} />}
                    </span>
                    {isTreeExpanded && <span className="truncate font-semibold">{folder.name}</span>}
                  </div>

                  {isTreeExpanded && (
                    <div className="flex items-center space-x-2 z-10">
                      {/* Count Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${isActive ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-500 group-hover/item:bg-slate-200'}`}>
                        {count}
                      </span>
                      {isActive && <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mono font-bold tracking-wider opacity-80">{currentISOCode}</span>}
                    </div>
                  )}
                </button>

                {/* Collapsed Sub-menu Popup (Optional enhancement) could go here but keeping simple for now */}
                {folder.subfolders && isActive && isTreeExpanded && (
                  <div className="mt-2 mb-3 ml-4 space-y-1 border-l-2 border-slate-100 pl-4 py-1 animate-fadeIn">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveSubFolder(null); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${!activeSubFolder ? 'font-bold text-slate-800 bg-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                    >
                      <span>All Disciplines</span>
                      <span className="bg-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] min-w-[20px] text-center">{count}</span>
                    </button>
                    {folder.subfolders.map(sub => {
                      const subCount = counts.subFolderCounts[folder.id]?.[sub] || 0;
                      return (
                        <button
                          key={sub}
                          onClick={(e) => { e.stopPropagation(); setActiveSubFolder(sub); }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${activeSubFolder === sub ? 'font-bold text-slate-800 bg-slate-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                        >
                          <span className="truncate">{sub}</span>
                          {subCount > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] min-w-[20px] text-center transition-colors ${activeSubFolder === sub ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400'}`}>
                              {subCount}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Filters Info */}
        {isTreeExpanded ? (
          <div className="p-4 mx-4 mb-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center space-x-2 text-slate-500 mb-2">
              <Filter size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Active Filters</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">State:</span>
                <span className="font-medium text-slate-700">{currentFolder?.label}</span>
              </div>
              {activeSubFolder && (
                <div className="flex justify-between text-xs animate-fadeIn">
                  <span className="text-slate-400">Discipline:</span>
                  <span className="font-medium text-slate-700">{activeSubFolder}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto mb-4 p-2 bg-slate-50 rounded-xl" title="Filters Active">
            <Filter size={16} className="text-slate-400" />
          </div>
        )}

        {/* RBAC Info Panel */}
        {isTreeExpanded && (
          <div className="px-4">
            <RBACInfoPanel compact />
          </div>
        )}

        {/* Storage Usage / Info */}
        {isTreeExpanded && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Storage Usage</span>
              <span>75%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-slate-700 to-slate-900 w-3/4 rounded-full"></div>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 font-medium">1.2 TB of 2.0 TB used</p>
          </div>
        )}
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-20 shadow-sm">
          <div className="flex items-baseline space-x-4">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{currentFolder?.label}</h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-500 flex items-center cursor-help hover:border-slate-300 transition-colors">
              <ShieldCheck size={12} className="mr-1.5 text-green-600" />
              ISO 19650-2 Compliant
            </span>
          </div>

          {/* User Role Badge - Shows current user's role and permissions */}
          <div className="flex items-center space-x-3">
            {/* RBAC Help Button */}
            <button
              onClick={() => setIsRbacGuideOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              title="View permissions guide"
            >
              <ShieldCheck size={18} />
            </button>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border bg-slate-50">
              <div className={`w-2 h-2 rounded-full ${user?.role === 'Admin' ? 'bg-red-500' :
                user?.role === 'Project Manager' ? 'bg-blue-500' :
                  'bg-slate-400'
                }`}></div>
              <span className="text-xs font-bold text-slate-700">{user?.role || 'Guest'}</span>
              <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">
                {user?.role === 'Admin' && 'Full Access'}
                {user?.role === 'Project Manager' && 'Manage & Publish'}
                {user?.role === 'Viewer' && 'Read Only'}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search containers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white w-64 transition-all hover:bg-white"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            {/* Upload Button - RBAC Protected */}
            {hasPermission('upload') ? (
              <button
                onClick={() => {
                  auditLog('document.upload.click', 'document', undefined, undefined, { action: 'open_upload_modal' });
                  setIsUploadModalOpen(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 flex items-center transition-all active:scale-95 hover:-translate-y-0.5"
              >
                <UploadCloud size={16} className="mr-2" />
                Upload
              </button>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 flex items-center cursor-not-allowed"
                >
                  <UploadCloud size={16} className="mr-2" />
                  Upload
                  <Lock size={12} className="ml-2" />
                </button>
                <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="flex items-center space-x-2">
                    <Ban size={12} className="text-red-400" />
                    <span>Viewer role cannot upload documents</span>
                  </div>
                  <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Table / Grid Content */}
        <div className="flex-1 overflow-auto bg-slate-50/50 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 size={32} className="animate-spin text-red-600 mb-3" />
              <span className="text-sm font-medium text-slate-500">Retrieving Information Containers...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <FolderTree size={32} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Containers Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed">
                There are no documents in <span className="font-semibold text-slate-700">{activeSubFolder || currentFolder?.name}</span> matching your filters.
                <br />Try adjusting your search or upload a new container.
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ring-1 ring-black/5">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-500 flex items-center cursor-pointer hover:text-slate-700 transition">Name <ArrowUpDown size={14} className="ml-1 opacity-50" /></th>
                        <th className="px-6 py-4 font-bold text-slate-500">Container ID</th>
                        <th className="px-6 py-4 font-bold text-slate-500">Rev</th>
                        <th className="px-6 py-4 font-bold text-slate-500">Status</th>
                        <th className="px-6 py-4 font-bold text-slate-500">Date</th>
                        <th className="px-6 py-4 font-bold text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFiles.map(file => (
                        <tr
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer group ${selectedFile?.id === file.id ? 'bg-red-50 hover:bg-red-50' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="mr-4 p-2.5 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all relative">
                                {getFileIcon(file.name)}
                                {/* Extension Badge */}
                                <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                  {getFileExtension(file.name)}
                                </span>
                              </div>
                              <div>
                                <DocumentHoverPreview document={file}>
                                  <div className={`font-bold text-sm mb-0.5 transition-colors ${selectedFile?.id === file.id ? 'text-red-700' : 'text-slate-900'}`}>{file.name}</div>
                                </DocumentHoverPreview>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">{file.discipline}</span>
                                  <span className="text-[10px] text-slate-400">|</span>
                                  <span className="text-xs text-slate-400">{file.size}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-xs">{file.id.toUpperCase()}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-slate-700">{file.rev}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge status={file.status} className="border shadow-sm" />
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{file.date}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {/* Download Action */}
                              {getDocumentPermissions(file).canDownload ? (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await DocumentsService.download(file.id, file.name);
                                      success('Document downloaded');
                                    } catch (err) {
                                      error('Failed to download');
                                    }
                                  }}
                                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
                                  title="Download"
                                >
                                  <Download size={16} />
                                </button>
                              ) : (
                                <DisabledIconAction
                                  icon={<Download size={16} />}
                                  reason={file.status === 'S0' && file.author !== user?.id ? 'WIP documents are restricted' : 'No download permission'}
                                />
                              )}

                              {/* View/Preview Action */}
                              {getDocumentPermissions(file).canView ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewerDocument(file);
                                    setIsViewerOpen(true);
                                  }}
                                  onContextMenu={(e) => {
                                    // Prevent right-click from opening sidebar in preview mode
                                    e.preventDefault();
                                  }}
                                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
                                  title="Preview"
                                >
                                  <Eye size={16} />
                                </button>
                              ) : (
                                <DisabledIconAction
                                  icon={<Eye size={16} />}
                                  reason="WIP documents are visible only to their author"
                                />
                              )}

                              {/* More Actions Menu */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuOpen(actionMenuOpen === file.id ? null : file.id);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden ${selectedFile?.id === file.id ? 'ring-2 ring-red-500 border-transparent shadow-md' : 'border-slate-200'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100 relative group-hover:scale-110 transition-transform duration-300">
                          {getFileIcon(file.name)}
                          {/* Extension Badge */}
                          <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {getFileExtension(file.name)}
                          </span>
                        </div>
                        <Badge status={file.status} className="!text-[10px]" />
                      </div>
                      <DocumentHoverPreview document={file}>
                        <h3 className="font-bold text-slate-900 text-sm mb-1 truncate" title={file.name}>{file.name}</h3>
                      </DocumentHoverPreview>
                      <p className="text-xs text-slate-500 mb-4">{file.discipline}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                        <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">{file.rev}</span>
                        <span className="text-slate-400 font-medium">{file.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Backdrop Overlay - Closes sidebar when clicked */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20 transition-opacity duration-300 animate-fadeIn"
          onClick={() => setSelectedFile(null)}
          aria-hidden="true"
        />
      )}

      {/* 3. RIGHT SIDEBAR: Metadata (Slide-Over) */}
      <div
        className={`w-96 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300 transform shadow-2xl z-30 ${selectedFile ? 'translate-x-0' : 'translate-x-full hidden'}`}
      >
        {selectedFile && (
          <>
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0">
              <span className="font-bold text-slate-900 text-sm uppercase tracking-wide">Attributes</span>
              <button onClick={() => setSelectedFile(null)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                  {getFileIcon(selectedFile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight break-words">{selectedFile.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200">{selectedFile.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-full mr-2"></div>
                    General
                  </h4>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                      <span className="text-slate-500">Revision</span>
                      <span className="font-bold text-slate-900">{selectedFile.rev}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                      <span className="text-slate-500">Status</span>
                      <Badge status={selectedFile.status} />
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                      <span className="text-slate-500">Size</span>
                      <span className="font-bold text-slate-900">{selectedFile.size}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <div className="w-2 h-2 bg-red-300 rounded-full mr-2"></div>
                    ISO 19650 Metadata
                  </h4>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
                    {[
                      ['Originator', selectedFile.author],
                      ['Volume/System', '01 - Foundation'],
                      ['Level/Location', 'L2'],
                      ['Type', 'M3 - 3D Model'],
                      ['Role', 'A - Architect'],
                      ['Classification', 'Uniclass 2015']
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-bold text-slate-900 text-right truncate pl-4">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity History (Audit Trail) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <div className="w-2 h-2 bg-blue-300 rounded-full mr-2"></div>
                    Activity History
                  </h4>
                  <div className="relative pl-3 border-l-2 border-slate-100 space-y-6 ml-1">
                    {selectedFile.versions && selectedFile.versions.length > 0 ? (
                      selectedFile.versions.map((version, index) => (
                        <div key={index} className="relative">
                          {/* Dot */}
                          <div className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${index === 0 ? 'bg-blue-500 ring-2 ring-blue-100' : 'bg-slate-300'}`}></div>

                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              Rev {version.rev}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {version.date}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 mb-1">
                            <span className="font-semibold text-slate-700">{version.author}</span>
                            <span className="mx-1 text-slate-300">•</span>
                            <span className={`${version.status === 'S4' ? 'text-green-600 font-medium' :
                              version.status === 'S5' ? 'text-slate-500' :
                                version.status.startsWith('S') ? 'text-blue-600' : 'text-slate-500'
                              }`}>
                              {version.status}
                            </span>
                          </div>

                          {version.comment && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 italic leading-relaxed">
                              "{version.comment}"
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 italic pl-1">No history available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {/* ISO 19650 Workflow Actions */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Workflow Status</h4>
                    <div className="flex items-center mt-1 space-x-2">
                      <div className={`w-2 h-2 rounded-full ${selectedFile.status === 'S5' ? 'bg-slate-500' : 'bg-green-500 animate-pulse'}`}></div>
                      <span className="text-xs font-medium text-slate-600">Current State: {selectedFile.status}</span>
                    </div>
                  </div>
                </div>

                {/* Workflow Progress Bar */}
                <div className="mb-5 mt-2">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-2">
                    <span>WIP</span>
                    <span>Shared</span>
                    <span>Published</span>
                    <span>Archive</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: selectedFile.status === 'S0' ? '15%' :
                          ['S1', 'S2', 'S3'].some(s => selectedFile.status.startsWith(s)) ? '50%' :
                            ['S4', 'A1'].some(s => selectedFile.status.startsWith(s)) ? '85%' : '100%',
                        backgroundColor: selectedFile.status === 'S5' ? '#64748b' : '#dc2626'
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons - RBAC Protected */}
                <div className="space-y-2">
                  {/* Share Button - S0 only, with RBAC */}
                  {selectedFile.status === 'S0' && (
                    getDocumentPermissions(selectedFile).canPromote('S1') ? (
                      <button
                        onClick={() => {
                          if (!selectedFile) return;
                          setConfirmationModal({
                            isOpen: true,
                            title: 'Share for Coordination',
                            message: `Are you sure you want to share "${selectedFile.name}" for coordination? This will move the document to the Shared folder (S1 status).`,
                            type: 'info',
                            confirmText: 'Share Now',
                            onConfirm: async () => {
                              setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                              const targetState = 'S1';
                              setIsPromoting(true);
                              try {
                                auditLog('document.promote', 'document', selectedFile.id, selectedFile.name, { from: 'S0', to: 'S1' });
                                const result = await DocumentsService.promote(selectedFile.id, targetState);
                                if (selectedFile && result) {
                                  setSelectedFile({
                                    ...selectedFile,
                                    status: result.new_status,
                                    rev: result.new_revision || selectedFile.rev
                                  });
                                }
                                await loadDocuments();
                                success('Document shared for coordination');
                              } catch (err) {
                                error('Failed to share document');
                                auditLog('document.promote.failed', 'document', selectedFile.id, selectedFile.name, { from: 'S0', to: 'S1' }, false, (err as Error).message);
                              } finally {
                                setIsPromoting(false);
                              }
                            }
                          });
                        }}
                        disabled={isPromoting}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPromoting ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                        <span>Share for Coordination</span>
                      </button>
                    ) : (
                      <DisabledActionButton
                        icon={<Share2 size={18} />}
                        label="Share for Coordination"
                        reason={
                          selectedFile.author !== user?.id
                            ? 'Only document author can share WIP documents'
                            : 'Your role cannot promote documents'
                        }
                      />
                    )
                  )}

                  {/* Publish Button - S1, S2, S3, with RBAC */}
                  {['S1', 'S2', 'S3'].includes(selectedFile.status) && (
                    getDocumentPermissions(selectedFile).canPromote('S4') ? (
                      <button
                        onClick={() => {
                          if (!selectedFile) return;
                          setConfirmationModal({
                            isOpen: true,
                            title: 'Publish for Construction',
                            message: `Are you sure you want to publish "${selectedFile.name}" for construction?\n\nThis will change the revision from P-series to C-series and move the document to the Published folder (S4 status).`,
                            type: 'success',
                            confirmText: 'Publish Now',
                            onConfirm: async () => {
                              setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                              const targetState = 'S4';
                              setIsPromoting(true);
                              try {
                                auditLog('document.promote', 'document', selectedFile.id, selectedFile.name, { from: selectedFile.status, to: 'S4', action: 'publish' });
                                const result = await DocumentsService.promote(selectedFile.id, targetState);
                                if (selectedFile && result) {
                                  setSelectedFile({
                                    ...selectedFile,
                                    status: result.new_status,
                                    rev: result.new_revision || selectedFile.rev
                                  });
                                }
                                await loadDocuments();
                                success('Document published for construction');
                              } catch (err) {
                                error('Failed to publish document');
                                auditLog('document.promote.failed', 'document', selectedFile.id, selectedFile.name, { from: selectedFile.status, to: 'S4' }, false, (err as Error).message);
                              } finally {
                                setIsPromoting(false);
                              }
                            }
                          });
                        }}
                        disabled={isPromoting}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPromoting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        <span>Publish for Construction</span>
                      </button>
                    ) : (
                      <DisabledActionButton
                        icon={<CheckCircle size={18} />}
                        label="Publish for Construction"
                        reason={
                          hasRole('Viewer')
                            ? 'Viewer role cannot publish documents'
                            : 'Project Manager or Admin role required'
                        }
                      />
                    )
                  )}

                  {/* Archive Button - S4 only, with RBAC */}
                  {selectedFile.status === 'S4' && (
                    getDocumentPermissions(selectedFile).canPromote('S5') ? (
                      <button
                        onClick={() => {
                          if (!selectedFile) return;
                          setConfirmationModal({
                            isOpen: true,
                            title: 'Archive Document',
                            message: `Are you sure you want to archive "${selectedFile.name}"?\n\nThis will mark the document as no longer active and move it to the Archive folder (S5 status).`,
                            type: 'warning',
                            confirmText: 'Archive Now',
                            onConfirm: async () => {
                              setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                              const targetState = 'S5';
                              setIsPromoting(true);
                              try {
                                auditLog('document.promote', 'document', selectedFile.id, selectedFile.name, { from: 'S4', to: 'S5', action: 'archive' });
                                const result = await DocumentsService.promote(selectedFile.id, targetState);
                                if (selectedFile && result) {
                                  setSelectedFile({
                                    ...selectedFile,
                                    status: result.new_status,
                                    rev: result.new_revision || selectedFile.rev
                                  });
                                }
                                await loadDocuments();
                                success('Document archived');
                              } catch (err) {
                                error('Failed to archive document');
                                auditLog('document.promote.failed', 'document', selectedFile.id, selectedFile.name, { from: 'S4', to: 'S5' }, false, (err as Error).message);
                              } finally {
                                setIsPromoting(false);
                              }
                            }
                          });
                        }}
                        disabled={isPromoting}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPromoting ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
                        <span>Archive Document</span>
                      </button>
                    ) : (
                      <DisabledActionButton
                        icon={<Archive size={18} />}
                        label="Archive Document"
                        reason={
                          hasRole('Viewer')
                            ? 'Viewer role cannot archive documents'
                            : 'Project Manager or Admin role required'
                        }
                      />
                    )
                  )}

                  {/* Archived Notice - S5 */}
                  {selectedFile.status === 'S5' && (
                    <div className="text-center py-3 px-4 bg-slate-100 rounded-xl text-xs text-slate-600 font-medium">
                      <Archive size={16} className="mx-auto mb-1 text-slate-400" />
                      This document is archived
                    </div>
                  )}
                </div>
              </div>

              {/* Download Button - RBAC Protected */}
              {getDocumentPermissions(selectedFile).canDownload ? (
                <button
                  onClick={async () => {
                    if (!selectedFile) return;
                    auditLog('document.download', 'document', selectedFile.id, selectedFile.name, { size: selectedFile.size });
                    try {
                      await DocumentsService.download(selectedFile.id, selectedFile.name);
                      success('Document downloaded successfully');
                    } catch (err) {
                      error('Failed to download document');
                    }
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-slate-900/20 hover:-translate-y-0.5"
                >
                  <Download size={18} />
                  <span>Download Container</span>
                </button>
              ) : (
                <DisabledActionButton
                  icon={<Download size={18} />}
                  label="Download Container"
                  reason={
                    selectedFile?.status === 'S0' && selectedFile?.author !== user?.id
                      ? 'WIP documents can only be downloaded by their author'
                      : 'Your role does not have download permission'
                  }
                />
              )}

              <div className="flex space-x-3">
                {/* Preview Button - Always available if user can view */}
                {getDocumentPermissions(selectedFile).canView ? (
                  <button
                    onClick={() => {
                      if (!selectedFile) return;
                      auditLog('document.preview', 'document', selectedFile?.id, selectedFile?.name);
                      setViewerDocument(selectedFile); // Store document for viewer BEFORE closing sidebar
                      setSelectedFile(null); // Close sidebar when opening viewer
                      setIsViewerOpen(true);
                    }}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition shadow-sm"
                  >
                    <Eye size={18} className="mx-auto" />
                  </button>
                ) : (
                  <div className="relative group flex-1">
                    <button
                      disabled
                      className="w-full bg-slate-100 text-slate-400 border border-slate-200 font-bold py-3 rounded-xl cursor-not-allowed"
                    >
                      <Eye size={18} className="mx-auto" />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <div className="flex items-center space-x-2">
                        <Lock size={12} />
                        <span>WIP documents are visible only to their author</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  </div>
                )}

                {/* Delete Button - Admin Only */}
                {getDocumentPermissions(selectedFile).canDelete ? (
                  <button
                    onClick={() => {
                      if (!selectedFile) return;
                      setConfirmationModal({
                        isOpen: true,
                        title: 'Delete Document',
                        message: `Are you sure you want to permanently delete "${selectedFile.name}"?\n\nThis action cannot be undone and will be logged for audit purposes.`,
                        type: 'danger',
                        confirmText: 'Delete',
                        onConfirm: async () => {
                          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                          setIsDeleting(true);
                          try {
                            auditLog('document.delete', 'document', selectedFile.id, selectedFile.name);
                            await DocumentsService.delete(selectedFile.id);
                            setSelectedFile(null);
                            await loadDocuments();
                            success('Document deleted successfully');
                          } catch (err) {
                            error('Failed to delete document');
                            auditLog('document.delete.failed', 'document', selectedFile.id, selectedFile.name, undefined, false, (err as Error).message);
                          } finally {
                            setIsDeleting(false);
                          }
                        }
                      });
                    }}
                    disabled={isDeleting}
                    className={`flex-1 bg-white border ${isDeleting ? 'border-red-200' : 'border-slate-200'} text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition flex items-center justify-center shadow-sm ${isDeleting ? 'opacity-70' : ''}`}
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                ) : (
                  <div className="relative group flex-1">
                    <button
                      disabled
                      className="w-full bg-slate-100 text-slate-300 border border-slate-200 font-bold py-3 rounded-xl cursor-not-allowed flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck size={12} className="text-amber-400" />
                        <span>Only Admin can delete documents</span>
                      </div>
                      <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={async () => {
          await loadDocuments();
          setIsUploadModalOpen(false);
        }}
      />

      {/* Document Viewer Modal */}
      <DocumentViewer
        document={viewerDocument}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setViewerDocument(null);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        isLoading={isPromoting || isDeleting}
      />

      {/* RBAC Guide Modal */}
      <RBACGuideModal
        isOpen={isRbacGuideOpen}
        onClose={() => setIsRbacGuideOpen(false)}
      />

    </div>
  );
};

export default DocsView;
