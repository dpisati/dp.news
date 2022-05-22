import { render, screen } from '@testing-library/react';
import { getSession, useSession } from 'next-auth/client';
import { useRouter } from 'next/dist/client/router';
import { createMock } from 'ts-jest-mock';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismisClient } from '../../services/prismic';

const post = {
    slug: 'my-fake-post',
    title: 'My Fake Post',
    content: '<p>Post excerpt</p>',
    updatedAt: 'March 10',
};

jest.mock('next-auth/client');
jest.mock('next/dist/client/router');
jest.mock('../../services/prismic');

describe('PostPreview.spec.tsx', () => {
    it('should render correctly', () => {
        const useSessionMocked = createMock(useSession);

        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<Post post={post} />);

        expect(screen.getByText('My Fake Post')).toBeInTheDocument();
        expect(screen.getByText('Post excerpt')).toBeInTheDocument();
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
    });

    it('redirects user to full post when subscribed', async () => {
        const useSessionMocked = createMock(useSession);
        const useRouterMocked = createMock(useRouter);
        const pushMock = jest.fn();

        useSessionMocked.mockReturnValueOnce([
            { activeSubscription: 'fake-active-subscription' },
            false,
        ] as any);

        useRouterMocked.mockReturnValueOnce({
            push: pushMock,
        } as any);

        render(<Post post={post} />);

        expect(pushMock).toHaveBeenCalledWith('/posts/my-fake-post');
    });

    it('loads initial data', async () => {
        const getPrismicClientMocked = createMock(getPrismisClient);

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [{ type: 'heading', text: 'My Fake Post' }],
                    content: [{ type: 'paragraph', text: 'Content' }],
                },
                last_publication_date: '04-02-1999',
            }),
        } as any);

        const response = await getStaticProps({
            params: { slug: 'my-fake-post' },
        } as any);

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-fake-post',
                        title: 'My Fake Post',
                        content: '<p>Content</p>',
                        updatedAt: '02 de abril de 1999',
                    },
                },
            })
        );
    });
});
