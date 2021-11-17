import React from 'react'
import { useSession, signIn, session } from 'next-auth/client';
import { getStripeJs } from '../../services/stripe-js';

import styles from './styles.module.scss';
import { api } from '../../services/api';

interface SubscribeButtonProps {
    priceId: string;
}

export default function SubscribeButton({ priceId }: SubscribeButtonProps) {
    const [session] = useSession();

    async function handleSubscribe(){

        if(!session) {
            signIn('github')
            return;
        }



        // create checkout session
        const response = await api.post('/subscribe');
        
        try {
            const { sessionid } = response.data;
            const stripe = await getStripeJs();

            await stripe.redirectToCheckout({ sessionId: sessionid });
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    )
}
