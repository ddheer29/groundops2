"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load environment variables from .env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(5001),
    MONGODB_URI: zod_1.z
        .string()
        .default('mongodb://127.0.0.1:27017/groundops'),
    JWT_ACCESS_SECRET: zod_1.z.string().default('groundops_super_secret_access_jwt_key_2026!'),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_SECRET: zod_1.z.string().default('groundops_super_secret_refresh_jwt_key_2026!'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    INVITATION_TOKEN_EXPIRES_HOURS: zod_1.z.coerce.number().default(48),
    // Email / SMTP
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().optional().default(587),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASSWORD: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().default('GroundOps <no-reply@groundops.internal>'),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:3000'),
    // Initial Admin Seed Defaults
    INITIAL_ORG_NAME: zod_1.z.string().default('GroundOps Facilities Pvt Ltd'),
    INITIAL_ORG_CODE: zod_1.z.string().default('GRO001'),
    INITIAL_ORG_EMAIL: zod_1.z.string().default('admin@groundops.internal'),
    INITIAL_ADMIN_NAME: zod_1.z.string().default('System Administrator'),
    INITIAL_ADMIN_EMAIL: zod_1.z.string().default('admin@groundops.internal'),
    INITIAL_ADMIN_PASSWORD: zod_1.z.string().default('Admin@12345'),
});
exports.env = EnvSchema.parse(process.env);
