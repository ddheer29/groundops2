"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_util_1 = require("../utils/jwt.util");
const app_error_1 = require("../utils/app-error");
const user_model_1 = require("../models/user.model");
const organisation_model_1 = require("../models/organisation.model");
async function authenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw app_error_1.AppError.unauthorized('Authorization header with Bearer token is required');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw app_error_1.AppError.unauthorized('Access token is missing');
        }
        let payload;
        try {
            payload = (0, jwt_util_1.verifyAccessToken)(token);
        }
        catch (jwtErr) {
            if (jwtErr.name === 'TokenExpiredError') {
                throw new app_error_1.AppError(401, 'Access token has expired', 'TOKEN_EXPIRED');
            }
            throw new app_error_1.AppError(401, 'Invalid access token', 'INVALID_TOKEN');
        }
        const user = await user_model_1.UserModel.findById(payload.userId);
        if (!user) {
            throw app_error_1.AppError.unauthorized('User associated with token no longer exists');
        }
        if (user.status !== 'ACTIVE') {
            throw new app_error_1.AppError(403, `Your user account is ${user.status.toLowerCase()}. Please contact your company administrator.`, 'ACCOUNT_DISABLED');
        }
        const organisation = await organisation_model_1.OrganisationModel.findById(user.organisationId);
        if (!organisation) {
            throw app_error_1.AppError.unauthorized('Organisation associated with user was not found');
        }
        if (organisation.status !== 'ACTIVE') {
            throw new app_error_1.AppError(403, 'Organisation subscription is currently inactive', 'ORGANISATION_INACTIVE');
        }
        req.user = user;
        req.organisation = organisation;
        req.userId = user._id.toString();
        req.organisationId = organisation._id.toString();
        next();
    }
    catch (error) {
        next(error);
    }
}
