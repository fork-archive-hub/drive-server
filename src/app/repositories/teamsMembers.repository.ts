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

  async find(where: Partial<TeamsMembersAttributes>): Promise<TeamsMembersAttributes[]> {
    const teamMembers = await this.models.teamsmembers.findAll({ where });

    return (teamMembers?.map(member => member.toJSON()) || []) as TeamsMembersAttributes[];
  }

  async create(data: Omit<TeamsMembersAttributes, 'id'>): Promise<void> {
    await this.models.teamsmembers.create(data);
  }

  async deleteOne(where: Partial<TeamsMembersAttributes>) {
    await this.models.teamsmembers.destroy({ where, limit: 1 });
  }
}
