import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { AppError } from '../utils/app-error';
import { UserModel, IUserDocument } from '../models/user.model';
import { OrganisationModel, IOrganisationDocument } from '../models/organisation.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      organisation?: IOrganisationDocument;
      userId?: string;
      organisationId?: string;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authorization header with Bearer token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Access token is missing');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (jwtErr: any) {
      if (jwtErr.name === 'TokenExpiredError') {
        throw new AppError(401, 'Access token has expired', 'TOKEN_EXPIRED');
      }
      throw new AppError(401, 'Invalid access token', 'INVALID_TOKEN');
    }

    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw AppError.unauthorized('User associated with token no longer exists');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(
        403,
        `Your user account is ${user.status.toLowerCase()}. Please contact your company administrator.`,
        'ACCOUNT_DISABLED'
      );
    }

    const organisation = await OrganisationModel.findById(user.organisationId);
    if (!organisation) {
      throw AppError.unauthorized('Organisation associated with user was not found');
    }

    if (organisation.status !== 'ACTIVE') {
      throw new AppError(
        403,
        'Organisation subscription is currently inactive',
        'ORGANISATION_INACTIVE'
      );
    }

    req.user = user;
    req.organisation = organisation;
    req.userId = user._id.toString();
    req.organisationId = organisation._id.toString();

    next();
  } catch (error) {
    next(error);
  }
}
