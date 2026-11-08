import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  InvitationListItem,
  API_ROUTES,
} from '@groundops/contracts';
import { apiClient } from '../services/api';

export const TechniciansPage: React.FC = () => {
  const [tab, setTab] = useState<'invitations' | 'technicians'>('invitations');
  const [invitations, setInvitations] = useState<InvitationListItem[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invitesRes, techsRes] = await Promise.all([
        apiClient.get(API_ROUTES.INVITATIONS.ROOT),
        apiClient.get(API_ROUTES.USERS.TECHNICIANS),
      ]);
      setInvitations(invitesRes.data?.data || []);
      setTechnicians(techsRes.data?.data || []);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load technician workforce data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResend = async (id: string, name: string) => {
    try {
      setActionLoadingId(id);
      setActionMessage(null);
      await apiClient.post(API_ROUTES.INVITATIONS.RESEND(id));
      setActionMessage({
        type: 'success',
        text: `Invitation successfully resent to ${name}. A new 72-hour link has been dispatched.`,
      });
      fetchData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to resend invitation',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to revoke the invitation for ${name}?`)) {
      return;
    }

    try {
      setActionLoadingId(id);
      setActionMessage(null);
      await apiClient.post(API_ROUTES.INVITATIONS.REVOKE(id));
      setActionMessage({
        type: 'success',
        text: `Invitation for ${name} has been revoked.`,
      });
      fetchData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to revoke invitation',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Technician Management</h1>
          <p className="page-subtitle">
            Manage invitations, technician accounts, and field operational access.
          </p>
        </div>
        <Link to="/invite" className="btn btn-primary">
          + Invite Technician
        </Link>
      </div>

      {actionMessage && (
        <div
          className={`alert ${
            actionMessage.type === 'success' ? 'alert-success' : 'alert-danger'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="btn btn-secondary btn-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          className={`btn ${tab === 'invitations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('invitations')}
        >
          Invitations ({invitations.length})
        </button>
        <button
          className={`btn ${tab === 'technicians' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('technicians')}
        >
          Technician Accounts ({technicians.length})
        </button>
      </div>

      {/* Invitations Table */}
      {tab === 'invitations' && (
        <div className="card">
          {invitations.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
              <p>No technician invitations have been dispatched yet.</p>
              <Link to="/invite" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Invite a Technician
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Technician</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Sent On</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => {
                    const isPending = inv.status === 'PENDING';
                    const isActing = actionLoadingId === inv.id;

                    return (
                      <tr key={inv.id}>
                        <td>
                          <strong>
                            {inv.firstName} {inv.lastName}
                          </strong>
                          {inv.inviterName && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Invited by {inv.inviterName}
                            </div>
                          )}
                        </td>
                        <td>{inv.email}</td>
                        <td>
                          <span className="badge badge-revoked">{inv.role}</span>
                        </td>
                        <td>
                          <span className={`badge badge-${inv.status.toLowerCase()}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ color: '#64748b' }}>
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ color: '#64748b' }}>
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {inv.status !== 'ACCEPTED' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled={isActing}
                                onClick={() =>
                                  handleResend(inv.id, `${inv.firstName} ${inv.lastName}`)
                                }
                                title="Resend invitation email with refreshed 72-hour token"
                              >
                                {isActing ? '...' : 'Resend'}
                              </button>
                            )}

                            {isPending && (
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={isActing}
                                onClick={() =>
                                  handleRevoke(inv.id, `${inv.firstName} ${inv.lastName}`)
                                }
                                title="Revoke access link immediately"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Technicians List Table */}
      {tab === 'technicians' && (
        <div className="card">
          {technicians.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
              <p>No active technician accounts found.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Technician Name</th>
                    <th>Work Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {technicians.map((tech) => (
                    <tr key={tech.id}>
                      <td>
                        <strong>
                          {tech.firstName} {tech.lastName}
                        </strong>
                      </td>
                      <td>{tech.email}</td>
                      <td>
                        <span className="badge badge-revoked">{tech.role}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${tech.status.toLowerCase()}`}>
                          {tech.status}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {tech.lastLoginAt
                          ? new Date(tech.lastLoginAt).toLocaleString()
                          : 'Never'}
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {new Date(tech.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
