import request from 'supertest';
import { createApp } from '../src/app';
import { OrganisationModel } from '../src/models/organisation.model';
import { UserModel } from '../src/models/user.model';
import { InvitationModel } from '../src/models/invitation.model';
import { hashPassword } from '../src/utils/crypto.util';
import { emailService } from '../src/services/email/email.service';

const app = createApp();

describe('Invitation and Technician Onboarding Integration Tests', () => {
  let organisationId: string;
  let adminToken: string;
  let adminUserId: string;

  beforeEach(async () => {
    emailService.clearSentEmails();

    const org = await OrganisationModel.create({
      name: 'Apex Field Services',
      organisationCode: 'APEX-01',
      email: 'hq@apex.test',
      status: 'ACTIVE',
    });
    organisationId = org._id.toString();

    const passwordHash = await hashPassword('AdminPass123!');
    const admin = await UserModel.create({
      firstName: 'Chief',
      lastName: 'Admin',
      email: 'admin@apex.test',
      passwordHash,
      role: 'ADMIN',
      organisationId: org._id,
      status: 'ACTIVE',
      emailVerified: true,
    });
    adminUserId = admin._id.toString();

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@apex.test', password: 'AdminPass123!' });

    adminToken = loginRes.body.data.accessToken;
  });

  it('end-to-end: Admin invites technician -> Technician accepts & sets password -> Logs in', async () => {
    // 1. Admin invites a technician
    const inviteRes = await request(app)
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'marcus@apex.test',
        role: 'TECHNICIAN',
      });

    expect(inviteRes.status).toBe(201);
    expect(inviteRes.body.success).toBe(true);
    expect(inviteRes.body.data.email).toBe('marcus@apex.test');
    expect(inviteRes.body.data.status).toBe('PENDING');

    // 2. Email verification: email was sent with token
    const sentEmails = emailService.getSentEmails();
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].to).toBe('marcus@apex.test');
    const rawToken = sentEmails[0].token;
    expect(rawToken).toBeDefined();

    // 3. Technician verifies token in public verification endpoint
    const verifyRes = await request(app)
      .get(`/api/v1/invitations/verify/${rawToken}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.valid).toBe(true);
    expect(verifyRes.body.data.firstName).toBe('Marcus');
    expect(verifyRes.body.data.organisationName).toBe('Apex Field Services');

    // 4. Technician activates account and sets password
    const setPassRes = await request(app)
      .post('/api/v1/auth/set-password')
      .send({
        token: rawToken,
        password: 'SecureTechPass123!',
        confirmPassword: 'SecureTechPass123!',
      });

    expect(setPassRes.status).toBe(200);
    expect(setPassRes.body.success).toBe(true);
    expect(setPassRes.body.data.user.status).toBe('ACTIVE');
    expect(setPassRes.body.data.accessToken).toBeDefined();

    // 5. Technician can now log in using standard credentials
    const techLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'marcus@apex.test',
        password: 'SecureTechPass123!',
      });

    expect(techLoginRes.status).toBe(200);
    expect(techLoginRes.body.data.user.role).toBe('TECHNICIAN');
    expect(techLoginRes.body.data.user.status).toBe('ACTIVE');

    // 6. Token cannot be reused after acceptance
    const reusedRes = await request(app)
      .post('/api/v1/auth/set-password')
      .send({
        token: rawToken,
        password: 'AnotherPassword123!',
        confirmPassword: 'AnotherPassword123!',
      });

    expect(reusedRes.status).toBe(400);
  });

  it('gracefully refreshes unaccepted invitations and prevents re-inviting active members', async () => {
    await request(app)
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena@apex.test',
      });

    // Re-inviting while still PENDING succeeds and refreshes the invitation
    const duplicateRes = await request(app)
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena@apex.test',
      });

    expect(duplicateRes.status).toBe(201);
    expect(duplicateRes.body.success).toBe(true);
    expect(duplicateRes.body.data.email).toBe('elena@apex.test');

    // Once technician has activated their account, re-inviting is rejected with 409 CONFLICT
    const activeTechToken = emailService.getSentEmails()[1].token;
    await request(app)
      .post('/api/v1/auth/set-password')
      .send({
        token: activeTechToken,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    const conflictRes = await request(app)
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena@apex.test',
      });

    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.error.code).toBe('CONFLICT');
  });

  it('allows Admin to revoke and resend invitations', async () => {
    const inviteRes = await request(app)
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Lucas',
        lastName: 'Scott',
        email: 'lucas@apex.test',
      });

    const inviteId = inviteRes.body.data.id;
    const initialToken = emailService.getSentEmails()[0].token;

    // Resend
    const resendRes = await request(app)
      .post(`/api/v1/invitations/${inviteId}/resend`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resendRes.status).toBe(200);
    expect(emailService.getSentEmails().length).toBe(2);
    const newToken = emailService.getSentEmails()[1].token;
    expect(newToken).not.toBe(initialToken);

    // Old token is invalidated
    const verifyOld = await request(app).get(`/api/v1/invitations/verify/${initialToken}`);
    expect(verifyOld.status).toBe(404);

    // Revoke
    const revokeRes = await request(app)
      .post(`/api/v1/invitations/${inviteId}/revoke`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(revokeRes.status).toBe(200);
    expect(revokeRes.body.data.status).toBe('REVOKED');

    // Revoked token cannot be verified or used
    const verifyRevoked = await request(app).get(`/api/v1/invitations/verify/${newToken}`);
    expect(verifyRevoked.status).toBe(400);
  });

  it('returns organisation dashboard stats and technicians list', async () => {
    // Invite a technician who accepts
    const inviteRes = await request(app)
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Active',
        lastName: 'Tech',
        email: 'active.tech@apex.test',
      });

    const token = emailService.getSentEmails()[0].token;
    await request(app)
      .post('/api/v1/auth/set-password')
      .send({
        token,
        password: 'TechPassword123!',
        confirmPassword: 'TechPassword123!',
      });

    // Invite another technician (remains pending)
    await request(app)
      .post('/api/v1/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Pending',
        lastName: 'Tech',
        email: 'pending.tech@apex.test',
      });

    // Check stats
    const statsRes = await request(app)
      .get('/api/v1/organisations/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.totalTechnicians).toBe(2);
    expect(statsRes.body.data.activeTechnicians).toBe(1);
    expect(statsRes.body.data.pendingInvitations).toBe(1);

    // List technicians
    const techsRes = await request(app)
      .get('/api/v1/users/technicians')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(techsRes.status).toBe(200);
    expect(techsRes.body.data.length).toBe(2);

    // List invitations
    const invitesRes = await request(app)
      .get('/api/v1/invitations')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(invitesRes.status).toBe(200);
    expect(invitesRes.body.data.length).toBe(2);
  });
});
