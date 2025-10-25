import Stripe from 'stripe';
import { prisma } from '../../database/client';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

class StripeCustomerService {
  /**
   * Create or get Stripe Customer for user
   */
  async getOrCreateCustomer(userId: string, email?: string, name?: string) {
    // Check if customer already exists
    let customer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (customer) {
      return customer;
    }

    // Create new Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    // Save to database
    customer = await prisma.stripeCustomer.create({
      data: {
        userId,
        stripeCustomerId: stripeCustomer.id,
        email: stripeCustomer.email || undefined,
        name: stripeCustomer.name || undefined,
      },
    });

    return customer;
  }

  /**
   * Add payment method (card)
   */
  async addPaymentMethod(userId: string, paymentMethodId: string) {
    // Get or create customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const customer = await this.getOrCreateCustomer(userId, user.email, user.displayName || undefined);

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.stripeCustomerId,
    });

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Check if this is the first payment method
    const existingMethods = await prisma.paymentMethod.count({
      where: {
        stripeCustomerId: customer.id,
      },
    });

    const isFirstMethod = existingMethods === 0;

    // Save to database
    const savedMethod = await prisma.paymentMethod.create({
      data: {
        stripeCustomerId: customer.id,
        paymentMethodId,
        type: paymentMethod.type,
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
        isDefault: isFirstMethod, // First method is default
      },
    });

    // Set as default in Stripe if it's the first method
    if (isFirstMethod) {
      await stripe.customers.update(customer.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      await prisma.stripeCustomer.update({
        where: { id: customer.id },
        data: {
          defaultPaymentMethodId: paymentMethodId,
        },
      });
    }

    return savedMethod;
  }

  /**
   * List payment methods
   */
  async listPaymentMethods(userId: string) {
    const customer = await prisma.stripeCustomer.findUnique({
      where: { userId },
      include: {
        paymentMethods: true,
      },
    });

    if (!customer) {
      return [];
    }

    return customer.paymentMethods;
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(userId: string, paymentMethodDbId: string) {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodDbId },
      include: {
        customer: true,
      },
    });

    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    if (paymentMethod.customer.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethod.paymentMethodId);

    // Delete from database
    await prisma.paymentMethod.delete({
      where: { id: paymentMethodDbId },
    });

    // If this was the default, set another as default
    if (paymentMethod.isDefault) {
      const otherMethod = await prisma.paymentMethod.findFirst({
        where: {
          stripeCustomerId: paymentMethod.stripeCustomerId,
        },
      });

      if (otherMethod) {
        await this.setDefaultPaymentMethod(userId, otherMethod.id);
      }
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(userId: string, paymentMethodDbId: string) {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodDbId },
      include: {
        customer: true,
      },
    });

    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    if (paymentMethod.customer.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Unset all other defaults
    await prisma.paymentMethod.updateMany({
      where: {
        stripeCustomerId: paymentMethod.stripeCustomerId,
      },
      data: {
        isDefault: false,
      },
    });

    // Set new default
    await prisma.paymentMethod.update({
      where: { id: paymentMethodDbId },
      data: {
        isDefault: true,
      },
    });

    // Update in Stripe
    await stripe.customers.update(paymentMethod.customer.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.paymentMethodId,
      },
    });

    await prisma.stripeCustomer.update({
      where: { id: paymentMethod.stripeCustomerId },
      data: {
        defaultPaymentMethodId: paymentMethod.paymentMethodId,
      },
    });
  }

  /**
   * Create Setup Intent for adding card
   * Returns client_secret для Stripe Elements на frontend
   */
  async createSetupIntent(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const customer = await this.getOrCreateCustomer(userId, user.email, user.displayName || undefined);

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.stripeCustomerId,
      payment_method_types: ['card'],
    });

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    };
  }

  /**
   * Confirm Setup Intent and save payment method
   */
  async confirmSetupIntent(userId: string, setupIntentId: string) {
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== 'succeeded') {
      throw new Error('Setup Intent not succeeded');
    }

    const paymentMethodId = setupIntent.payment_method as string;

    return this.addPaymentMethod(userId, paymentMethodId);
  }
}

export const stripeCustomerService = new StripeCustomerService();
