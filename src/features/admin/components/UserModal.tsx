import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { adminService, UserCreateData } from '../api/adminService';
import { Role } from '../../../types';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: any; // Replace with proper type when available
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess, userToEdit }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<UserCreateData>({
        email: '',
        name: '',
        password: '', // Only for creation
        role: 'Viewer',
        organization: '',
        discipline: '',
        iso_role: '',
        job_title: ''
    });

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                email: userToEdit.email,
                name: userToEdit.name,
                role: userToEdit.role,
                organization: userToEdit.organization || '',
                discipline: userToEdit.discipline || '',
                iso_role: userToEdit.iso_role || '',
                job_title: userToEdit.job_title || ''
            });
        } else {
            setFormData({
                email: '',
                name: '',
                password: '',
                role: 'Viewer',
                organization: '',
                discipline: '',
                iso_role: '',
                job_title: ''
            });
        }
        setError(null);
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (userToEdit) {
                await adminService.updateUser(userToEdit.id, formData);
            } else {
                await adminService.createUser(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">
                        {userToEdit ? 'Edit User' : 'Create New User'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-700 text-sm">
                            <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Info */}
                        <div className="md:col-span-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Account Information</h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <input
                                required
                                type="email"
                                disabled={!!userToEdit}
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                                placeholder="john@company.com"
                            />
                        </div>

                        {!userToEdit && (
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Initial Password</label>
                                <input
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                            </div>
                        )}

                        {/* Role & Org */}
                        <div className="md:col-span-2 mt-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Role & Organization</h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">System Role</label>
                            <div className="relative">
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Role }))}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
                                >
                                    <option value="Viewer">Viewer</option>
                                    <option value="Project Manager">Project Manager</option>
                                    <option value="Team Lead">Team Lead</option>
                                    <option value="Discipline Lead">Discipline Lead</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Organization</label>
                            <input
                                type="text"
                                value={formData.organization}
                                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                placeholder="Company Name"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Discipline</label>
                            <select
                                value={formData.discipline}
                                onChange={(e) => setFormData(prev => ({ ...prev, discipline: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="">Select Discipline...</option>
                                <option value="Architecture">Architecture</option>
                                <option value="Structural">Structural</option>
                                <option value="MEP">MEP</option>
                                <option value="Civil">Civil</option>
                                <option value="Landscape">Landscape</option>
                                <option value="Project Management">Project Management</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Job Title</label>
                            <input
                                type="text"
                                value={formData.job_title}
                                onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                placeholder="Senior Architect"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    {userToEdit ? 'Update User' : 'Create User'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
