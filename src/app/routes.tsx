
import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import LoadingFallback from '../components/LoadingFallback';
import { useAuth } from '@/src/features/auth';

// Lazy load features
const Login = React.lazy(() => import('../features/auth/routes/Login'));
const ProjectHub = React.lazy(() => import('../features/projects/routes/ProjectHub'));
const ProjectDetail = React.lazy(() => import('../features/projects/routes/ProjectDetail'));
const ProjectOverview = React.lazy(() => import('../features/projects/routes/ProjectOverview'));
const Dashboard = React.lazy(() => import('../features/dashboard/routes/Dashboard'));
const Documents = React.lazy(() => import('../features/documents/routes/Documents'));
const Planner = React.lazy(() => import('../features/planner/routes/Planner'));
const Field = React.lazy(() => import('../features/field/routes/Field'));
const Inspections = React.lazy(() => import('../features/field/routes/Inspections'));
const BIM = React.lazy(() => import('../features/bim/routes/BIM'));
const AIAssistant = React.lazy(() => import('../features/ai/routes/AIAssistant'));
const Team = React.lazy(() => import('../features/team/routes/Team'));
const DailyReports = React.lazy(() => import('../features/reports/routes/DailyReports'));
const Settings = React.lazy(() => import('../features/settings/routes/Settings'));
// Admin features
const AdminDashboard = React.lazy(() => import('../features/admin/routes/AdminDashboard'));
const UserManagement = React.lazy(() => import('../features/admin/routes/UserManagement'));


const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout><Outlet /></MainLayout>;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectHub />} />
          <Route path="/project/:projectId" element={<ProjectDetail />}>
            <Route index element={<ProjectOverview />} />
            <Route path="documents" element={<Documents />} />
            <Route path="bim" element={<BIM />} />
            <Route path="planner" element={<Planner />} />
            <Route path="field" element={<Field />} />
            <Route path="inspections" element={<Inspections />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />

          {/* Legacy routes for backward compatibility */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/docs" element={<Documents />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/field" element={<Field />} />
          <Route path="/inspections" element={<Inspections />} />
          <Route path="/bim" element={<BIM />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/team" element={<Team />} />
          <Route path="/reports" element={<DailyReports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </Suspense >
  );
};
