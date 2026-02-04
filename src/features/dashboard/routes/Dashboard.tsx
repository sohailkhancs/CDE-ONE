
import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Dashboard redirects to ProjectHub
const DashboardView: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/projects');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">Redirecting to Projects...</p>
      </div>
    </div>
  );
};

export default DashboardView;
