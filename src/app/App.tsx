
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/src/features/auth';
import { AppRoutes } from './routes';
import ErrorBoundary from '../components/ErrorBoundary';

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
};

export default App;
