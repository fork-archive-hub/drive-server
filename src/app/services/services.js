/* eslint-disable global-require */
import fs from 'fs';
import path from 'path';
import { Stripe } from 'stripe';

import { TeamsRepository } from '../repositories/teams.repository';
import { TeamsMembersRepository } from '../repositories/teamsMembers.repository';
import { TeamsService } from './teams.service';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from '../repositories/payments.repository';
import { isProduction } from '../../config/environments/env';

const StripeProduction = new Stripe(process.env.STRIPE_SK, { apiVersion: '2020-08-27' });
const StripeTest = new Stripe(process.env.STRIPE_SK_TEST, { apiVersion: '2020-08-27' });

const basename = path.basename(__filename);

function loadServices(models, services) {
  const teamsMembersRepository = new TeamsMembersRepository(models);
  const teamsRepository = new TeamsRepository(models);
  const teamsService = new TeamsService(teamsRepository, teamsMembersRepository);
  services['teamsService'] = teamsService;

  const paymentsRepository = new PaymentsRepository(isProduction() ? StripeProduction : StripeTest);
  const paymentsService = new PaymentsService(paymentsRepository, teamsService, services.Crypt, services.User);
  services['paymentsService'] = paymentsService;
}

module.exports = (Model, App) => {
  const services = {};
  const log = App.logger;
  try {
    fs.readdirSync(__dirname)
      .filter((file) => 
        file.indexOf('.') !== 0 && 
        file !== basename && 
        file.slice(-3) === '.js'
      )
      .forEach((file) => {
        const service = require(path.join(__dirname, file))(Model, App);
        services[service.Name] = service;
      });
    log.info('Services loaded');

    loadServices(Model, services);

    return services;
  } catch (error) {
    log.error(error);
    throw Error(error);
  }
};
