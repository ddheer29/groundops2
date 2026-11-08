import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/db';
import { env } from './config/env';
import { OrganisationModel } from './models/organisation.model';
import { UserModel } from './models/user.model';
import { hashPassword } from './utils/crypto.util';

async function ensureDefaultSeed() {
  try {
    let organisation = await OrganisationModel.findOne({ organisationCode: 'GRO-HQ' });
    if (!organisation) {
      organisation = await OrganisationModel.create({
        name: 'GroundOps Field Operations Inc.',
        organisationCode: 'GRO-HQ',
        email: 'ops@groundops.demo',
        status: 'ACTIVE',
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@groundops.demo';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    let adminUser = await UserModel.findOne({ email: adminEmail });
    if (!adminUser) {
      const passwordHash = await hashPassword(adminPassword);
      adminUser = await UserModel.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        organisationId: organisation._id,
        status: 'ACTIVE',
        emailVerified: true,
      });
    }

    const demoTechEmail = 'alex@groundops.demo';
    const demoTechPassword = 'Demo@1234';

    let demoTech = await UserModel.findOne({ email: demoTechEmail });
    if (!demoTech) {
      const techPasswordHash = await hashPassword(demoTechPassword);
      await UserModel.create({
        firstName: 'Alex',
        lastName: 'Rivera',
        email: demoTechEmail,
        passwordHash: techPasswordHash,
        role: 'TECHNICIAN',
        organisationId: organisation._id,
        invitedBy: adminUser._id,
        status: 'ACTIVE',
        emailVerified: true,
      });
    }

    const personalTechEmail = 'divyangdheer11@gmail.com';
    const personalTechPassword = 'Dheer@123';

    let personalTech = await UserModel.findOne({ email: personalTechEmail });
    if (!personalTech) {
      const personalHash = await hashPassword(personalTechPassword);
      await UserModel.create({
        firstName: 'Divyang',
        lastName: 'Dheer',
        email: personalTechEmail,
        passwordHash: personalHash,
        role: 'TECHNICIAN',
        organisationId: organisation._id,
        invitedBy: adminUser._id,
        status: 'ACTIVE',
        emailVerified: true,
      });
    }

    console.log('✅ Default Admin & Technician accounts auto-initialized');
  } catch (err) {
    console.error('[Seed] Warning: Auto-seed encountered an issue:', err);
  }
}

async function bootstrap() {
  try {
    await connectDatabase();
    await ensureDefaultSeed();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log('----------------------------------------------------');
      console.log(`🚀 GroundOps Server running in ${env.NODE_ENV} mode`);
      console.log(`📡 Listening on http://localhost:${env.PORT}`);
      console.log(`📚 Swagger Docs: http://localhost:${env.PORT}/api/docs`);
      console.log(`❤️  Health Check: http://localhost:${env.PORT}/api/health`);
      console.log('----------------------------------------------------');
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Gracefully terminating...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('[Server] Database disconnected. Exit complete.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Fatal startup failure:', error);
    process.exit(1);
  }
}

bootstrap();
