export declare const API_PREFIX = "/api/v1";
export declare const API_ROUTES: {
    readonly AUTH: {
        readonly ROOT: "/api/v1/auth";
        readonly LOGIN: "/api/v1/auth/login";
        readonly SET_PASSWORD: "/api/v1/auth/set-password";
        readonly REFRESH_TOKEN: "/api/v1/auth/refresh-token";
        readonly LOGOUT: "/api/v1/auth/logout";
    };
    readonly USERS: {
        readonly ROOT: "/api/v1/users";
        readonly ME: "/api/v1/users/me";
        readonly TECHNICIANS: "/api/v1/users/technicians";
    };
    readonly ORGANISATIONS: {
        readonly ROOT: "/api/v1/organisations";
        readonly MY: "/api/v1/organisations/my";
        readonly STATS: "/api/v1/organisations/stats";
    };
    readonly INVITATIONS: {
        readonly ROOT: "/api/v1/invitations";
        readonly CREATE: "/api/v1/invitations";
        readonly VERIFY: (token: string) => string;
        readonly VERIFY_BASE: "/api/v1/invitations/verify";
        readonly RESEND: (id: string) => string;
        readonly REVOKE: (id: string) => string;
    };
};
//# sourceMappingURL=index.d.ts.map