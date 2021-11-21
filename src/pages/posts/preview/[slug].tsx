import React, { useEffect } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { getSession, useSession } from 'next-auth/client'
import Head from 'next/head'
import { RichText } from 'prismic-dom'
import { getPrismisClient } from '../../../services/prismic'

import styles from '../post.module.scss'
import Link from 'next/Link'
import { useRouter } from 'next/dist/client/router'
import { redirect } from 'next/dist/server/api-utils'

interface PostPreviewProps {
    post: {
        slug: string
        title: string
        content: string
        updatedAt: string
    }
}

export default function PostPreview({ post }: PostPreviewProps) {
    const [session] = useSession();
    const router = useRouter();

    useEffect(() => {
        if(session?.activeSubscription) {
            router.push(`/posts/${post.slug}`)
        }
    }, [session])

    return (
        <>
            <Head>
                <title>{post.title} | dp.news</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>

                    <div 
                        className={`${styles.postContent} ${styles.previewContent}`}
                        dangerouslySetInnerHTML={{__html: post.content}} 
                    />

                    <div className={styles.continueReading}>
                        Wanna continue reading? 
                        <Link href="/">
                            <a>Subscribe now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params;
    const prismic = getPrismisClient()
    const response = await prismic.getByUID('post', String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content.splice(0, 3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }
    
    return {
        props: {
            post
        },
        redirect: 60 * 30 //30 min
    }
}