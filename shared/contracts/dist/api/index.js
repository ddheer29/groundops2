"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = exports.API_PREFIX = void 0;
exports.API_PREFIX = '/api/v1';
exports.API_ROUTES = {
    AUTH: {
        ROOT: `${exports.API_PREFIX}/auth`,
        LOGIN: `${exports.API_PREFIX}/auth/login`,
        SET_PASSWORD: `${exports.API_PREFIX}/auth/set-password`,
        REFRESH_TOKEN: `${exports.API_PREFIX}/auth/refresh-token`,
        LOGOUT: `${exports.API_PREFIX}/auth/logout`,
    },
    USERS: {
        ROOT: `${exports.API_PREFIX}/users`,
        ME: `${exports.API_PREFIX}/users/me`,
        TECHNICIANS: `${exports.API_PREFIX}/users/technicians`,
    },
    ORGANISATIONS: {
        ROOT: `${exports.API_PREFIX}/organisations`,
        MY: `${exports.API_PREFIX}/organisations/my`,
        STATS: `${exports.API_PREFIX}/organisations/stats`,
    },
    INVITATIONS: {
        ROOT: `${exports.API_PREFIX}/invitations`,
        CREATE: `${exports.API_PREFIX}/invitations`,
        VERIFY: (token) => `${exports.API_PREFIX}/invitations/verify/${token}`,
        VERIFY_BASE: `${exports.API_PREFIX}/invitations/verify`,
        RESEND: (id) => `${exports.API_PREFIX}/invitations/${id}/resend`,
        REVOKE: (id) => `${exports.API_PREFIX}/invitations/${id}/revoke`,
    },
};
//# sourceMappingURL=index.js.map