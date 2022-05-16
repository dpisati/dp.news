// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */

module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/.next/'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)?$': 'babel-jest',
    },
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(scss|css|sass)$': 'identity-obj-proxy',
    },
};
