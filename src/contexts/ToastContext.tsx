
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);

    const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
    const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);
    const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);
    const warning = useCallback((msg: string) => addToast(msg, 'warning'), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
            {children}
            {/* Toast Container - Professional positioning with safe area consideration */}
            <div className="fixed bottom-0 right-0 z-[100] p-4 sm:p-6 flex flex-col items-end space-y-3 pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-center w-full max-w-md overflow-hidden
                            bg-white rounded-xl shadow-2xl ring-1 ring-black/5 border border-slate-100
                            transform transition-all duration-300 ease-out
                            hover:shadow-xl hover:scale-[1.02]
                            animate-slideIn relative
                        `}
                        role="alert"
                        aria-live="polite"
                    >
                        {/* Colored left border accent */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            toast.type === 'success' ? 'bg-green-500' :
                            toast.type === 'error' ? 'bg-red-500' :
                            toast.type === 'info' ? 'bg-blue-500' : 'bg-amber-500'
                        }`} />

                        <div className="p-4 flex items-start w-full">
                            {/* Icon */}
                            <div className={`flex-shrink-0 p-1 rounded-lg ${
                                toast.type === 'success' ? 'bg-green-50' :
                                toast.type === 'error' ? 'bg-red-50' :
                                toast.type === 'info' ? 'bg-blue-50' : 'bg-amber-50'
                            }`}>
                                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                            </div>

                            {/* Message */}
                            <div className="ml-3 flex-1 min-w-0 pt-0.5">
                                <p className="text-sm font-semibold text-slate-900 break-words">
                                    {toast.message}
                                </p>
                            </div>

                            {/* Close Button */}
                            <div className="ml-4 flex-shrink-0">
                                <button
                                    className="inline-flex items-center justify-center p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    onClick={() => removeToast(toast.id)}
                                    aria-label="Close notification"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                            <div
                                className={`h-full animate-toastProgress ${
                                    toast.type === 'success' ? 'bg-green-500' :
                                    toast.type === 'error' ? 'bg-red-500' :
                                    toast.type === 'info' ? 'bg-blue-500' : 'bg-amber-500'
                                }`}
                                style={{ animationDuration: '5s' }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
