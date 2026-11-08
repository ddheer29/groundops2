"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = exports.UsersController = void 0;
const users_service_1 = require("./users.service");
const response_util_1 = require("../../utils/response.util");
const app_error_1 = require("../../utils/app-error");
class UsersController {
    async getMe(req, res, next) {
        try {
            if (!req.userId) {
                throw app_error_1.AppError.unauthorized('User not authenticated');
            }
            const data = await users_service_1.usersService.getProfile(req.userId);
            (0, response_util_1.sendSuccess)(res, 'User profile retrieved successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async listTechnicians(req, res, next) {
        try {
            if (!req.organisationId) {
                throw app_error_1.AppError.unauthorized('Organisation context missing');
            }
            const data = await users_service_1.usersService.listTechnicians(req.organisationId);
            (0, response_util_1.sendSuccess)(res, 'Technicians retrieved successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UsersController = UsersController;
exports.usersController = new UsersController();
