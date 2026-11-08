export const API_PREFIX = '/api/v1';

export const API_ROUTES = {
  AUTH: {
    ROOT: `${API_PREFIX}/auth`,
    LOGIN: `${API_PREFIX}/auth/login`,
    SET_PASSWORD: `${API_PREFIX}/auth/set-password`,
    REFRESH_TOKEN: `${API_PREFIX}/auth/refresh-token`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
  },
  USERS: {
    ROOT: `${API_PREFIX}/users`,
    ME: `${API_PREFIX}/users/me`,
    TECHNICIANS: `${API_PREFIX}/users/technicians`,
  },
  ORGANISATIONS: {
    ROOT: `${API_PREFIX}/organisations`,
    MY: `${API_PREFIX}/organisations/my`,
    STATS: `${API_PREFIX}/organisations/stats`,
  },
  INVITATIONS: {
    ROOT: `${API_PREFIX}/invitations`,
    CREATE: `${API_PREFIX}/invitations`,
    VERIFY: (token: string) => `${API_PREFIX}/invitations/verify/${token}`,
    VERIFY_BASE: `${API_PREFIX}/invitations/verify`,
    RESEND: (id: string) => `${API_PREFIX}/invitations/${id}/resend`,
    REVOKE: (id: string) => `${API_PREFIX}/invitations/${id}/revoke`,
  },
} as const;
