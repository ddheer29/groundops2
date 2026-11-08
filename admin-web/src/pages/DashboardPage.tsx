import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  OrganisationStats,
  InvitationListItem,
  API_ROUTES,
} from '@groundops/contracts';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { organisation, user } = useAuth();
  const [stats, setStats] = useState<OrganisationStats | null>(null);
  const [recentInvites, setRecentInvites] = useState<InvitationListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, invitesRes] = await Promise.all([
        apiClient.get(API_ROUTES.ORGANISATIONS.STATS),
        apiClient.get(API_ROUTES.INVITATIONS.ROOT),
      ]);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
      if (invitesRes.data?.data) {
        setRecentInvites(invitesRes.data.data.slice(0, 5));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Overview</h1>
          <p className="page-subtitle">
            Welcome back, {user?.firstName}. Managing workforce for{' '}
            <strong>{organisation?.name}</strong>.
          </p>
        </div>
        <Link to="/invite" className="btn btn-primary">
          + Invite New Technician
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-title">Total Headcount</span>
          <span className="stat-value">
            {loading ? '...' : stats?.totalTechnicians ?? 0}
          </span>
          <span className="stat-hint">Registered field technicians</span>
        </div>

        <div className="stat-card">
          <span className="stat-title">Active Technicians</span>
          <span className="stat-value" style={{ color: '#059669' }}>
            {loading ? '...' : stats?.activeTechnicians ?? 0}
          </span>
          <span className="stat-hint">Active accounts in field operations</span>
        </div>

        <div className="stat-card">
          <span className="stat-title">Pending Invitations</span>
          <span className="stat-value" style={{ color: '#d97706' }}>
            {loading ? '...' : stats?.pendingInvitations ?? 0}
          </span>
          <span className="stat-hint">Awaiting activation link completion</span>
        </div>
      </div>

      {/* Recent Invitations Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Invitations</h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Latest technician onboarding dispatches</p>
          </div>
          <Link to="/technicians" className="btn btn-secondary btn-sm">
            View All ({recentInvites.length})
          </Link>
        </div>

        {recentInvites.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
            <p>No invitations sent yet.</p>
            <Link to="/invite" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Send First Technician Invitation
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Work Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Invited On</th>
                </tr>
              </thead>
              <tbody>
                {recentInvites.map((invite) => (
                  <tr key={invite.id}>
                    <td>
                      <strong>
                        {invite.firstName} {invite.lastName}
                      </strong>
                    </td>
                    <td>{invite.email}</td>
                    <td>
                      <span className="badge badge-revoked">{invite.role}</span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${invite.status.toLowerCase()}`}
                      >
                        {invite.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
