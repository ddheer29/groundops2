"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organisationsController = exports.OrganisationsController = void 0;
const organisations_service_1 = require("./organisations.service");
const response_util_1 = require("../../utils/response.util");
const app_error_1 = require("../../utils/app-error");
class OrganisationsController {
    async getMyOrganisation(req, res, next) {
        try {
            if (!req.organisationId) {
                throw app_error_1.AppError.unauthorized('Organisation context missing');
            }
            const data = await organisations_service_1.organisationsService.getMyOrganisation(req.organisationId);
            (0, response_util_1.sendSuccess)(res, 'Organisation details retrieved successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async getStats(req, res, next) {
        try {
            if (!req.organisationId) {
                throw app_error_1.AppError.unauthorized('Organisation context missing');
            }
            const data = await organisations_service_1.organisationsService.getStats(req.organisationId);
            (0, response_util_1.sendSuccess)(res, 'Organisation statistics retrieved successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.OrganisationsController = OrganisationsController;
exports.organisationsController = new OrganisationsController();
