import { render, screen, fireEvent } from '@testing-library/react';
import { useSession, signIn } from 'next-auth/client';
import { createMock } from 'ts-jest-mock';
import { useRouter } from 'next/dist/client/router';
import SubscribeButton from '.';

jest.mock('next-auth/client');
jest.mock('next/dist/client/router');

describe('SubscribeButton component', () => {
    it('renders correctly', () => {
        const useSessionMocked = createMock(useSession);
        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<SubscribeButton />);

        expect(screen.getByText('Subscribe now')).toBeInTheDocument();
    });

    it('redirects user to sign in when not authenticated', () => {
        const useSessionMocked = createMock(useSession);
        useSessionMocked.mockReturnValueOnce([null, false]);
        render(<SubscribeButton />);

        const subscribeButton = screen.getByText('Subscribe now');
        const signInMocked = createMock(signIn);

        fireEvent.click(subscribeButton);

        expect(signInMocked).toHaveBeenCalled();
    });

    it('redirects user to posts when user already has subscription', () => {
        const useRouterMocked = createMock(useRouter);
        const useSessionMocked = createMock(useSession);
        const pushMock = jest.fn();

        useSessionMocked.mockReturnValueOnce([
            {
                user: { name: 'John Doe', email: 'jdoe@example.com' },
                activeSubscription: 'fake-active-subscription',
                expires: 'fake-expires',
            },
            true,
        ]);

        useRouterMocked.mockReturnValueOnce({
            push: pushMock,
        } as any);

        render(<SubscribeButton />);

        const subscribeButton = screen.getByText('Subscribe now');

        fireEvent.click(subscribeButton);

        expect(pushMock).toHaveBeenCalledWith('/posts');
    });
});
