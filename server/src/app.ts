import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerDocument } from './swagger/swagger.doc';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { organisationRoutes } from './modules/organisations/organisations.routes';
import { invitationRoutes } from './modules/invitations/invitations.routes';
import { errorHandler } from './middleware/error.middleware';
import { AppError } from './utils/app-error';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI to render smoothly in dev
    })
  );

  // Cross-Origin Resource Sharing
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    env.FRONTEND_URL,
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow mobile clients / curl / postman where origin is undefined
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Dev permissive for easy testing
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Swagger Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.json(swaggerDocument);
  });

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: 'groundops-server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/organisations', organisationRoutes);
  app.use('/api/v1/invitations', invitationRoutes);

  // 404 Handler
  app.use((_req: Request, _res: Response, next) => {
    next(AppError.notFound('Requested API endpoint does not exist'));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
