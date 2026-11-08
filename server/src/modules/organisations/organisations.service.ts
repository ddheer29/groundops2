import { Organisation, OrganisationStats } from '@groundops/contracts';
import { OrganisationModel } from '../../models/organisation.model';
import { UserModel } from '../../models/user.model';
import { InvitationModel } from '../../models/invitation.model';
import { AppError } from '../../utils/app-error';
import { toOrganisationDto, toOrganisationSummaryDto } from '../../utils/dto.mapper';

export class OrganisationsService {
  public async getMyOrganisation(organisationId: string): Promise<Organisation> {
    const organisation = await OrganisationModel.findById(organisationId);
    if (!organisation) {
      throw AppError.notFound('Organisation not found');
    }
    return toOrganisationDto(organisation);
  }

  public async getStats(organisationId: string): Promise<OrganisationStats> {
    const organisation = await OrganisationModel.findById(organisationId);
    if (!organisation) {
      throw AppError.notFound('Organisation not found');
    }

    const [totalTechnicians, activeTechnicians, pendingInvitations] = await Promise.all([
      UserModel.countDocuments({
        organisationId,
        role: 'TECHNICIAN',
      }),
      UserModel.countDocuments({
        organisationId,
        role: 'TECHNICIAN',
        status: 'ACTIVE',
      }),
      InvitationModel.countDocuments({
        organisationId,
        status: 'PENDING',
        expiresAt: { $gt: new Date() },
      }),
    ]);

    return {
      organisation: toOrganisationSummaryDto(organisation),
      totalTechnicians,
      activeTechnicians,
      pendingInvitations,
    };
  }
}

export const organisationsService = new OrganisationsService();
