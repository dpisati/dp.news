import React from 'react'
import { FaGithub } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'

import styles from './styles.module.scss';

// @ts-ignore: Unreachable code error
import { signIn, signOut, useSession } from 'next-auth/client'

export default function SignInButton() {
    const [session] = useSession();

    return session ? (
        <button 
            type="button"
            className={styles.signInButton}
            onClick={() => signOut()}
        >
            <FaGithub color="#04d361" />
            {session.user.name}
            <FiX color="#737380" className={styles.closeIcon}/>
        </button>
    ) : (
        <button 
        type="button"
        className={styles.signInButton}
        onClick={() => signIn('github')}
    >
        <FaGithub color="#eba417" />
        Sign In with GitHub
    </button>
    )
}
