import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Fixed price for each itinerary generation ($3.00)
export const ITINERARY_PRICE = 300; // in cents

// Package prices (in cents)
export const PACKAGE_PRICES = {
  basic: 1499,     // $14.99
  premium: 2499,   // $24.99
  ultimate: 4999   // $49.99
};

// Create a checkout session for one-time payment
export async function createCheckoutSession(tripDetails: any) {
  try {
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI-Generated Travel Itinerary',
              description: `Custom travel plan for ${tripDetails.destination}`
            },
            unit_amount: ITINERARY_PRICE, // $3.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/`,
      metadata: {
        tripDetails: JSON.stringify(tripDetails)
      }
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create payment");
  }
}

// Create a payment intent for a package purchase
export async function createPackagePaymentIntent(packageType: 'basic' | 'premium' | 'ultimate') {
  try {
    const amount = PACKAGE_PRICES[packageType];
    
    if (!amount) {
      throw new Error("Invalid package type");
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        packageType,
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error("Error creating package payment intent:", error);
    throw new Error("Failed to create payment for package");
  }
}

// Create a payment intent directly (alternative approach)
export async function createPaymentIntent() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: ITINERARY_PRICE,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment");
  }
}

// Handle Stripe webhook events
export async function handleWebhook(requestBody: any, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      requestBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    // Handle successful checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Process the trip generation if payment was successful
      // The trip details are stored in the session metadata
      if (session.metadata?.tripDetails) {
        const tripDetails = JSON.parse(session.metadata.tripDetails);
        // We'll handle this in the routes.ts file for actual implementation
        console.log('Payment successful, generating trip for:', tripDetails);
      }
    }

    return { received: true };
  } catch (error) {
    console.error("Error handling webhook:", error);
    throw new Error("Webhook error");
  }
}

// Verify a payment intent
export async function verifyPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }
    
    return {
      successful: true,
      packageType: paymentIntent.metadata?.packageType
    };
  } catch (error) {
    console.error("Error verifying payment intent:", error);
    throw new Error("Failed to verify payment");
  }
}
