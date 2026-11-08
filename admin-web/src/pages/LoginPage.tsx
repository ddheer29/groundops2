import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequest, LoginRequestSchema } from '@groundops/contracts';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema as any),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginRequest) => {
    try {
      setErrorMessage(null);
      setSubmitting(true);
      await login(data);
      navigate('/');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setValue('email', 'admin@groundops.demo');
    setValue('password', 'Admin@123456');
    setErrorMessage(null);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">GROUNDOPS</span>
          <h1 className="auth-title">Admin Portal</h1>
          <p className="auth-subtitle">
            Enterprise Field Operations & Maintenance Management
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Work Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. admin@yourcompany.com"
              autoComplete="username"
              {...register('email')}
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign in to Admin Portal'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
            Quick fill for development & testing:
          </p>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="btn btn-secondary btn-sm"
          >
            Use Seed Admin (admin@groundops.demo)
          </button>
        </div>
      </div>
    </div>
  );
};
