import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  VerifyInvitationResponse,
  API_ROUTES,
} from '@groundops/contracts';
import { apiClient } from '../services/api';

const AcceptInvitationFormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password must not exceed 100 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  });

type AcceptInvitationFormValues = z.infer<typeof AcceptInvitationFormSchema>;

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState<boolean>(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<VerifyInvitationResponse | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activated, setActivated] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(AcceptInvitationFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  // Calculate password strength indicator
  const hasLength = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasLower = /[a-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);
  const strengthScore = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setVerifyError('Missing invitation token in URL. Please click the complete link from your invitation email.');
      return;
    }

    const verify = async () => {
      try {
        setVerifying(true);
        setVerifyError(null);
        const res = await apiClient.get(API_ROUTES.INVITATIONS.VERIFY(token));
        setInvitationData(res.data.data);
      } catch (err: any) {
        setVerifyError(
          err.response?.data?.message || 'The invitation link is invalid, expired, or has already been used.'
        );
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token]);

  const onSubmit = async (data: AcceptInvitationFormValues) => {
    try {
      setSubmitError(null);
      setSubmitting(true);
      await apiClient.post(API_ROUTES.AUTH.SET_PASSWORD, {
        token: token || '',
        password: data.password,
      });
      setActivated(true);
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || 'Failed to set password and activate account'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <span className="auth-logo">GROUNDOPS</span>
          <h1 className="auth-title">Technician Onboarding</h1>
          <p className="auth-subtitle">Activate your field operations account</p>
        </div>

        {verifying && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
            <p>Verifying your enterprise invitation token...</p>
          </div>
        )}

        {verifyError && !verifying && (
          <div>
            <div className="alert alert-danger" role="alert">
              <span>{verifyError}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>
              If your link expired or was revoked, please request a new invitation from your company administrator.
            </p>
          </div>
        )}

        {activated && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px auto',
              }}
            >
              ✓
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Account Activated!
            </h2>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '22px', marginBottom: '24px' }}>
              Your technician password has been set. You can now open the <strong>GroundOps Mobile App</strong> and sign in using your corporate email:
            </p>
            <div
              style={{
                background: '#f1f5f9',
                padding: '12px 16px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#0f172a',
                marginBottom: '24px',
              }}
            >
              {invitationData?.email}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Mobile App: <strong>GroundOps Field Operations</strong>
            </div>
          </div>
        )}

        {!verifying && !verifyError && !activated && invitationData && (
          <div>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '20px',
                fontSize: '13px',
              }}
            >
              <div>
                Technician: <strong>{invitationData.firstName}</strong>
              </div>
              <div>
                Organisation: <strong>{invitationData.organisationName}</strong>
              </div>
              <div>
                Email: <strong>{invitationData.email}</strong>
              </div>
            </div>

            {submitError && (
              <div className="alert alert-danger" role="alert">
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Create Password *
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password && (
                  <span className="form-error">{errors.password.message}</span>
                )}
              </div>

              {/* Password strength visualizer */}
              {passwordValue && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '6px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          borderRadius: '2px',
                          background:
                            strengthScore >= level
                              ? strengthScore <= 2
                                ? '#ef4444'
                                : strengthScore <= 4
                                ? '#f59e0b'
                                : '#10b981'
                              : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {strengthScore <= 2 && 'Weak password'}
                    {strengthScore > 2 && strengthScore <= 4 && 'Moderate strength'}
                    {strengthScore === 5 && 'Strong password'}
                  </span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <span className="form-error">{errors.confirmPassword.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '12px' }}
                disabled={submitting}
              >
                {submitting ? 'Activating Account...' : 'Set Password & Activate Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
