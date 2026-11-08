"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_util_1 = require("../../utils/response.util");
class AuthController {
    async login(req, res, next) {
        try {
            const data = await auth_service_1.authService.login(req.body);
            (0, response_util_1.sendSuccess)(res, 'Login successful', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async setPassword(req, res, next) {
        try {
            const data = await auth_service_1.authService.setPassword(req.body);
            (0, response_util_1.sendSuccess)(res, 'Password set and account activated successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const data = await auth_service_1.authService.refreshToken(req.body);
            (0, response_util_1.sendSuccess)(res, 'Token refreshed successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async logout(req, res, next) {
        try {
            await auth_service_1.authService.logout(req.body?.refreshToken);
            (0, response_util_1.sendSuccess)(res, 'Logged out successfully', null, 200);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
