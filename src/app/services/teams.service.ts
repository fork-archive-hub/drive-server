import axios from 'axios';
import { randomBytes } from 'crypto';

import { getGatewayCredentials } from '../../config/environments/env';
import { TeamAttributes } from '../models/team';
import { TeamInvitationAttributes } from '../models/teaminvitation';
import { TeamsRepository } from '../repositories/teams.repository';
import { TeamsInvitationsRepository } from '../repositories/teamsInvitations.repository';
import { TeamsMembersRepository } from '../repositories/teamsMembers.repository';

export class MemberAlreadyInOtherTeamError extends Error {
  constructor() {
    super('Member is already in other team');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, MemberAlreadyInOtherTeamError.prototype);
  }
}

export class TeamNotFoundError extends Error {
  constructor() {
    super('Team not found');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, TeamNotFoundError.prototype);
  }
}

export class UserDoesNotHaveTeamError extends Error {
  constructor() {
    super('User does not have team');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, UserDoesNotHaveTeamError.prototype);
  }
}

export class TeamInvitationNotFound extends Error {
  constructor() {
    super('Team invitation not found');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, TeamInvitationNotFound.prototype);
  }
}

export class TeamsService {
  private readonly teamsRepository: TeamsRepository;
  private readonly teamsMembersRepository: TeamsMembersRepository;
  private readonly teamsInvitationsRepository: TeamsInvitationsRepository;

  constructor(
    teamsRepository: TeamsRepository, 
    teamsMembersRepository: TeamsMembersRepository,
    teamsInvitationsRepository: TeamsInvitationsRepository
  ) {
    this.teamsRepository = teamsRepository;
    this.teamsMembersRepository = teamsMembersRepository;
    this.teamsInvitationsRepository = teamsInvitationsRepository;
  }

  async updateAdminTeam(adminEmail: string, updatedData: Partial<TeamAttributes>): Promise<void> {
    await this.teamsRepository.updateOne(updatedData, { admin: adminEmail });
  }

  async getTeamById(teamId: number): Promise<TeamAttributes> {
    const team = await this.teamsRepository.findOne({ id: teamId });

    if (!team) {
      throw new TeamNotFoundError();
    }

    return team;
  }

  async teamExists(teamId: number): Promise<boolean> {
    const team = await this.teamsRepository.findOne({ id: teamId });

    return !!team;
  }

  async getTeamByBridgeUser(bridgeUser: string): Promise<TeamAttributes> {
    const team = await this.teamsRepository.findOne({ bridgeUser });

    if (!team) {
      throw new TeamNotFoundError();
    }

    return team;
  }

  async getAdminTeam(adminEmail: string): Promise<TeamAttributes> {
    const team = await this.teamsRepository.findOne({ admin: adminEmail });

    if (!team) {
      throw new TeamNotFoundError();
    }

    return team;
  }

  async getMemberTeam(memberEmail: string): Promise<TeamAttributes> {
    const teamMember = await this.teamsMembersRepository.findOne({ user: memberEmail });

    if (!teamMember) {
      throw new UserDoesNotHaveTeamError();
    }

    const team = await this.teamsRepository.findOne({ id: teamMember.idTeam });

    if (!team) {
      throw new TeamNotFoundError();
    }

    return team;
  }
  
  /**
   * Upgrades the team storage. 
   * 
   * Take in consideration that the team storage on the network is the 
   * storage of the admin user. The admin user is a fake user used by 
   * each member of the team to upload content to the Internxt Network.
   * 
   * Therefore, through the network gateway, we request an upgrade of 
   * that network user storage, which ID on the network is the email of 
   * the team admin
   * 
   * @param adminEmail Email of the team admin
   * @param newBytesStorage New storage for the `ENTIRE` team
   * @returns 
   */
  async upgradeStorage(adminEmail: string, newBytesStorage: number) {
    const gatewayCredentials = getGatewayCredentials();

    // TODO: Hide behind a gateway service
    return axios.post(
      `${process.env.STORJ_BRIDGE}/gateway/upgrade`,
      {
        email: adminEmail,
        bytes: newBytesStorage,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        auth: { username: gatewayCredentials.user, password: gatewayCredentials.pass },
      },
    );
  } 

  /**
   * Adds a member to a team.
   * 
   * `A user just can be in a team at a given time`
   * @param teamId Id of the team to join
   * @param emailOfNewMember Email of the user joining the team
   * @param networkPassword Network password of the user joining the team
   * @param mnemonic Mnemonic of the user joining the team
   * @returns 
   */
  async addMemberToTeam(teamId: number, emailOfNewMember: string, networkPassword: string, mnemonic: string) {
    const member = await this.teamsMembersRepository.findOne({
      user: emailOfNewMember
    });

    if (member) {
      const memberIsInThisTeam = member.idTeam == teamId;

      if (memberIsInThisTeam) {
        return;
      }

      throw new MemberAlreadyInOtherTeamError();
    }

    await this.teamsMembersRepository.create({
      idTeam: teamId,
      user: emailOfNewMember,
      bridgePassword: networkPassword,
      bridgeMnemonic: mnemonic
    });
  }

  async getTeamInvitationByToken(token: string): Promise<TeamInvitationAttributes> {
    const invitation = await this.teamsInvitationsRepository.findOne({ token });

    if (!invitation) {
      throw new TeamInvitationNotFound();
    }

    return invitation;
  }

  async destroyTeamInvitation(invitationId: number, userEmail: string): Promise<void> {
    await this.teamsInvitationsRepository.deleteOne({
      id: invitationId,
      user: userEmail
    });
  }

  async createTeamInvitation(
    teamId: number, 
    emailOfUserInvited: string, 
    networkPassword: string, 
    mnemonic: string
  ): Promise<string> {
    const token = randomBytes(20).toString('hex');

    await this.teamsInvitationsRepository.create({
      idTeam: teamId,
      user: emailOfUserInvited,
      bridgePassword: networkPassword,
      mnemonic,
      token
    });

    return token;
  }
}
