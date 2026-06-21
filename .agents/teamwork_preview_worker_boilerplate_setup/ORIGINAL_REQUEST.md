## 2026-06-20T00:10:58Z
You are the Worker for the NeonBudget project, executing Milestone 1: App Boilerplate & Testing Setup.
Your working directory is: c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\.agents\teamwork_preview_worker_boilerplate_setup
Your parent is: sub_orch_m1 (conversation ID: 6293528d-4fb0-474e-8a26-d10b4ffac35d)

Mission:
Initialize the React Native/Expo application with TypeScript, Jest, React Native Testing Library, and the core folder structure.
Specifically:
1. Create `package.json` in the project root with the following config:
{
  "name": "neon-budget",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "ts:check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "~1.23.1",
    "expo": "~52.0.49",
    "expo-status-bar": "~2.0.1",
    "react": "18.3.1",
    "react-native": "0.76.9"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@testing-library/react-native": "^13.0.0",
    "@types/jest": "^29.5.12",
    "@types/react": "~18.3.12",
    "@types/react-test-renderer": "^18.3.0",
    "babel-plugin-module-resolver": "^5.0.2",
    "jest": "^29.2.1",
    "jest-expo": "~52.0.6",
    "react-test-renderer": "18.3.1",
    "typescript": "~5.3.3"
  },
  "private": true
}

2. Create `tsconfig.json` in the project root:
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

3. Create `jest.config.js` in the project root:
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  setupFiles: ['./jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'App.tsx',
    '!src/**/*.d.ts',
    '!src/theme/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

4. Create `jest.setup.js` in the project root:
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

5. Create `babel.config.js` in the project root:
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};

6. Create `app.json` in the project root:
{
  "expo": {
    "name": "NeonBudget",
    "slug": "neon-budget",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0D0D11"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0D0D11"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}

7. Create `metro.config.js` in the project root:
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;

8. Create the core directory structure and theme colors file `src/theme/theme.ts`:
export const theme = {
  colors: {
    background: '#0D0D11',
    surfaceDark: '#161622',
    neonPurple: '#C084FC',
    neonGreen: '#4ADE80',
    glassBackground: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
  },
};

9. Create `src/components/`, `src/screens/`, `src/services/` (with .gitkeep files to ensure they exist).
10. Create the entry file `App.tsx` and the test file `__tests__/App.test.tsx` at the project root using standard Expo boilerplate styles aligning with the plan's dark/neon colors and including components and test IDs to ensure tests pass.
11. Run `npm install` (using `cmd.exe /c npm install --legacy-peer-deps` or standard npm if it works) and execute unit tests via `cmd.exe /c npm test` or `cmd.exe /c npm run ts:check` to verify that everything works correctly.
12. Create your own briefing.md and progress.md in your working directory.
13. Write a structured handoff report (handoff.md) in your working directory detailing the files created, installation output, and passing test outcomes.
