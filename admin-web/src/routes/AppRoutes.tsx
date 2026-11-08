import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TechniciansPage } from '../pages/TechniciansPage';
import { InviteTechnicianPage } from '../pages/InviteTechnicianPage';
import { AcceptInvitationPage } from '../pages/AcceptInvitationPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

      {/* Protected routes wrapped in Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="technicians" element={<TechniciansPage />} />
        <Route path="invite" element={<InviteTechnicianPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
