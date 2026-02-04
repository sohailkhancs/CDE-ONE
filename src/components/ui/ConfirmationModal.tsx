import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle, Info, Archive, Trash2, Share2, FileText } from 'lucide-react';

export type ConfirmationType = 'default' | 'danger' | 'warning' | 'success' | 'info';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmationType;
    isLoading?: boolean;
    icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'default',
    isLoading = false,
    icon: customIcon,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, isLoading]);

    // Handle click outside modal
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    // Default icons based on type
    const getDefaultIcon = () => {
        if (customIcon) return customIcon;

        const iconClasses = "w-12 h-12";
        const iconWrapperClasses = "p-3 rounded-2xl";

        switch (type) {
            case 'danger':
                return (
                    <div className={`${iconWrapperClasses} bg-red-100`}>
                        <Trash2 className={`${iconClasses} text-red-600`} />
                    </div>
                );
            case 'warning':
                return (
                    <div className={`${iconWrapperClasses} bg-amber-100`}>
                        <AlertTriangle className={`${iconClasses} text-amber-600`} />
                    </div>
                );
            case 'success':
                return (
                    <div className={`${iconWrapperClasses} bg-green-100`}>
                        <CheckCircle className={`${iconClasses} text-green-600`} />
                    </div>
                );
            case 'info':
                return (
                    <div className={`${iconWrapperClasses} bg-blue-100`}>
                        <Info className={`${iconClasses} text-blue-600`} />
                    </div>
                );
            default:
                return (
                    <div className={`${iconWrapperClasses} bg-slate-100`}>
                        <FileText className={`${iconClasses} text-slate-600`} />
                    </div>
                );
        }
    };

    // Button styles based on type
    const getConfirmButtonClass = () => {
        const baseClass = "px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg flex items-center justify-center space-x-2";

        switch (type) {
            case 'danger':
                return `${baseClass} bg-red-600 hover:bg-red-700 text-white shadow-red-900/20 active:scale-95`;
            case 'warning':
                return `${baseClass} bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20 active:scale-95`;
            case 'success':
                return `${baseClass} bg-green-600 hover:bg-green-700 text-white shadow-green-900/20 active:scale-95`;
            case 'info':
                return `${baseClass} bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20 active:scale-95`;
            default:
                return `${baseClass} bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 active:scale-95`;
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 animate-slideUp ring-1 ring-black/5 overflow-hidden"
            >
                {/* Decorative header gradient */}
                <div className={`h-2 w-full bg-gradient-to-r ${type === 'danger' ? 'from-red-500 to-red-600' :
                        type === 'warning' ? 'from-amber-500 to-amber-600' :
                            type === 'success' ? 'from-green-500 to-green-600' :
                                type === 'info' ? 'from-blue-500 to-blue-600' :
                                    'from-slate-600 to-slate-800'
                    }`} />

                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <X size={20} />
                </button>

                {/* Modal Body */}
                <div className="p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        {getDefaultIcon()}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-slate-900 text-center mb-3">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-slate-600 text-center leading-relaxed mb-8">
                        {message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={getConfirmButtonClass()}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>{confirmText}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Subtle footer decoration */}
                <div className="px-8 pb-4">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
