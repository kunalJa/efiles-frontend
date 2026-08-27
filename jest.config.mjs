import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

export default createJestConfig({
  testEnvironment: "node",
  clearMocks: true,
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["**/__tests__/**/*.test.ts"],
});
