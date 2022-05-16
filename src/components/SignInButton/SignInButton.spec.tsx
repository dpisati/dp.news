import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/client';
import { createMock } from 'ts-jest-mock';
import SignInButton from '.';

jest.mock('next-auth/client');

describe('SignInButton component', () => {
    it('renders correctly when user isnt authenticated', () => {
        const useSessionMocked = createMock(useSession);
        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<SignInButton />);

        expect(screen.getByText('Sign In with GitHub')).toBeInTheDocument();
    });

    it('renders correctly when user is authenticated', () => {
        const useSessionMocked = createMock(useSession);
        useSessionMocked.mockReturnValueOnce([
            {
                user: { name: 'John Doe', email: 'jdoe@example.com' },
                expires: 'fake-expires',
            },
            true,
        ]);

        render(<SignInButton />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
});
