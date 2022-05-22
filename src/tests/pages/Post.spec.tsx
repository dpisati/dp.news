import { render, screen } from '@testing-library/react';
import { getSession } from 'next-auth/client';
import { createMock } from 'ts-jest-mock';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismisClient } from '../../services/prismic';

const post = {
    slug: 'my-fake-post',
    title: 'My Fake Post',
    content: '<p>Post excerpt</p>',
    updatedAt: 'March 10',
};

jest.mock('next-auth/client');

jest.mock('../../services/prismic');

describe('Post.spec.tsx', () => {
    it('should render correctly', () => {
        render(<Post post={post} />);

        expect(screen.getByText('My Fake Post')).toBeInTheDocument();
        expect(screen.getByText('Post excerpt')).toBeInTheDocument();
    });

    it('redirects user if no subscription is found', async () => {
        const getSessionMocked = createMock(getSession);

        getSessionMocked.mockResolvedValueOnce(null);

        const response = await getServerSideProps({
            params: { slug: 'my-fake-post' },
        } as any);

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: '/',
                }),
            })
        );
    });

    it('loads initial data', async () => {
        const getSessionMocked = createMock(getSession);
        const getPrismicClientMocked = createMock(getPrismisClient);

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription',
        } as any);

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [{ type: 'heading', text: 'My Fake Post' }],
                    content: [{ type: 'paragraph', text: 'Content' }],
                },
                last_publication_date: '04-02-1999',
            }),
        } as any);

        const response = await getServerSideProps({
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
