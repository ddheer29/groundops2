import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSummary, OrganisationSummary, LoginRequest, API_ROUTES } from '@groundops/contracts';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: UserSummary | null;
  organisation: OrganisationSummary | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(() => {
    const saved = localStorage.getItem('groundops_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [organisation, setOrganisation] = useState<OrganisationSummary | null>(() => {
    const saved = localStorage.getItem('groundops_organisation');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  const reloadUser = async () => {
    const token = localStorage.getItem('groundops_access_token');
    if (!token) {
      setUser(null);
      setOrganisation(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get(API_ROUTES.USERS.ME);
      if (res.data?.success && res.data?.data) {
        const { user: userProfile, organisation: orgSummary } = res.data.data;
        const summary: UserSummary = {
          id: userProfile.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          role: userProfile.role,
          organisationId: userProfile.organisationId,
          status: userProfile.status,
        };
        setUser(summary);
        setOrganisation(orgSummary);
        localStorage.setItem('groundops_user', JSON.stringify(summary));
        localStorage.setItem('groundops_organisation', JSON.stringify(orgSummary));
      }
    } catch {
      localStorage.removeItem('groundops_access_token');
      localStorage.removeItem('groundops_refresh_token');
      localStorage.removeItem('groundops_user');
      localStorage.removeItem('groundops_organisation');
      setUser(null);
      setOrganisation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadUser();
  }, []);

  const login = async (data: LoginRequest) => {
    const res = await apiClient.post(API_ROUTES.AUTH.LOGIN, data);
    const { accessToken, refreshToken, user: loggedInUser, organisation: loggedInOrg } =
      res.data.data;

    localStorage.setItem('groundops_access_token', accessToken);
    localStorage.setItem('groundops_refresh_token', refreshToken);
    localStorage.setItem('groundops_user', JSON.stringify(loggedInUser));
    localStorage.setItem('groundops_organisation', JSON.stringify(loggedInOrg));

    setUser(loggedInUser);
    setOrganisation(loggedInOrg);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('groundops_refresh_token');
      if (refreshToken) {
        await apiClient.post(API_ROUTES.AUTH.LOGOUT, { refreshToken });
      }
    } catch {
      // Continue cleanup on failure
    } finally {
      localStorage.removeItem('groundops_access_token');
      localStorage.removeItem('groundops_refresh_token');
      localStorage.removeItem('groundops_user');
      localStorage.removeItem('groundops_organisation');
      setUser(null);
      setOrganisation(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organisation,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
