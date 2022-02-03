import { TeamMemberModel, TeamsMembersAttributes } from '../models/teammember';

export class TeamsMembersRepository {
  private readonly teamsMembersModel: TeamMemberModel;

  constructor(teamsMembersModel: TeamMemberModel) {
    this.teamsMembersModel = teamsMembersModel;
  }

  async findOne(where: Partial<TeamsMembersAttributes>): Promise<TeamsMembersAttributes | null> {
    const teamMember = await this.teamsMembersModel.findOne({ where });

    return teamMember?.toJSON() as TeamsMembersAttributes | null;
  }

  async create(data: Omit<TeamsMembersAttributes, 'id'>): Promise<void> {
    await this.teamsMembersModel.create(data);
  }
}
