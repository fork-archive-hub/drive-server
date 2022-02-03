import { TeamAttributes, TeamModel } from '../models/team';

export class TeamsRepository {
  private readonly teamsModel: TeamModel;

  constructor(teamsModel: TeamModel) {
    this.teamsModel = teamsModel;
  }

  async findOne(where: Partial<TeamAttributes>): Promise<TeamAttributes | null> {
    const team = await this.teamsModel.findOne({ where });

    return team?.toJSON() as TeamAttributes | null; 
  }

  async updateOne(where: Partial<TeamAttributes>, data: Partial<TeamAttributes>): Promise<void> {
    await this.teamsModel.update(data, { where, limit: 1 });
  }

  async update(where: Partial<TeamAttributes>, data: Partial<TeamAttributes>): Promise<void> {
    await this.teamsModel.update(data, { where });
  }
}