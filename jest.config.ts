import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@routes/(.*)$": "<rootDir>/src/main/routes/$1",
    "^@controllers/(.*)$": "<rootDir>/src/main/controllers/$1",
    "^@services/(.*)$": "<rootDir>/src/main/services/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/main/middlewares/$1"
  }
};

export default config;
