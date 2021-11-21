import React from 'react'
import { useSession, signIn, session } from 'next-auth/client';
import { getStripeJs } from '../../services/stripe-js';

import styles from './styles.module.scss';
import { api } from '../../services/api';
import { useRouter } from 'next/dist/client/router';

interface SubscribeButtonProps {
    priceId: string;
}

export default function SubscribeButton({ priceId }: SubscribeButtonProps) {
    const [session] = useSession();
    const router = useRouter()

    async function handleSubscribe(){

        if(!session) {
            signIn('github')
            return;
        }


        if(session.activeSubscription) {
            router.push('/posts')
            return;
        }

        try {
            const response = await api.post('/subscribe');
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
