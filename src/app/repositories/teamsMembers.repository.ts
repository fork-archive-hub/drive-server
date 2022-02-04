import { TeamMemberModel, TeamsMembersAttributes } from '../models/teammember';

export class TeamsMembersRepository {
  // private readonly teamsMembersModel: TeamMemberModel;
  private readonly models: { teamsmembers: TeamMemberModel };

  constructor(models: { teamsmembers: TeamMemberModel }) {
    // this.teamsMembersModel = teamsMembersModel;
    this.models = models;
  }

  async findOne(where: Partial<TeamsMembersAttributes>): Promise<TeamsMembersAttributes | null> {
    const teamMember = await this.models.teamsmembers.findOne({ where });

    return teamMember?.toJSON() as TeamsMembersAttributes | null;
  }

  async create(data: Omit<TeamsMembersAttributes, 'id'>): Promise<void> {
    await this.models.teamsmembers.create(data);
  }
}