import { Request, Router, Response } from 'express';

import { passportAuth } from '../middleware/passport';
import sharedMiddlewareBuilder from '../middleware/shared-workspace';
import { UserAttributes } from '../models/user';

type AuthorizedRequest = Request & { behalfUser: UserAttributes };

class ShareController {
  private service: any;

  constructor(service: any) {
    this.service = service;
  }

  async listShares(req: Request, res: Response) {
    const list = await this.service.Share.list((req as AuthorizedRequest).behalfUser);

    res.status(200).send(list);
  }
}

export default (router: Router, service: any) => {
  const controller = new ShareController(service);
  const sharedAdapter = sharedMiddlewareBuilder.build(service);

  router.get('/share/list', passportAuth, sharedAdapter, controller.listShares.bind(controller));
};
