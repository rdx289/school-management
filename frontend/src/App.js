// src/App.js
// Root application with routing, protected routes, and layout

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';

// Pages
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students  from './pages/Students';
import Teachers  from './pages/Teachers';
import Classes   from './pages/Classes';
import Attendance from './pages/Attendance';
import Exams     from './pages/Exams';
import Fees      from './pages/Fees';
import Notices   from './pages/Notices';
import Reports   from './pages/Reports';

// ─────────────────────────────────────────────────────
// Protected Route – redirects to /login if not authed
// ─────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ─────────────────────────────────────────────────────
// Authenticated Layout – wraps pages with Sidebar
// ─────────────────────────────────────────────────────
const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

// ─────────────────────────────────────────────────────
// App – Route definitions
// ─────────────────────────────────────────────────────
const App = () => {
  const { token } = useAuth();

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={token ? <Navigate to="/dashboard" replace /> : <Login />}
          />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />

          {/* Protected – Admin + Teacher + Student */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/students" element={
            <ProtectedRoute>
              <AppLayout><Students /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute>
              <AppLayout><Attendance /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/exams" element={
            <ProtectedRoute>
              <AppLayout><Exams /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/fees" element={
            <ProtectedRoute>
              <AppLayout><Fees /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/notices" element={
            <ProtectedRoute>
              <AppLayout><Notices /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Admin + Teacher only */}
          <Route path="/teachers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><Teachers /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/classes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><Classes /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><Reports /></AppLayout>
            </ProtectedRoute>
          } />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;
