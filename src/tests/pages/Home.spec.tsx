import { render, screen } from '@testing-library/react';
import { createMock } from 'ts-jest-mock';
import Home, { getStaticProps } from '../../pages';
import { stripe } from '../../services/stripe';
jest.mock('next/router');

jest.mock('../../services/stripe.ts');

jest.mock('next-auth/client', () => {
    return {
        useSession() {
            return [null, false];
        },
    };
});

describe('Home.spec.tsx', () => {
    it('should render correctly', () => {
        render(
            <Home
                product={{ priceId: 'fake-price-id', amount: 'fake-amount' }}
            />
        );

        expect(screen.getByText(/fake-amount/i)).toBeInTheDocument();
    });

    it('loads initial data', async () => {
        const retrieveStripePricesMocked = createMock(stripe.prices.retrieve);

        retrieveStripePricesMocked.mockResolvedValueOnce({
            id: 'fake-price-id',
            unit_amount: 1000,
        } as any);

        const response = await getStaticProps({});

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    product: {
                        priceId: 'fake-price-id',
                        amount: '$10.00',
                    },
                },
            })
        );
    });
});
