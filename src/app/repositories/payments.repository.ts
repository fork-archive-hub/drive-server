import { Stripe } from 'stripe';

export class MissingMetadataError extends Error {
  constructor() {
    super('Missing metadata');
  }
}

export class MissingMetadataFieldError extends Error {
  constructor(field: string) {
    super(`Missing metadata field "${field}"`);
  }
}

export class MalformedMetadataError extends Error {
  constructor(field: string, reason?: string) {
    super(`Product field "${field}" is malformed. Reason ${reason ?? 'Unknown'}`);
  }
}

interface TeamsCheckoutSession {
  totalMembers: number
  subscription: any
  paid: boolean
}

export class PaymentsRepository {
  private readonly paymentsProvider: Stripe;

  constructor(paymentsProvider: Stripe) {
    this.paymentsProvider = paymentsProvider;
  }

  /**
   * Retrieves storage from a given subscription
   * @param subscriptionId Id of the subscription
   * @returns subscription storage
   */
  async getSubscriptionStorage(subscriptionId: string): Promise<number> {
    const subscription = await this.paymentsProvider.subscriptions.retrieve(subscriptionId);
    console.log('SUBSCRIPTION -->', JSON.stringify(subscription, null, 2));
    // TODO: Check what is the type of subscription
    const product = await this.paymentsProvider.products.retrieve((subscription as any).plan.product);
    
    if (!product.metadata) {
      throw new MissingMetadataError();
    }

    const storageBytesField = 'size_bytes';

    if (!product.metadata[storageBytesField]) {
      throw new MissingMetadataFieldError(storageBytesField);
    }

    let storageInBytes = 0;

    try {
      storageInBytes = parseInt(product.metadata[storageBytesField], 10);
    } catch (err) {
      throw new MalformedMetadataError('size_bytes', (err as Error).message);
    }

    return storageInBytes;
  }

  async retrieveTeamsCheckoutSession(sessionId: string): Promise<TeamsCheckoutSession> {
    const session = await this.paymentsProvider.checkout.sessions.retrieve(sessionId);

    if (!session.metadata) {
      throw new MissingMetadataError();
    }

    const totalMembersField = 'total_members';

    if (!session.metadata[totalMembersField]) {
      throw new MissingMetadataFieldError(totalMembersField);
    }

    let totalMembers = 0;

    try {
      totalMembers = parseInt(session.metadata[totalMembersField], 10);
    } catch (err) {
      throw new MalformedMetadataError('size_bytes', (err as Error).message);
    }

    return {
      paid: session.payment_status === 'paid',
      totalMembers,
      subscription: session.subscription
    };
  }
}
