import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { OrganisationModel } from '../src/models/organisation.model';
import { UserModel } from '../src/models/user.model';
import { hashPassword } from '../src/utils/crypto.util';

async function seedAdmin() {
  console.log('🌱 Starting GroundOps database seeding...');
  try {
    await connectDatabase();

    // 1. Ensure Default Organisation exists
    let organisation = await OrganisationModel.findOne({ organisationCode: 'GRO-HQ' });
    if (!organisation) {
      organisation = await OrganisationModel.create({
        name: 'GroundOps Field Operations Inc.',
        organisationCode: 'GRO-HQ',
        email: 'ops@groundops.demo',
        status: 'ACTIVE',
      });
      console.log(`✅ Created Organisation: "${organisation.name}" (${organisation.organisationCode})`);
    } else {
      console.log(`ℹ️  Organisation already exists: "${organisation.name}" (${organisation.organisationCode})`);
    }

    // 2. Ensure Admin User exists
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
      console.log(`✅ Created System Admin: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
    }

    // 3. Ensure Demo Technician exists (matching mobile spec credentials for easy testing)
    const demoTechEmail = 'alex@groundops.demo';
    const demoTechPassword = 'Demo@1234';

    let demoTech = await UserModel.findOne({ email: demoTechEmail });
    if (!demoTech) {
      const techPasswordHash = await hashPassword(demoTechPassword);
      demoTech = await UserModel.create({
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
      console.log(`✅ Created Demo Technician: ${demoTechEmail} (password: ${demoTechPassword})`);
    } else {
      console.log(`ℹ️  Demo Technician already exists: ${demoTechEmail}`);
    }

    console.log('\n=============================================');
    console.log('🎉 Seeding successfully completed!');
    console.log('Admin Login:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('Technician Login:');
    console.log(`  Email:    ${demoTechEmail}`);
    console.log(`  Password: ${demoTechPassword}`);
    console.log('=============================================\n');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seedAdmin();
