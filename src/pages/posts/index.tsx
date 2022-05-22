import React from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import styles from './styles.module.scss';
import { getPrismisClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';
import Link from 'next/link';

interface Post {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
}

interface PostsProps {
    posts: Post[];
}

export default function Post({ posts }: PostsProps) {
    return (
        <>
            <Head>
                <title>Posts | dp.news</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.postsList}>
                    {posts.map((post) => (
                        <Link href={`/posts/${post.slug}`} key={post.slug}>
                            <a>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismisClient();

    const respose = await prismic.query(
        [Prismic.predicates.at('document.type', 'post')],
        {
            fetch: ['post.title', 'post.content'],
            pageSize: 100,
        }
    );

    const posts = respose.results.map((post) => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt:
                post.data.content.find((content) => content.type == 'paragraph')
                    ?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString(
                'pt-BR',
                {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                }
            ),
        };
    });

    return {
        props: {
            posts,
        },
    };
};
