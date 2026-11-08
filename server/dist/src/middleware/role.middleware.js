"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = requireRoles;
const app_error_1 = require("../utils/app-error");
function requireRoles(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(app_error_1.AppError.unauthorized('Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(app_error_1.AppError.forbidden(`Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`));
        }
        next();
    };
}
