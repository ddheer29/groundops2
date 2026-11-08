"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const organisation_model_1 = require("./models/organisation.model");
const user_model_1 = require("./models/user.model");
const crypto_util_1 = require("./utils/crypto.util");
async function ensureDefaultSeed() {
    try {
        let organisation = await organisation_model_1.OrganisationModel.findOne({ organisationCode: 'GRO-HQ' });
        if (!organisation) {
            organisation = await organisation_model_1.OrganisationModel.create({
                name: 'GroundOps Field Operations Inc.',
                organisationCode: 'GRO-HQ',
                email: 'ops@groundops.demo',
                status: 'ACTIVE',
            });
        }
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@groundops.demo';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
        let adminUser = await user_model_1.UserModel.findOne({ email: adminEmail });
        if (!adminUser) {
            const passwordHash = await (0, crypto_util_1.hashPassword)(adminPassword);
            adminUser = await user_model_1.UserModel.create({
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
        let demoTech = await user_model_1.UserModel.findOne({ email: demoTechEmail });
        if (!demoTech) {
            const techPasswordHash = await (0, crypto_util_1.hashPassword)(demoTechPassword);
            await user_model_1.UserModel.create({
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
        let personalTech = await user_model_1.UserModel.findOne({ email: personalTechEmail });
        if (!personalTech) {
            const personalHash = await (0, crypto_util_1.hashPassword)(personalTechPassword);
            await user_model_1.UserModel.create({
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
    }
    catch (err) {
        console.error('[Seed] Warning: Auto-seed encountered an issue:', err);
    }
}
async function bootstrap() {
    try {
        await (0, db_1.connectDatabase)();
        await ensureDefaultSeed();
        const app = (0, app_1.createApp)();
        const server = app.listen(env_1.env.PORT, () => {
            console.log('----------------------------------------------------');
            console.log(`🚀 GroundOps Server running in ${env_1.env.NODE_ENV} mode`);
            console.log(`📡 Listening on http://localhost:${env_1.env.PORT}`);
            console.log(`📚 Swagger Docs: http://localhost:${env_1.env.PORT}/api/docs`);
            console.log(`❤️  Health Check: http://localhost:${env_1.env.PORT}/api/health`);
            console.log('----------------------------------------------------');
        });
        const shutdown = async (signal) => {
            console.log(`\n[Server] Received ${signal}. Gracefully terminating...`);
            server.close(async () => {
                await (0, db_1.disconnectDatabase)();
                console.log('[Server] Database disconnected. Exit complete.');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        console.error('[Server] Fatal startup failure:', error);
        process.exit(1);
    }
}
bootstrap();
