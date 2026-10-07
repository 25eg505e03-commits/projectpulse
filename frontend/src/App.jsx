import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';
import { ProjectProvider } from './context/ProjectContext';

import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import OrgDetails from './pages/OrgDetails';
import Teams from './pages/Teams';
import Projects from './pages/Projects';
import KanbanPage from './pages/KanbanPage';
import BacklogPage from './pages/BacklogPage';
import MilestonesPage from './pages/MilestonesPage';
import IssuesPage from './pages/IssuesPage';
import TimelinePage from './pages/TimelinePage';
import WorkloadPage from './pages/WorkloadPage';
import ReportsPage from './pages/ReportsPage';
import ActivityPage from './pages/ActivityPage';
import InvitationsPage from './pages/InvitationsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <ProjectProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected App Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Organization & Team Routes */}
                  <Route path="/organizations" element={<Organizations />} />
                  <Route path="/organizations/:id" element={<OrgDetails />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/invitations" element={<InvitationsPage />} />

                  {/* Projects & Project-Scoped Routes */}
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:projectId/board" element={<KanbanPage />} />
                  <Route path="/projects/:projectId/backlog" element={<BacklogPage />} />
                  <Route path="/projects/:projectId/milestones" element={<MilestonesPage />} />
                  <Route path="/projects/:projectId/issues" element={<IssuesPage />} />
                  <Route path="/projects/:projectId/timeline" element={<TimelinePage />} />
                  <Route path="/projects/:projectId/workload" element={<WorkloadPage />} />
                  <Route path="/projects/:projectId/reports" element={<ReportsPage />} />
                  <Route path="/projects/:projectId/activity" element={<ActivityPage />} />

                  {/* Profile */}
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </ProjectProvider>
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default App;
