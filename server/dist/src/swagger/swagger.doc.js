"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocument = void 0;
exports.swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'GroundOps Enterprise Field Operations API',
        version: '1.0.0',
        description: 'Backend REST API for GroundOps internal field operations and maintenance management platform. Strictly enforces organisation multi-tenancy, admin invitations, and technician onboarding.',
        contact: {
            name: 'GroundOps Engineering Team',
        },
    },
    servers: [
        {
            url: 'http://localhost:5001',
            description: 'Local Development Server',
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Provide your JWT access token. Example: Bearer eyJhbGciOi...',
            },
        },
        schemas: {
            UserRole: {
                type: 'string',
                enum: ['ADMIN', 'MANAGER', 'TECHNICIAN'],
            },
            UserStatus: {
                type: 'string',
                enum: ['INVITED', 'ACTIVE', 'DISABLED'],
            },
            OrganisationStatus: {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE'],
            },
            InvitationStatus: {
                type: 'string',
                enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'],
            },
            OrganisationSummary: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    organisationCode: { type: 'string' },
                    status: { $ref: '#/components/schemas/OrganisationStatus' },
                },
            },
            Organisation: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    organisationCode: { type: 'string' },
                    email: { type: 'string' },
                    status: { $ref: '#/components/schemas/OrganisationStatus' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            UserSummary: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { $ref: '#/components/schemas/UserRole' },
                    organisationId: { type: 'string' },
                    status: { $ref: '#/components/schemas/UserStatus' },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { $ref: '#/components/schemas/UserRole' },
                    organisationId: { type: 'string' },
                    invitedBy: { type: 'string', nullable: true },
                    status: { $ref: '#/components/schemas/UserStatus' },
                    emailVerified: { type: 'boolean' },
                    lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Invitation: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { $ref: '#/components/schemas/UserRole' },
                    organisationId: { type: 'string' },
                    invitedBy: { type: 'string' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    status: { $ref: '#/components/schemas/InvitationStatus' },
                    acceptedAt: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            InvitationListItem: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { $ref: '#/components/schemas/UserRole' },
                    status: { $ref: '#/components/schemas/InvitationStatus' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' },
                    inviterName: { type: 'string' },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                },
            },
            LoginResponseData: {
                type: 'object',
                properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                    organisation: { $ref: '#/components/schemas/Organisation' },
                },
            },
            SetPasswordRequest: {
                type: 'object',
                required: ['token', 'password', 'confirmPassword'],
                properties: {
                    token: { type: 'string' },
                    password: { type: 'string', minLength: 8 },
                    confirmPassword: { type: 'string', minLength: 8 },
                },
            },
            ApiSuccessResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { type: 'object' },
                },
            },
            ApiErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' },
                    error: {
                        type: 'object',
                        properties: {
                            code: { type: 'string' },
                            details: {},
                        },
                    },
                },
            },
        },
    },
    paths: {
        '/api/v1/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Authenticate employee or administrator',
                description: 'Login with work email and password to receive JWT access and refresh tokens.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Authentication successful',
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/ApiSuccessResponse' },
                                        {
                                            properties: {
                                                data: { $ref: '#/components/schemas/LoginResponseData' },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    401: { description: 'Invalid credentials or inactive account' },
                },
            },
        },
        '/api/v1/auth/set-password': {
            post: {
                tags: ['Auth'],
                summary: 'Set password and activate technician account via invitation token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SetPasswordRequest' },
                        },
                    },
                },
                responses: {
                    200: { description: 'Account activated and initial session established' },
                    400: { description: 'Invalid, revoked or expired invitation token' },
                },
            },
        },
        '/api/v1/auth/refresh-token': {
            post: {
                tags: ['Auth'],
                summary: 'Rotate refresh token and obtain new access token',
                responses: {
                    200: { description: 'New token pair issued' },
                    401: { description: 'Invalid or revoked refresh token' },
                },
            },
        },
        '/api/v1/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Invalidate refresh token and end session',
                responses: {
                    200: { description: 'Session revoked successfully' },
                },
            },
        },
        '/api/v1/users/me': {
            get: {
                tags: ['Users'],
                summary: 'Get current user profile and organisation summary',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'User profile retrieved' },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        '/api/v1/users/technicians': {
            get: {
                tags: ['Users'],
                summary: 'List all technicians in current organisation (Admin / Manager only)',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'List of technicians' },
                    403: { description: 'Forbidden' },
                },
            },
        },
        '/api/v1/organisations/my': {
            get: {
                tags: ['Organisations'],
                summary: 'Get current organisation details',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'Organisation record' },
                },
            },
        },
        '/api/v1/organisations/stats': {
            get: {
                tags: ['Organisations'],
                summary: 'Get organisation dashboard metrics and headcount counts',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'Stats payload' },
                },
            },
        },
        '/api/v1/invitations': {
            get: {
                tags: ['Invitations'],
                summary: 'List all employee invitations in organisation',
                security: [{ BearerAuth: [] }],
                responses: {
                    200: { description: 'Invitations list' },
                },
            },
            post: {
                tags: ['Invitations'],
                summary: 'Invite a technician via email (Admin only)',
                security: [{ BearerAuth: [] }],
                responses: {
                    201: { description: 'Invitation created and dispatched' },
                    409: { description: 'Invitation or active user already exists' },
                },
            },
        },
        '/api/v1/invitations/verify/{token}': {
            get: {
                tags: ['Invitations'],
                summary: 'Verify validity of an invitation token (Public)',
                parameters: [
                    {
                        name: 'token',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: { description: 'Token is valid' },
                    400: { description: 'Token expired or revoked' },
                    404: { description: 'Token not found' },
                },
            },
        },
        '/api/v1/invitations/{id}/resend': {
            post: {
                tags: ['Invitations'],
                summary: 'Resend an invitation email with a fresh 72-hour token',
                security: [{ BearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: { description: 'Invitation resent' },
                },
            },
        },
        '/api/v1/invitations/{id}/revoke': {
            post: {
                tags: ['Invitations'],
                summary: 'Revoke a pending technician invitation',
                security: [{ BearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: { description: 'Invitation revoked' },
                },
            },
        },
    },
};
