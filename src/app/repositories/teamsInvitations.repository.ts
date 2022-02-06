import { TeamInvitationModel, TeamInvitationAttributes } from '../models/teaminvitation';

export class TeamsInvitationsRepository {
  // private readonly teamsMembersModel: TeamInvitationModel;
  private readonly models: { teamsinvitations: TeamInvitationModel };

  constructor(models: { teamsinvitations: TeamInvitationModel }) {
    // this.teamsMembersModel = teamsMembersModel;
    this.models = models;
  }

  async findOne(where: Partial<TeamInvitationAttributes>): Promise<TeamInvitationAttributes | null> {
    const teamMember = await this.models.teamsinvitations.findOne({ where });

    return teamMember?.toJSON() as TeamInvitationAttributes | null;
  }

  async create(data: Omit<TeamInvitationAttributes, 'id'>): Promise<void> {
    await this.models.teamsinvitations.create(data);
  }

  async delete(where: Partial<TeamInvitationAttributes>) {
    await this.models.teamsinvitations.destroy({ where });
  }

  async deleteOne(where: Partial<TeamInvitationAttributes>) {
    await this.models.teamsinvitations.destroy({ where, limit: 1 });
  }
}
