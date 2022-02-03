import { randomBytes } from 'crypto';

import { TeamsService } from './teams.service';
import { PaymentsRepository } from '../repositories/payments.repository';

interface CompleteTeamsCheckoutSessionPayload {
  checkoutSessionId: string
  mnemonic: string
  email: string
}

// TODO: Just for support during TypeScript complete transition
interface NewDriveUser {
  email: string,
  password: string
  salt: string
  mnemonic: string,
  bridgeUser: string
}

export class TeamsNotPaidError extends Error {
  constructor() {
    super('Team is not paid');
  }
}

export class PaymentsService {
  private readonly paymentsRepository: PaymentsRepository;
  private readonly teamsService: TeamsService;
  private readonly cryptoService: any;
  private readonly usersService: any;
  
  constructor(
    paymentsRepository: PaymentsRepository, 
    teamsService: TeamsService, 
    cryptoService: any, 
    usersService: any
  ) {
    this.paymentsRepository = paymentsRepository;
    this.teamsService = teamsService;
    this.cryptoService = cryptoService;
    this.usersService = usersService;
  }

  async completeTeamsCheckoutSession(payload: CompleteTeamsCheckoutSessionPayload): Promise<any> {
    const session = await this.paymentsRepository.retrieveTeamsCheckoutSession(payload.checkoutSessionId);
  
    if (!session.paid) {
      throw new TeamsNotPaidError();
    }

    // 2. Register team user as a user of Drive too
    const salt = randomBytes(128 / 8).toString('hex');
    const encryptedSalt = this.cryptoService.encryptText(salt);
    const newPassword = this.cryptoService.encryptText('team', salt);
    const encryptedPassword = this.cryptoService.encryptText(newPassword);

    const team = await this.teamsService.getAdminTeam(payload.email);
    const user: NewDriveUser = {
      email: team.bridgeUser,
      password: encryptedPassword,
      salt: encryptedSalt,
      mnemonic: payload.mnemonic,
      bridgeUser: team.bridgeUser
    };
    const newUser = await this.usersService.FindOrCreate(user);

    // 3. Update incomplete info for the team
    await this.teamsService.updateAdminTeam(team.bridgeUser, {
      bridgePassword: newUser.userId,
      totalMembers: session.totalMembers,
    });

    const paidStoragePerMember = await this.paymentsRepository.getSubscriptionStorage(session.subscription);
    const paidStorage = paidStoragePerMember * session.totalMembers;

    // 4. Add paid features to the user
    await this.usersService.InitializeUser({ email: team.bridgeUser, mnemonic: payload.mnemonic });
    await this.teamsService.upgradeStorage(team.bridgeUser, paidStorage);

    // 5. Add admin as a team member
    await this.teamsService.addMemberToTeam(team.id, team.admin, team.bridgePassword, team.bridgeMnemonic);
  
    return team;
  }
}
