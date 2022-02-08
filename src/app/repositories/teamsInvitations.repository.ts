import { TeamInvitationModel, TeamInvitationAttributes } from '../models/teaminvitation';

export class TeamsInvitationsRepository {
  // private readonly teamsMembersModel: TeamInvitationModel;
  private readonly models: { teamsinvitations: TeamInvitationModel };

  constructor(models: { teamsinvitations: TeamInvitationModel }) {
    // this.teamsMembersModel = teamsMembersModel;
    this.models = models;
  }

  async findOne(where: Partial<TeamInvitationAttributes>): Promise<TeamInvitationAttributes | null> {
    const teamInvitation = await this.models.teamsinvitations.findOne({ where });

    return teamInvitation?.toJSON() as TeamInvitationAttributes | null;
  }

  async find(where: Partial<TeamInvitationAttributes>): Promise<TeamInvitationAttributes[]> {
    const teamInvitations = await this.models.teamsinvitations.findAll({ where });

    return (teamInvitations?.map(invitation => invitation.toJSON()) || []) as TeamInvitationAttributes[];
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
