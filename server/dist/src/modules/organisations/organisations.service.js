"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organisationsService = exports.OrganisationsService = void 0;
const organisation_model_1 = require("../../models/organisation.model");
const user_model_1 = require("../../models/user.model");
const invitation_model_1 = require("../../models/invitation.model");
const app_error_1 = require("../../utils/app-error");
const dto_mapper_1 = require("../../utils/dto.mapper");
class OrganisationsService {
    async getMyOrganisation(organisationId) {
        const organisation = await organisation_model_1.OrganisationModel.findById(organisationId);
        if (!organisation) {
            throw app_error_1.AppError.notFound('Organisation not found');
        }
        return (0, dto_mapper_1.toOrganisationDto)(organisation);
    }
    async getStats(organisationId) {
        const organisation = await organisation_model_1.OrganisationModel.findById(organisationId);
        if (!organisation) {
            throw app_error_1.AppError.notFound('Organisation not found');
        }
        const [totalTechnicians, activeTechnicians, pendingInvitations] = await Promise.all([
            user_model_1.UserModel.countDocuments({
                organisationId,
                role: 'TECHNICIAN',
            }),
            user_model_1.UserModel.countDocuments({
                organisationId,
                role: 'TECHNICIAN',
                status: 'ACTIVE',
            }),
            invitation_model_1.InvitationModel.countDocuments({
                organisationId,
                status: 'PENDING',
                expiresAt: { $gt: new Date() },
            }),
        ]);
        return {
            organisation: (0, dto_mapper_1.toOrganisationSummaryDto)(organisation),
            totalTechnicians,
            activeTechnicians,
            pendingInvitations,
        };
    }
}
exports.OrganisationsService = OrganisationsService;
exports.organisationsService = new OrganisationsService();
