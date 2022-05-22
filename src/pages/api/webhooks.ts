import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import Stripe from 'stripe';
import { stripe } from '../../services/stripe';
import { saveSubscription } from './_lib/manageSubscription';

async function buffer(readable: Readable) {
    const chunks = [];

    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export const config = {
    api: {
        bodyParser: false,
    },
};

const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const buf = await buffer(req);
        const secret = req.headers['stripe-signature'];

        let event: Stripe.Event;

        try {
            console.log('buf', buf);
            console.log('secret', secret);
            console.log(
                'process.env.STRIPE_WEBHOOK_SECRET',
                process.env.STRIPE_WEBHOOK_SECRET
            );
            event = stripe.webhooks.constructEvent(
                buf,
                secret,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (e) {
            return res.status(400).send(`Webhook error: ${e.message}`);
        }

        const { type } = event;

        if (relevantEvents.has(type)) {
            try {
                switch (type) {
                    case 'checkout.session.completed':
                        console.log('Checkout session completed', type);

                        const checkoutSession = event.data
                            .object as Stripe.Checkout.Session;

                        await saveSubscription(
                            checkoutSession.subscription.toString(),
                            checkoutSession.customer.toString(),
                            true
                        );
                        break;

                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted':
                        console.log('subscription completed', type);

                        const subscription = event.data
                            .object as Stripe.Subscription;

                        await saveSubscription(
                            subscription.id,
                            subscription.customer.toString(),
                            false
                        );
                        break;

                    default:
                        throw new Error('Unhandled event.');
                }
            } catch (error) {
                return res.json({ error: 'Weebhook handler failed' });
            }
        }

        res.status(200).json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed');
    }
};
