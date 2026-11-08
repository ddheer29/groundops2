"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const swagger_doc_1 = require("./swagger/swagger.doc");
const auth_routes_1 = require("./modules/auth/auth.routes");
const users_routes_1 = require("./modules/users/users.routes");
const organisations_routes_1 = require("./modules/organisations/organisations.routes");
const invitations_routes_1 = require("./modules/invitations/invitations.routes");
const error_middleware_1 = require("./middleware/error.middleware");
const app_error_1 = require("./utils/app-error");
function createApp() {
    const app = (0, express_1.default)();
    // Security headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false, // Allows Swagger UI to render smoothly in dev
    }));
    // Cross-Origin Resource Sharing
    const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        env_1.env.FRONTEND_URL,
    ];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow mobile clients / curl / postman where origin is undefined
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(null, true); // Dev permissive for easy testing
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    // Body parsing
    app.use(express_1.default.json({ limit: '5mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '5mb' }));
    // Swagger Documentation
    app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_doc_1.swaggerDocument));
    app.get('/api/docs.json', (_req, res) => {
        res.json(swagger_doc_1.swaggerDocument);
    });
    // Health check
    app.get('/api/health', (_req, res) => {
        res.status(200).json({
            status: 'UP',
            service: 'groundops-server',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        });
    });
    // API v1 Routes
    app.use('/api/v1/auth', auth_routes_1.authRoutes);
    app.use('/api/v1/users', users_routes_1.usersRoutes);
    app.use('/api/v1/organisations', organisations_routes_1.organisationRoutes);
    app.use('/api/v1/invitations', invitations_routes_1.invitationRoutes);
    // 404 Handler
    app.use((_req, _res, next) => {
        next(app_error_1.AppError.notFound('Requested API endpoint does not exist'));
    });
    // Global Error Handler
    app.use(error_middleware_1.errorHandler);
    return app;
}
