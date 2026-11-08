"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const organisation_model_1 = require("../src/models/organisation.model");
const user_model_1 = require("../src/models/user.model");
const crypto_util_1 = require("../src/utils/crypto.util");
const app = (0, app_1.createApp)();
describe('Auth Module Integration Tests', () => {
    let organisationId;
    let adminUserId;
    beforeEach(async () => {
        // Seed test organisation
        const org = await organisation_model_1.OrganisationModel.create({
            name: 'Acme Facilities Corp',
            organisationCode: 'ACME-01',
            email: 'ops@acme.test',
            status: 'ACTIVE',
        });
        organisationId = org._id.toString();
        // Seed test admin
        const passwordHash = await (0, crypto_util_1.hashPassword)('AdminPass123!');
        const admin = await user_model_1.UserModel.create({
            firstName: 'Sarah',
            lastName: 'Connor',
            email: 'sarah@acme.test',
            passwordHash,
            role: 'ADMIN',
            organisationId: org._id,
            status: 'ACTIVE',
            emailVerified: true,
        });
        adminUserId = admin._id.toString();
    });
    describe('POST /api/v1/auth/login', () => {
        it('successfully logs in with valid credentials and returns tokens and entities', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'sarah@acme.test',
                password: 'AdminPass123!',
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
            expect(res.body.data.user.email).toBe('sarah@acme.test');
            expect(res.body.data.user.role).toBe('ADMIN');
            expect(res.body.data.organisation.name).toBe('Acme Facilities Corp');
            expect(res.body.data.organisation.organisationCode).toBe('ACME-01');
        });
        it('rejects invalid password with 401', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'sarah@acme.test',
                password: 'WrongPassword!',
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error.code).toBe('UNAUTHENTICATED');
        });
        it('rejects disabled account with 403', async () => {
            await user_model_1.UserModel.findByIdAndUpdate(adminUserId, { status: 'DISABLED' });
            const res = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'sarah@acme.test',
                password: 'AdminPass123!',
            });
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error.code).toBe('ACCOUNT_DISABLED');
        });
    });
    describe('Token Refresh and Revocation Rotation', () => {
        it('successfully rotates refresh tokens', async () => {
            const loginRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'sarah@acme.test',
                password: 'AdminPass123!',
            });
            const oldRefreshToken = loginRes.body.data.refreshToken;
            const refreshRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/refresh-token')
                .send({ refreshToken: oldRefreshToken });
            expect(refreshRes.status).toBe(200);
            expect(refreshRes.body.success).toBe(true);
            expect(refreshRes.body.data.accessToken).toBeDefined();
            expect(refreshRes.body.data.refreshToken).toBeDefined();
            expect(refreshRes.body.data.refreshToken).not.toBe(oldRefreshToken);
            // Attempting to reuse old refresh token should be rejected
            const reuseRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/refresh-token')
                .send({ refreshToken: oldRefreshToken });
            expect(reuseRes.status).toBe(401);
        });
    });
    describe('GET /api/v1/users/me', () => {
        it('returns current user profile and organisation summary when authenticated', async () => {
            const loginRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'sarah@acme.test',
                password: 'AdminPass123!',
            });
            const token = loginRes.body.data.accessToken;
            const meRes = await (0, supertest_1.default)(app)
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${token}`);
            expect(meRes.status).toBe(200);
            expect(meRes.body.success).toBe(true);
            expect(meRes.body.data.user.id).toBe(adminUserId);
            expect(meRes.body.data.user.email).toBe('sarah@acme.test');
            expect(meRes.body.data.organisation.id).toBe(organisationId);
        });
        it('rejects unauthenticated request with 401', async () => {
            const res = await (0, supertest_1.default)(app).get('/api/v1/users/me');
            expect(res.status).toBe(401);
        });
    });
});
