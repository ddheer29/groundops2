import request from 'supertest';
import { createApp } from '../src/app';
import { OrganisationModel } from '../src/models/organisation.model';
import { UserModel } from '../src/models/user.model';
import { hashPassword } from '../src/utils/crypto.util';
import { emailService } from '../src/services/email/email.service';

const app = createApp();

describe('Auth Module & Technician Login Integration Tests', () => {
  let organisationId: string;
  let adminUserId: string;
  let adminToken: string;

  beforeEach(async () => {
    emailService.clearSentEmails();

    // Seed test organisation
    const org = await OrganisationModel.create({
      name: 'Acme Facilities Corp',
      organisationCode: 'ACME-01',
      email: 'ops@acme.test',
      status: 'ACTIVE',
    });
    organisationId = org._id.toString();

    // Seed test admin
    const passwordHash = await hashPassword('AdminPass123!');
    const admin = await UserModel.create({
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

    // Admin login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sarah@acme.test', password: 'AdminPass123!' });
    adminToken = loginRes.body.data.accessToken;
  });

  describe('Technician Login Scenarios (Section 8 Verification)', () => {
    let technicianEmail = 'divyangdheer11@gmail.com';
    let technicianPassword = 'Dheer@123';

    beforeEach(async () => {
      // Create technician through the official invitation workflow
      await request(app)
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Divyang',
          lastName: 'Dheer',
          email: technicianEmail,
          role: 'TECHNICIAN',
        });

      // Obtain token sent via email
      const sentEmails = emailService.getSentEmails();
      const token = sentEmails[sentEmails.length - 1].token;

      // Technician sets password and activates account
      await request(app)
        .post('/api/v1/auth/set-password')
        .send({
          token,
          password: technicianPassword,
          confirmPassword: technicianPassword,
        });
    });

    // Scenario 1: Valid technician email and password
    it('Scenario 1: allows activated technician to log in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: technicianEmail,
          password: technicianPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.role).toBe('TECHNICIAN');
      expect(res.body.data.user.status).toBe('ACTIVE');
    });

    // Scenario 2: Incorrect password
    it('Scenario 2: rejects incorrect password with 401 UNAUTHENTICATED', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: technicianEmail,
          password: 'IncorrectPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid work email or password');
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    // Scenario 3: Email that does not exist
    it('Scenario 3: rejects non-existent email with same 401 error to avoid user enumeration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent.tech@acme.test',
          password: technicianPassword,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid work email or password');
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    // Scenario 4: Account with INVITED status
    it('Scenario 4: blocks technician account with INVITED status (not yet activated)', async () => {
      // Invite a new technician who has NOT set password yet
      const unactivatedEmail = 'unactivated.tech@acme.test';
      await request(app)
        .post('/api/v1/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Dave',
          lastName: 'Bowman',
          email: unactivatedEmail,
          role: 'TECHNICIAN',
        });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: unactivatedEmail,
          password: 'AnyPassword123!',
        });

      expect(res.status).toBe(401); // Has no passwordHash yet
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    // Scenario 5: Account with DISABLED status
    it('Scenario 5: blocks technician account with DISABLED status', async () => {
      await UserModel.findOneAndUpdate(
        { email: technicianEmail },
        { status: 'DISABLED' }
      );

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: technicianEmail,
          password: technicianPassword,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACCOUNT_DISABLED');
    });

    // Scenario 6: User belonging to an inactive organisation
    it('Scenario 6: blocks login if user organisation is INACTIVE', async () => {
      await OrganisationModel.findByIdAndUpdate(organisationId, { status: 'INACTIVE' });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: technicianEmail,
          password: technicianPassword,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ORGANISATION_INACTIVE');
    });

    // Scenario 7: Missing email or password
    it('Scenario 7: rejects missing email or password with 422 VALIDATION_ERROR', async () => {
      const resNoPass = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: technicianEmail });

      expect(resNoPass.status).toBe(422);
      expect(resNoPass.body.error.code).toBe('VALIDATION_ERROR');

      const resNoEmail = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: technicianPassword });

      expect(resNoEmail.status).toBe(422);
      expect(resNoEmail.body.error.code).toBe('VALIDATION_ERROR');
    });

    // Scenario 8: Invalid email format
    it('Scenario 8: rejects invalid email format with 422 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email-format',
          password: technicianPassword,
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    // Scenario 9: Successful login returns the complete user profile
    it('Scenario 9: returns all required user profile fields on successful login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: technicianEmail,
          password: technicianPassword,
        });

      expect(res.status).toBe(200);
      const user = res.body.data.user;

      // Verify all specified fields
      expect(typeof user.id).toBe('string');
      expect(user.firstName).toBe('Divyang');
      expect(user.lastName).toBe('Dheer');
      expect(user.email).toBe(technicianEmail);
      expect(user.role).toBe('TECHNICIAN');
      expect(user.status).toBe('ACTIVE');
      expect(user.organisationId).toBe(organisationId);
      expect(user.invitedBy).toBe(adminUserId);
      expect(user.emailVerified).toBe(true);
      expect(typeof user.lastLoginAt).toBe('string');
      expect(typeof user.createdAt).toBe('string');
      expect(typeof user.updatedAt).toBe('string');
    });

    // Scenario 10: Successful login returns the correct organisation details
    it('Scenario 10: returns all required organisation fields on successful login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: technicianEmail,
          password: technicianPassword,
        });

      expect(res.status).toBe(200);
      const org = res.body.data.organisation;

      expect(org.id).toBe(organisationId);
      expect(org.name).toBe('Acme Facilities Corp');
      expect(org.organisationCode).toBe('ACME-01');
      expect(org.email).toBe('ops@acme.test');
      expect(org.status).toBe('ACTIVE');
      expect(typeof org.createdAt).toBe('string');
      expect(typeof org.updatedAt).toBe('string');
    });

    // Scenario 11: Sensitive fields are never included in the response
    it('Scenario 11: ensures sensitive fields (hashes, security tokens) are never exposed', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: technicianEmail,
          password: technicianPassword,
        });

      expect(res.status).toBe(200);
      const data = res.body.data;

      // User object check
      expect(data.user.passwordHash).toBeUndefined();
      expect(data.user.password).toBeUndefined();
      expect(data.user.__v).toBeUndefined();

      // Organisation object check
      expect(data.organisation.__v).toBeUndefined();

      // Top-level payload check
      expect(data.tokenHash).toBeUndefined();
      expect(data.replacedByTokenHash).toBeUndefined();
    });
  });

  describe('Token Refresh and Revocation Rotation', () => {
    it('successfully rotates refresh tokens', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'sarah@acme.test',
          password: 'AdminPass123!',
        });

      const oldRefreshToken = loginRes.body.data.refreshToken;

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: oldRefreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).not.toBe(oldRefreshToken);

      // Attempting to reuse old refresh token should be rejected
      const reuseRes = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: oldRefreshToken });

      expect(reuseRes.status).toBe(401);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('returns current user profile and organisation summary when authenticated', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'sarah@acme.test',
          password: 'AdminPass123!',
        });

      const token = loginRes.body.data.accessToken;

      const meRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.id).toBe(adminUserId);
      expect(meRes.body.data.user.email).toBe('sarah@acme.test');
      expect(meRes.body.data.organisation.id).toBe(organisationId);
    });

    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });
  });
});
