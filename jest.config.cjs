/** @type {import("jest").Config} */
module.exports = {
    testEnvironment: "jsdom",

    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },

    testPathIgnorePatterns: ["/node_modules/", "<rootDir>/tests/e2e/"],

    transform: {
        "^.+\\.(ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.json",
            },
        ],
    },

    collectCoverageFrom: [
        "components/**/*.{ts,tsx}",
        "features/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "store/**/*.{ts,tsx}",
        "!**/*.d.ts",
    ],
};
