import { UserProfileResponse, User } from '@groundops/contracts';
import { UserModel } from '../../models/user.model';
import { OrganisationModel } from '../../models/organisation.model';
import { AppError } from '../../utils/app-error';
import { toOrganisationSummaryDto, toUserDto } from '../../utils/dto.mapper';

export class UsersService {
  public async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const organisation = await OrganisationModel.findById(user.organisationId);
    if (!organisation) {
      throw AppError.notFound('Organisation not found');
    }

    return {
      user: toUserDto(user),
      organisation: toOrganisationSummaryDto(organisation),
    };
  }

  public async listTechnicians(organisationId: string): Promise<User[]> {
    const technicians = await UserModel.find({
      organisationId,
      role: 'TECHNICIAN',
    }).sort({ createdAt: -1 });

    return technicians.map(toUserDto);
  }
}

export const usersService = new UsersService();
