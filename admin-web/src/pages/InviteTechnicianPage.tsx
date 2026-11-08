import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateInvitationRequest,
  CreateInvitationRequestSchema,
  API_ROUTES,
} from '@groundops/contracts';
import { apiClient } from '../services/api';

export const InviteTechnicianPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    id: string;
    name: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInvitationRequest>({
    resolver: zodResolver(CreateInvitationRequestSchema as any),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'TECHNICIAN',
    },
  });

  const onSubmit = async (data: CreateInvitationRequest) => {
    try {
      setServerError(null);
      setSubmitting(true);
      const res = await apiClient.post(API_ROUTES.INVITATIONS.CREATE, data);
      const created = res.data.data;
      setSuccessInfo({
        email: data.email,
        id: created.id,
        name: `${data.firstName} ${data.lastName}`,
      });
      reset();
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to dispatch technician invitation'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invite New Technician</h1>
          <p className="page-subtitle">
            Dispatches a single-use, cryptographically secure 72-hour invitation email.
          </p>
        </div>
        <Link to="/technicians" className="btn btn-secondary">
          Cancel
        </Link>
      </div>

      {serverError && (
        <div className="alert alert-danger" role="alert">
          <span>{serverError}</span>
        </div>
      )}

      {successInfo && (
        <div className="alert alert-success" style={{ display: 'block' }}>
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>
            🎉 Invitation Dispatched Successfully!
          </div>
          <p style={{ margin: 0, fontSize: '13px' }}>
            An invitation has been sent to <strong>{successInfo.email}</strong> for technician{' '}
            <strong>{successInfo.name}</strong>.
          </p>
          <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSuccessInfo(null)}
              className="btn btn-secondary btn-sm"
            >
              Invite Another Technician
            </button>
            <button
              onClick={() => navigate('/technicians')}
              className="btn btn-primary btn-sm"
            >
              Go to Technicians List
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                className="form-input"
                placeholder="e.g. Marcus"
                {...register('firstName')}
              />
              {errors.firstName && (
                <span className="form-error">{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                className="form-input"
                placeholder="e.g. Vance"
                {...register('lastName')}
              />
              {errors.lastName && (
                <span className="form-error">{errors.lastName.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Technician Corporate / Work Email *
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. m.vance@company.com"
              {...register('email')}
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              The technician will receive their setup link at this address.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Application Role
            </label>
            <select id="role" className="form-select" {...register('role')}>
              <option value="TECHNICIAN">TECHNICIAN – Field Operations & Maintenance</option>
              <option value="MANAGER">MANAGER – Team Lead & Dispatcher</option>
              <option value="ADMIN">ADMIN – System Administrator</option>
            </select>
            {errors.role && (
              <span className="form-error">{errors.role.message}</span>
            )}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link to="/technicians" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Dispatching Invitation...' : 'Send Invitation Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
