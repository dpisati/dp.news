import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../services/stripe";
import { getSession } from 'next-auth/client'
import { fauna } from "../../services/fauna";

import { query as q } from 'faunadb';


type User = {
    ref: {
        id: string;
    },
    data: {
        stripe_custumer_id: string;
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST') {        
        const session = await getSession({ req });
       
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('users_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        let custumerId = user.data.stripe_custumer_id;

        if(!custumerId) {
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email,
                //metadata
            });
            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_custumer_id: stripeCustomer.id
                        }
                    }
                )
            )
            custumerId = stripeCustomer.id;    
        }

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: custumerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [{
                price: 'price_1JwhqXHh4F5ugyOfyt3uzTLQ',
                quantity: 1
            }],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
        });

        return res.status(200).json({ sessionid: stripeCheckoutSession.id })
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed');
    }
}