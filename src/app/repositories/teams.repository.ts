import { TeamAttributes, TeamModel } from '../models/team';

export class TeamsRepository {
  // private readonly teamsModel: TeamModel;
  private readonly models: { teams: TeamModel };

  constructor(models: { teams: TeamModel }) {
    this.models = models;
  }

  async findOne(where: Partial<TeamAttributes>): Promise<TeamAttributes | null> {
    const team = await this.models.teams.findOne({ where: where });

    return team?.toJSON() as TeamAttributes | null; 
  }

  async updateOne(where: Partial<TeamAttributes>, data: Partial<TeamAttributes>): Promise<void> {
    await this.models.teams.update(data, { where, limit: 1 });
  }

  async update(where: Partial<TeamAttributes>, data: Partial<TeamAttributes>): Promise<void> {
    await this.models.teams.update(data, { where });
  }
}