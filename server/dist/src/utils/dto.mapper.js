"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOrganisationDto = toOrganisationDto;
exports.toOrganisationSummaryDto = toOrganisationSummaryDto;
exports.toUserDto = toUserDto;
exports.toUserSummaryDto = toUserSummaryDto;
exports.toInvitationDto = toInvitationDto;
exports.toInvitationListItemDto = toInvitationListItemDto;
function toOrganisationDto(doc) {
    return {
        id: doc._id.toString(),
        name: doc.name,
        organisationCode: doc.organisationCode,
        email: doc.email,
        status: doc.status,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}
function toOrganisationSummaryDto(doc) {
    return {
        id: doc._id.toString(),
        name: doc.name,
        organisationCode: doc.organisationCode,
        status: doc.status,
    };
}
function toUserDto(doc) {
    return {
        id: doc._id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        role: doc.role,
        organisationId: doc.organisationId.toString(),
        invitedBy: doc.invitedBy ? doc.invitedBy.toString() : null,
        status: doc.status,
        emailVerified: doc.emailVerified,
        lastLoginAt: doc.lastLoginAt ? doc.lastLoginAt.toISOString() : null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}
function toUserSummaryDto(doc) {
    return {
        id: doc._id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        role: doc.role,
        organisationId: doc.organisationId.toString(),
        status: doc.status,
    };
}
function toInvitationDto(doc) {
    return {
        id: doc._id.toString(),
        email: doc.email,
        firstName: doc.firstName,
        lastName: doc.lastName,
        role: doc.role,
        organisationId: doc.organisationId.toString(),
        invitedBy: doc.invitedBy.toString(),
        expiresAt: doc.expiresAt.toISOString(),
        status: doc.status,
        acceptedAt: doc.acceptedAt ? doc.acceptedAt.toISOString() : null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}
function toInvitationListItemDto(doc, inviterName) {
    return {
        id: doc._id.toString(),
        email: doc.email,
        firstName: doc.firstName,
        lastName: doc.lastName,
        role: doc.role,
        status: doc.status,
        expiresAt: doc.expiresAt.toISOString(),
        createdAt: doc.createdAt.toISOString(),
        inviterName,
    };
}
