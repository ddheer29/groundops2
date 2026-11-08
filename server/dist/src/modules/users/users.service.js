"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = exports.UsersService = void 0;
const user_model_1 = require("../../models/user.model");
const organisation_model_1 = require("../../models/organisation.model");
const app_error_1 = require("../../utils/app-error");
const dto_mapper_1 = require("../../utils/dto.mapper");
class UsersService {
    async getProfile(userId) {
        const user = await user_model_1.UserModel.findById(userId);
        if (!user) {
            throw app_error_1.AppError.notFound('User not found');
        }
        const organisation = await organisation_model_1.OrganisationModel.findById(user.organisationId);
        if (!organisation) {
            throw app_error_1.AppError.notFound('Organisation not found');
        }
        return {
            user: (0, dto_mapper_1.toUserDto)(user),
            organisation: (0, dto_mapper_1.toOrganisationSummaryDto)(organisation),
        };
    }
    async listTechnicians(organisationId) {
        const technicians = await user_model_1.UserModel.find({
            organisationId,
            role: 'TECHNICIAN',
        }).sort({ createdAt: -1 });
        return technicians.map(dto_mapper_1.toUserDto);
    }
}
exports.UsersService = UsersService;
exports.usersService = new UsersService();
