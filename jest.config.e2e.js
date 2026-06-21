module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFiles: ['<rootDir>/jest-setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup-after-env.ts'],
  testMatch: ['**/__tests__/e2e/**/*.test.(ts|tsx|js|jsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
