import {
  Organisation,
  OrganisationSummary,
  User,
  UserSummary,
  Invitation,
  InvitationListItem,
} from '@groundops/contracts';
import { IOrganisationDocument } from '../models/organisation.model';
import { IUserDocument } from '../models/user.model';
import { IInvitationDocument } from '../models/invitation.model';

export function toOrganisationDto(doc: IOrganisationDocument): Organisation {
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

export function toOrganisationSummaryDto(doc: IOrganisationDocument): OrganisationSummary {
  return {
    id: doc._id.toString(),
    name: doc.name,
    organisationCode: doc.organisationCode,
    status: doc.status,
  };
}

export function toUserDto(doc: IUserDocument): User {
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

export function toUserSummaryDto(doc: IUserDocument): UserSummary {
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

export function toInvitationDto(doc: IInvitationDocument): Invitation {
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

export function toInvitationListItemDto(
  doc: IInvitationDocument,
  inviterName?: string
): InvitationListItem {
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
