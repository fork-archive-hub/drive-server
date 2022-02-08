import axios from 'axios';
import { randomBytes } from 'crypto';

import { getGatewayCredentials } from '../../config/environments/env';
import { TeamAttributes } from '../models/team';
import { TeamInvitationAttributes } from '../models/teaminvitation';
import { TeamsMembersAttributes } from '../models/teammember';
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

export class TeamInvitationNotFoundError extends Error {
  constructor() {
    super('Team invitation not found');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, TeamInvitationNotFoundError.prototype);
  }
}

export class UnauthorizedRemovalAttemptError extends Error {
  constructor() {
    super('User not authorized to remove members');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, UnauthorizedRemovalAttemptError.prototype);
  }
}

export class UnauthorizedSendInvitationAttemptError extends Error {
  constructor() {
    super('User not authorized to send invitations');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, UnauthorizedSendInvitationAttemptError.prototype);
  }
}

export class TeamMemberLimitReachedError extends Error {
  constructor() {
    super('Team member limit reached');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, TeamMemberLimitReachedError.prototype);
  }
}

// TODO: Move to user service when is refactored
export class UserNotFoundError extends Error {
  constructor() {
    super('User not found');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class UserHasMissingKeysError extends Error {
  constructor() {
    super('User not found');

    // see https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    Object.setPrototypeOf(this, UserHasMissingKeysError.prototype);
  }
}

export class TeamsService {
  private readonly teamsRepository: TeamsRepository;
  private readonly teamsMembersRepository: TeamsMembersRepository;
  private readonly teamsInvitationsRepository: TeamsInvitationsRepository;
  private readonly legacyServices: any;

  constructor(
    teamsRepository: TeamsRepository, 
    teamsMembersRepository: TeamsMembersRepository,
    teamsInvitationsRepository: TeamsInvitationsRepository,
    legacyServices: any
  ) {
    this.teamsRepository = teamsRepository;
    this.teamsMembersRepository = teamsMembersRepository;
    this.teamsInvitationsRepository = teamsInvitationsRepository;
    this.legacyServices = legacyServices;
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

  async removeTeamMember(emailOfUserToRemove: string, emailOfUserRequestingRemoval: string): Promise<void> {
    const team = await this.teamsRepository.findOne({ admin: emailOfUserRequestingRemoval });

    if (!team) {
      throw new UnauthorizedRemovalAttemptError();
    }

    await this.teamsMembersRepository.deleteOne({
      idTeam: team.id,
      user: emailOfUserToRemove
    });
  }

  async sendTeamInvitation(
    adminEmail: string, 
    emailOfUserToInvite: string
  ): Promise<void> {
    const teamToJoin = await this.teamsRepository.findOne({ admin: adminEmail });
    const isAdmin = !!teamToJoin;

    if (!isAdmin) {
      throw new UnauthorizedSendInvitationAttemptError();
    }

    const teamMembers = await this.teamsMembersRepository.find({
      idTeam: teamToJoin.id
    });

    if (teamMembers.length >= teamToJoin.totalMembers) {
      throw new TeamMemberLimitReachedError();
    }

    const userToInvite = await this.legacyServices.User.FindUserByEmail(
      emailOfUserToInvite
    );

    if (!userToInvite) {
      throw new UserNotFoundError();
    }

    const userToInviteHasKeys = await this.legacyServices.KeyServer.keysExists(
      userToInvite
    );

    if (!userToInviteHasKeys) {
      throw new UserHasMissingKeysError();
    }

    const teamMember = await this.teamsMembersRepository.findOne({
      user: emailOfUserToInvite
    });

    const userIsAlreadyInATeam = !!teamMember;

    if (userIsAlreadyInATeam) {
      if (teamMember.idTeam === teamToJoin.id) {
        return;
      }
      throw new MemberAlreadyInOtherTeamError();
    }

    const invitation = await this.teamsInvitationsRepository.findOne({
      user: emailOfUserToInvite
    });
    const alreadyInvited = !!invitation;
    let invitationToken: string;

    if (alreadyInvited) {
      invitationToken = invitation.token;
    } else {
      invitationToken = await this.createTeamInvitation(
        teamToJoin.id,
        emailOfUserToInvite,
        teamToJoin.bridgePassword,
        teamToJoin.bridgeMnemonic
      );
    }

    return this.legacyServices.Mail.sendEmailTeamsMember(
      userToInvite.name,
      emailOfUserToInvite,
      invitationToken,
      teamToJoin.name
    );
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
      throw new TeamInvitationNotFoundError();
    }

    return invitation;
  }

  async destroyTeamInvitation(invitationId: number, userEmail: string): Promise<void> {
    await this.teamsInvitationsRepository.deleteOne({
      id: invitationId,
      user: userEmail
    });
  }

  async requestTeamInvitationDestroy(
    invitationId: number,
    emailOfUserRequestingRemoval: string, 
  ): Promise<void> {
    const team = await this.teamsRepository.findOne({ admin: emailOfUserRequestingRemoval });

    if (!team) {
      throw new UnauthorizedRemovalAttemptError();
    }

    await this.teamsInvitationsRepository.deleteOne({
      id: invitationId,
      idTeam: team.id
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

  getTeamMembers(teamId: number): Promise<TeamsMembersAttributes[]> {
    return this.teamsMembersRepository.find({ id: teamId });
  }

  getTeamInvitations(teamId: number): Promise<TeamInvitationAttributes[]> {
    return this.teamsInvitationsRepository.find({ id: teamId });
  }
}
