import { Router, Request, Response } from 'express';
import _ from 'lodash';
import mail from '@sendgrid/mail';

import { UserAttributes } from '../models/user';
import { passportAuth, sign, Sign } from '../middleware/passport';
import Logger from '../../lib/logger';
import { PaymentsService, TeamsNotPaidError } from '../services/payments.service';
import { 
  MemberAlreadyInOtherTeamError, 
  TeamInvitationNotFound, 
  TeamNotFoundError, 
  TeamsService, 
  UnauthorizedRemovalAttempt
} from '../services/teams.service';
import { TeamAttributes } from '../models/team';

const logger = Logger.getInstance();

type AuthorizedRequest = Request & { user: UserAttributes };

// Until complete TypeScript migration
interface Services { 
  TeamsMembers: any
  teamsService: TeamsService
  User: any
  KeyServer: any
  TeamInvitations: any
  Team: any
  Mail: any
  paymentsService: PaymentsService
}

class TeamsController {
  private service: Services;
  private app: any;

  constructor(service: Services, app: any) {
    this.service = service;
    this.app = app;
  }

  // TODO: team any: what is this??
  async sendTeamInvitation(req: Request, res: Response) {
    const { email, bridgePass: bridgePassword, mnemonicTeam: teamMnemonic } = req.body;
    const user = (req as AuthorizedRequest).user.email;

    const team = await this.service.teamsService.getTeamByBridgeUser(user);
    const totalUsers = await this.service.TeamsMembers.getPeople(team.id);

    if (totalUsers.length >= team.totalMembers) {
      return res.status(402).send({ error: `You cannot exceed the limit of ${team.totalMembers} members` });
    }

    const userToInvite = await this.service.User.FindUserByEmail(email).catch(() => null);

    if (!userToInvite) {
      return res.status(404).send({ message: 'This user does not have an Internxt account' });
    }

    const keysExist = await this.service.KeyServer.keysExists(userToInvite);

    if (!keysExist) {
      logger.error(
        'User %s invited user %s to join the team, but this user has not server keys', 
        user, 
        userToInvite.email
      );

      return res.status(400).send({ message: 'This user can not be invited' });
    }

    const invitation = await this.service.TeamInvitations.getTeamInvitationByUser(email);

    if (invitation) {
      await this.service.Mail.sendEmailTeamsMember(
        userToInvite.name, 
        email, 
        invitation.token, 
        (req as any).team
      );
      return res.status(200).send();
    }

    const teamUser = await this.service.Team.getIdTeamByUser(email);

    if (teamUser) {
      return res.status(200).send({ message: 'User already joined this team' });
    }

    const teamToJoin = await this.service.Team.getTeamBridgeUser(user);

    if (!teamToJoin) {
      logger.error('Team %s was not initialized properly on the network', team.id);

      return res.status(409).send({ message: 'There is an issue with this Teams account' });
    }

    const invitationToken = await this.service.teamsService.createTeamInvitation(
      teamToJoin.id,
      email,
      bridgePassword,
      teamMnemonic
    );

    await this.service.Mail.sendEmailTeamsMember(userToInvite.name, email, invitationToken, (req as any).team);
    logger.info('User %s invites %s to join the team', user, email);
    res.status(200).send({});
  }

  async joinTeam(req: Request, res: Response) {
    const { token } = req.params;

    // TODO: Move to teams service

    try {
      const invitation = await this.service.teamsService.getTeamInvitationByToken(token);
      const teamExists = await this.service.teamsService.teamExists(invitation.idTeam);

      if (!teamExists) {
        logger.error(
          'Email %s used an invitation to join a non-existent team with id %s', 
          invitation.user, 
          invitation.idTeam
        );

        return res.status(409).send({ message: 'This team does not exist' });
      }

      const memberToJoin = await this.service.User.FindUserByEmail(invitation.user);
      
      if (!memberToJoin) {
        logger.error(
          'Email %s is not an Internxt user, but is trying to join team %s', 
          invitation.user,
          invitation.idTeam
        );

        return res.status(409).send();
      }

      const keysExists = await this.service.KeyServer.keysExists(memberToJoin);
      
      if (!keysExists) {
        logger.error('User %s can not join team %s due to missing keys', invitation.user, invitation.idTeam);

        return res.status(400).send({ message: 'User can not join this team' });
      }

      await this.service.teamsService.addMemberToTeam(
        invitation.idTeam,
        invitation.user,
        invitation.bridgePassword,
        invitation.mnemonic
      );

      await this.service.teamsService.destroyTeamInvitation(
        invitation.id,
        invitation.user
      );

      res.status(200).send();
    } catch (err) {
      if (err instanceof TeamInvitationNotFound) {
        return res.status(404).send();
      }
      throw err;
    }
  }

  async getTeamMembers(req: Request, res: Response) {
    const user = (req as AuthorizedRequest).user.email;
    try {
      const teamInfo = await this.service.Team.getTeamByEmail(user);
      const members = await this.service.TeamsMembers.getPeople(teamInfo.id);
      const result = _.remove(members, (member: any) => member.user !== user);
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send();
    }
  }

  // async getTeamInvitations(req: Request, res: Response) {
  //   const user = 
  // }

  async removeTeamMember(req: Request, res: Response) {
    const emailOfUserToRemove = req.body.user;
    const userRequestingRemoval = (req as AuthorizedRequest).user.email;

    try {
      await this.service.teamsService.removeTeamMember(
        emailOfUserToRemove,
        userRequestingRemoval
      );

      return res.status(200).send();
    } catch (err) {
      if (err instanceof UnauthorizedRemovalAttempt) {
        return res.status(403).send({ message: 'Not allowed to remove members' });
      }
      throw err;
    }
  }

  async removeTeamInvitation(req: Request, res: Response) {
    const invitationId = parseInt(req.params.id);
    const userRequestingRemoval = (req as AuthorizedRequest).user.email;

    try {
      await this.service.teamsService.requestTeamInvitationDestroy(
        invitationId,
        userRequestingRemoval
      );

      return res.status(200).send();
    } catch (err) {
      if (err instanceof UnauthorizedRemovalAttempt) {
        return res.status(403).send({ message: 'Not authorized to remove invitations' });
      }

      throw err;
    }
  }

  async deleteTeamAccount(req: Request, res: Response) {
    mail.setApiKey(process.env.SENDGRID_API_KEY as string);
    const msg = {
      to: 'hello@internxt.com',
      from: 'hello@internxt.com',
      subject: 'Delete Teams Account',
      text: `Hello Internxt! I need to delete my team account ${(req as AuthorizedRequest).user.email}`,
    };
    mail
      .send(msg)
      .then(() => {
        res.status(200).send({});
      })
      .catch((err) => {
        logger.error(
          'Error: Error send deactivation email teams account of user %s', 
          (req as AuthorizedRequest).user.email
        );
        res.status(500).send(err);
      });
  }

  async getTeamInfo(req: Request, res: Response) {
    const userEmail = (req as AuthorizedRequest).user.email;
    
    const team = await this.service.teamsService.getMemberTeam(userEmail);
    const tokenTeams = sign(team, this.app.config.get('secrets').JWT, );

    const user = await this.service.User.FindUserByEmail(team.bridgeUser);
    const userBucket = await this.service.User.GetUserBucket(user);

    const member = await this.service.TeamsMembers.getMemberByIdTeam(
      team.id, 
      userEmail
    );
    const memberMnemonic = member.bridgeMnemonic;
    const isAdmin = team.admin === userEmail;

    const info: Omit<TeamAttributes, 'id'> & { 
      root_folder_id: string, 
      isAdmin: boolean, 
      bucket: string
    } = {
      admin: team.admin,
      name: team.name,
      bridgeUser: team.bridgeUser,
      /* 
        BE CAREFUL: Although every team member shares the same mnemonic, each member
        has it encrypted with his own password. So, in order to be able to decrypt
        it on the client-side, this field should be the mnemonic encrypted BY THE USER.

        This mnemonic is stored on teamsmembers table. DO NOT send the team field 
        called bridge_mnemonic as this is the mnemonic encrypted only by the admin,
        therefore, it will work for the admin but not for the other team members
      */
      bridgeMnemonic: memberMnemonic,
      bridgePassword: team.bridgePassword,
      bucket: userBucket,
      isAdmin,
      root_folder_id: user.root_folder_id,
      totalMembers: team.totalMembers,
    };

    if (!isAdmin && info.bridgeMnemonic === team.bridgeMnemonic) {
      throw new Error('Teams encryption data for team member is wrong');
    }

    return res.status(200).send({ userTeam: info, tokenTeams });
  }

  async getTeam(req: Request, res: Response) {
    const team = await this.service.Team.getTeamByEmail((req as AuthorizedRequest).user.email);

    if (!team) {
      return res.status(404).send();
    }

    return res.status(200).send(team);
  }

  async completeCheckoutSession(req: Request, res: Response) {
    const { email } = (req as AuthorizedRequest).user;
    const { mnemonic, checkoutSessionId } = req.body;
    
    if (!mnemonic || !checkoutSessionId) {
      return res.status(400).send({
        message: 'Missing required fields'
      });
    }

    try {
      const team = await this.service.paymentsService.completeTeamsCheckoutSession({
        checkoutSessionId,
        mnemonic,
        email
      });

      res.status(200).send(team);
    } catch (err) {
      if (err instanceof TeamsNotPaidError) {
        return res.status(402).send();
      }

      if (err instanceof TeamNotFoundError) {
        return res.status(404).send();
      }

      if (err instanceof MemberAlreadyInOtherTeamError) {
        return res.status(409).send();
      }

      throw err;
    }
  }
}

export default (router: Router, service: any, app: any) => {
  const controller = new TeamsController(service, app);

  router.post('/teams/team/invitations', passportAuth, controller.sendTeamInvitation.bind(controller));
  router.post('/teams/join/:token', controller.joinTeam.bind(controller)); 
  router.get('/teams/members', passportAuth, controller.getTeamMembers.bind(controller));
  router.delete('/teams/member', passportAuth, controller.removeTeamMember.bind(controller));
  router.delete('/teams/invitation/:id', passportAuth, controller.removeTeamInvitation.bind(controller));
  router.post('/teams/deleteAccount', passportAuth, controller.deleteTeamAccount.bind(controller));
  router.get('/teams/info', passportAuth, controller.getTeamInfo.bind(controller));
  router.get('/teams/team/info', passportAuth, controller.getTeam.bind(controller));
  router.post('/teams/checkout/session', passportAuth, controller.completeCheckoutSession.bind(controller));
};
