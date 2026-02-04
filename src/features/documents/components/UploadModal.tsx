import React, { useState, useRef, useCallback } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { DocumentsService } from '../api/documentsService';
import { DISCIPLINES } from '@/src/lib/constants';
import { useToast } from '@/src/contexts/ToastContext';

// ISO 19650 Container Types
interface ContainerType {
  code: string;
  name: string;
  description: string;
}

const CONTAINER_TYPES: ContainerType[] = [
  { code: 'D1', name: '2D Drawing', description: 'Traditional 2D CAD drawings' },
  { code: 'D2', name: '2D Drawing - PDF', description: 'PDF format drawings' },
  { code: 'M1', name: '2D Model', description: '2D intelligent model' },
  { code: 'M2', name: '3D Model', description: '3D geometric model' },
  { code: 'M3', name: '3D Model - FC', description: 'Federated 3D model' },
  { code: 'C1', name: 'Catalogue', description: 'Product catalogue data' },
  { code: 'P1', name: 'Performance', description: 'Performance data' },
  { code: 'R1', name: 'Report', description: 'Report documents' }
];


// ISO 19650 Status Codes
const STATUS_CODES = [
  { code: 'S0', name: 'Work in Progress', description: 'Initial draft, not for distribution' },
  { code: 'S1', name: 'Tender', description: 'For tender/pricing purposes' },
  { code: 'S2', name: 'Construction', description: 'Approved for construction' },
  { code: 'S3', name: 'Information Approval', description: 'Pending client approval' },
  { code: 'S4', name: 'Suitable for Construction', description: 'Final approved version' },
  { code: 'S5', name: 'Archived', description: 'Project archive status' }
];

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [containerType, setContainerType] = useState('M3');
  const [description, setDescription] = useState('');
  const [originator, setOriginator] = useState('ARC');
  const [volume, setVolume] = useState('01');
  const [level, setLevel] = useState('L1');
  const [classification, setClassification] = useState('SPr_20_30_10');

  const { success, error } = useToast();
  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form
  const resetForm = useCallback(() => {
    setFile(null);
    setName('');
    setDiscipline('');
    setContainerType('M3');
    setDescription('');
    setOriginator('ARC');
    setVolume('01');
    setLevel('L1');
    setClassification('SPr_20_30_10');
    setErrors([]);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  }, [isUploading, onClose, resetForm]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationError[] = [];

    if (!file) {
      newErrors.push({ field: 'file', message: 'Please select a file to upload' });
    }

    if (!name.trim()) {
      newErrors.push({ field: 'name', message: 'Document name is required' });
    }

    if (!discipline) {
      newErrors.push({ field: 'discipline', message: 'Discipline is required' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [file, name, discipline]);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);

    // Auto-populate name if not set
    if (!name) {
      const discCode = DISCIPLINES.find(d => d.code === discipline)?.code || 'ARC';
      const fileName = selectedFile.name;
      // Remove file extension
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      // Replace spaces with underscores for ISO format
      const cleanName = nameWithoutExt.replace(/\s+/g, '_');
      setName(`${discCode}-101_${cleanName}`);
    }

    setErrors(prev => prev.filter(e => e.field !== 'file'));
  }, [name, discipline]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  // Generate container ID (ISO 19650 format)
  const generateContainerId = (): string => {
    const selectedDiscipline = DISCIPLINES.find(d => d.code === discipline);
    const originatorCode = selectedDiscipline?.originator || 'A';
    const timestamp = Date.now().toString().slice(-4);
    return `${originatorCode}-${volume}-${level}-${containerType}-${timestamp}`;
  };

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!validateForm() || !file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('discipline', discipline);
      formData.append('description', description);
      formData.append('container_type', containerType);
      formData.append('originator', originator);
      formData.append('volume', volume);
      formData.append('level', level);
      formData.append('classification', classification);

      await DocumentsService.upload(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      success('Document uploaded successfully to CDE');
      onUploadSuccess();
      onClose();

    } catch (err) {
      console.error('Upload failed:', err);
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      error(msg);
      setErrors([{ field: 'upload', message: msg }]);
    } finally {
      setIsUploading(false);
    }
  }, [file, name, discipline, containerType, description, originator, volume, level, classification, validateForm, onUploadSuccess, handleClose, success, error]);

  if (!isOpen) return null;

  const getFieldError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <UploadCloud size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upload Information Container</h2>
                <p className="text-xs text-slate-500">ISO 19650-2 Compliant Document Upload</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="p-2 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'
              } ${getFieldError('file') ? 'border-red-300 bg-red-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept=".pdf,.dwg,.rvt,.ifc,.zip"
            />

            {!file ? (
              <div>
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud size={32} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">
                  Drag & drop your file here
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  PDF, DWG, RVT, IFC, ZIP (max 100MB)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-red-600" />
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">{file.name}</p>
                <p className="text-xs text-slate-500 mb-2">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Change File
                </button>
              </div>
            )}

            {getFieldError('file') && (
              <div className="absolute top-2 right-2 flex items-center text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                <AlertCircle size={12} className="mr-1" />
                {getFieldError('file')}
              </div>
            )}
          </div>

          {/* Document Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Document Metadata
            </h3>

            {/* Container ID (Auto-generated) */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Container ID (ISO 19650)
              </label>
              <div className="font-mono text-sm text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">
                {generateContainerId()}
              </div>
            </div>

            {/* Document Name */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Clear name error when user starts typing
                  if (e.target.value.trim()) {
                    setErrors(prev => prev.filter(err => err.field !== 'name'));
                  }
                }}
                placeholder="ARC-101_FloorPlan_Level1"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition ${getFieldError('name') ? 'border-red-300' : 'border-slate-200'}`}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-500">
                  Format: XX-NNN_Description (e.g., ARC-101_FloorPlan, STR-205_Column)
                </p>
                {name.trim() && /^[A-Z]{2,3}-\d{3}_.+/.test(name) && (
                  <span className="text-xs text-green-600 flex items-center">
                    <CheckCircle size={12} className="mr-1" />
                    Valid ISO format
                  </span>
                )}
              </div>
              {getFieldError('name') && (
                <p className="text-xs text-red-600 mt-1">{getFieldError('name')}</p>
              )}
            </div>

            {/* Discipline & Container Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Discipline <span className="text-red-500">*</span>
                </label>
                <select
                  value={discipline}
                  onChange={(e) => {
                    setDiscipline(e.target.value);
                    // Auto-update name prefix if name exists and follows pattern
                    if (name && /^[A-Z]{2,3}-\d{3}/.test(name)) {
                      const newCode = e.target.value || 'ARC';
                      const nameParts = name.split('_');
                      if (nameParts.length > 0) {
                        nameParts[0] = `${newCode}-101`;
                        setName(nameParts.join('_'));
                      }
                    }
                    // Clear discipline error
                    setErrors(prev => prev.filter(err => err.field !== 'discipline'));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white ${getFieldError('discipline') ? 'border-red-300' : 'border-slate-200'}`}
                >
                  <option value="">Select...</option>
                  {DISCIPLINES.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
                {getFieldError('discipline') && (
                  <p className="text-xs text-red-600 mt-1">{getFieldError('discipline')}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Container Type
                </label>
                <select
                  value={containerType}
                  onChange={(e) => setContainerType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white"
                >
                  {CONTAINER_TYPES.map(ct => (
                    <option key={ct.code} value={ct.code}>
                      {ct.code} - {ct.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document content..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition resize-none"
              />
            </div>
          </div>

          {/* ISO 19650 Advanced Metadata */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Info size={16} className="text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                ISO 19650 Advanced Fields
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Originator
                </label>
                <select
                  value={originator}
                  onChange={(e) => setOriginator(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition bg-white"
                >
                  {DISCIPLINES.map(d => (
                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Volume
                </label>
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-center focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Level
                </label>
                <input
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="L1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-center focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600 block mb-1.5">
                Classification (Uniclass 2015)
              </label>
              <input
                type="text"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                placeholder="SPr_20_30_10"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
              />
            </div>
          </div>

          {/* Workflow Status Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Initial Workflow Status: S0 (Work in Progress)
                </p>
                <p className="text-xs text-blue-700">
                  New documents are created in S0 status. Use the workflow transition feature to promote through S1 → S2 → S3 → S4.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-3">
              <Loader2 size={20} className="animate-spin text-red-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Uploading...</span>
                  <span className="text-xs font-mono text-slate-500">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Footer Actions */}
        {!isUploading && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-900/10 flex items-center space-x-2 transition-all active:scale-95"
            >
              <UploadCloud size={18} />
              <span>Upload Container</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
