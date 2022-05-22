import { render, screen } from '@testing-library/react';
import { createMock } from 'ts-jest-mock';
import Posts, { getStaticProps } from '../../pages/posts';
import { getPrismisClient } from '../../services/prismic';

const posts = [
    {
        slug: 'my-fake-post',
        title: 'My Fake Post',
        excerpt: 'Post excerpt',
        updatedAt: 'March 10',
    },
];

jest.mock('../../services/prismic');

describe('Posts.spec.tsx', () => {
    it('should render correctly', () => {
        render(<Posts posts={posts} />);

        expect(screen.getByText('My Fake Post')).toBeInTheDocument();
    });

    it('loads initial data', async () => {
        const getPrismicClientMocked = createMock(getPrismisClient);

        getPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [
                    {
                        uid: 'my-fake-post',
                        data: {
                            title: [{ type: 'heading', text: 'My Fake Post' }],
                            content: [{ type: 'paragraph', text: 'Content' }],
                        },
                        last_publication_date: '04-02-1999',
                    },
                ],
            }),
        } as any);

        const response = await getStaticProps({});

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    posts: [
                        {
                            slug: 'my-fake-post',
                            title: 'My Fake Post',
                            excerpt: 'Content',
                            updatedAt: '02 de abril de 1999',
                        },
                    ],
                },
            })
        );
    });
});
