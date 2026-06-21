# Handoff Report — Explorer 3 (Milestone 1)

## 1. Observation

During the read-only investigation, the following commands and results were observed:

- **Environment Verification**:
  - Command: `node -v`
    - Result: `v24.16.0`
  - Command: `npm.cmd -v`
    - Result: `11.13.0`
  - Command: `git --version`
    - Result: `git version 2.54.0.windows.1`
- **Workspace State**:
  - The root workspace `c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget` is empty save for `.agents/` and `ORIGINAL_REQUEST.md`.
- **Package Versions Lookup**:
  - Command: `npm.cmd dist-tag ls expo`
    - Result: `sdk-52: 52.0.49`, `sdk-56: 56.0.12` (latest)
  - Command: `npm.cmd show expo-template-blank-typescript@52 dependencies`
    - Result: `expo: ~52.0.0` (latest template uses `~52.0.30+` which locks dependencies to `react: 18.3.1` and `react-native: 0.76.9`)
  - Command: `npm.cmd show expo-template-blank-typescript@latest dependencies`
    - Result: `expo: ~56.0.12`, `react: 19.2.3`, `react-native: 0.85.3`
  - Command: `npm.cmd show @testing-library/react-native@14.0.0 peerDependencies`
    - Result:
      ```json
      {
        "jest": ">=29.0.0",
        "react": ">=19.0.0",
        "react-native": ">=0.78",
        "test-renderer": "^1.0.0"
      }
      ```
  - Command: `npm.cmd show @testing-library/react-native@13.0.0 peerDependencies`
    - Result:
      ```json
      {
        "jest": ">=29.0.0",
        "react": ">=18.2.0",
        "react-native": ">=0.71",
        "react-test-renderer": ">=18.2.0"
      }
      ```

## 2. Logic Chain

1. **Environment Compatibility**: Based on `node -v` showing `v24.16.0` (which satisfies the Node.js requirement of `>=18.0.0` for recent Expo versions) and `npm -v` showing `11.13.0`, the system has all required tools ready to initialize and run the app.
2. **Choice of Stack**:
   - Expo SDK 52 uses React `18.3.1` and React Native `0.76.9`.
   - The latest Expo SDK (SDK 56) uses React `19.2.3` and React Native `0.85.3`.
3. **Testing Library Constraints**:
   - Since `@testing-library/react-native@14.0.0` requires `react: >=19.0.0` and `react-native: >=0.78`, it is **incompatible** with Expo SDK 52.
   - For Expo SDK 52, the team must use `@testing-library/react-native@^13.0.0` (which supports React 18.2.0+ and React Native 0.71+).
   - In addition, the version of `react-test-renderer` must match the React version exactly (`18.3.1` for Expo SDK 52, `18.2.0` for Expo SDK 51). If there is a mismatch, the Jest runner will crash during component tree serialization.
4. **Path Mapping**:
   - Defining `"paths": { "@/*": ["src/*"] }` in `tsconfig.json` enables clean alias imports. Expo's `babel-preset-expo` natively resolves these paths starting from Expo SDK 50.
   - Jest requires configuration of `moduleNameMapper` mapping `'^@/(.*)$': '<rootDir>/src/$1'` to understand the same aliases during test runs.

## 3. Caveats

- **Network Restrictive Mode**: The agent ran in `CODE_ONLY` mode, so no packages were actually installed or initialized in the source tree. This is an analysis report containing blueprints. The Worker agent must execute the creation.
- **Expo SDK 56 Adoption**: While Expo SDK 52 is recommended for enterprise stability (broader package compatibility with React 18), Expo SDK 56 is the absolute latest. Fallback dependencies for SDK 56 are provided if the team chooses to upgrade immediately.

## 4. Conclusion

The application boilerplate should be initialized using **Expo SDK 52** for maximum ecosystem stability, utilizing React 18.3.1, React Native 0.76.9, Jest 29, and React Native Testing Library v13.

### Recommended Directory Structure

```
NeonBudget/
├── .agents/                 # Read-only metadata
├── assets/                  # Media assets, icons, splash images
├── src/
│   ├── components/          # Shared atomic components (Button, Input, etc.)
│   ├── screens/             # Application screen containers (Dashboard, Settings, etc.)
│   ├── services/            # Storage, state, API clients, business logic
│   └── theme/               # Color theme definitions, spacing constants
│       └── colors.ts        # Color definition file
├── App.tsx                  # Main app entry file
├── App.test.tsx             # Root unit test verifying Jest + RNTL setup
├── app.json                 # Expo project configuration
├── babel.config.js          # Babel config
├── jest.config.js           # Jest configuration (includes alias mapper)
├── metro.config.js          # Metro bundler config
├── package.json             # Scripts and packages
└── tsconfig.json            # Strict TypeScript configuration
```

### Exact Configurations

#### `package.json` (Recommended: Expo SDK 52 Stack)
```json
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
    "jest": "^29.2.1",
    "jest-expo": "~52.0.6",
    "react-test-renderer": "18.3.1",
    "typescript": "~5.3.3"
  },
  "private": true
}
```

*Alternative Cutting-Edge (Expo SDK 56 Stack) Dependencies:*
```json
  "dependencies": {
    "expo": "~56.0.12",
    "expo-status-bar": "~56.0.4",
    "react": "19.2.3",
    "react-native": "0.85.3"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@testing-library/react-native": "^14.0.0",
    "@types/jest": "^29.5.12",
    "@types/react": "~19.2.2",
    "jest": "^29.2.1",
    "jest-expo": "~56.0.5",
    "typescript": "~6.0.3"
  }
```

#### `tsconfig.json`
```json
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
```

#### `jest.config.js`
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/theme/**',
  ],
};
```

#### `app.json`
```json
{
  "expo": {
    "name": "NeonBudget",
    "slug": "neon-budget",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#121212"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#121212"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

#### `metro.config.js`
```javascript
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
```

#### `babel.config.js`
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

#### `App.tsx`
```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <View style={styles.container} testID="app-container">
      <Text style={styles.title}>Welcome to NeonBudget</Text>
      <Text style={styles.subtitle}>Track your wealth with neon style</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
```

#### `App.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from './App';

describe('App Component', () => {
  it('renders correctly and matches snapshot', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('contains the welcome title', () => {
    render(<App />);
    const titleElement = screen.getByText('Welcome to NeonBudget');
    expect(titleElement).toBeTruthy();
  });

  it('contains the description subtitle', () => {
    render(<App />);
    const subtitleElement = screen.getByText('Track your wealth with neon style');
    expect(subtitleElement).toBeTruthy();
  });

  it('renders the container view', () => {
    render(<App />);
    const container = screen.getByTestId('app-container');
    expect(container).toBeTruthy();
  });
});
```

#### `src/theme/colors.ts`
```typescript
export const colors = {
  background: '#121212',
  primary: '#00ffff',     // Neon Cyan
  secondary: '#ff00ff',   // Neon Magenta
  accent: '#ffff00',      // Neon Yellow
  text: '#ffffff',
  textMuted: '#888888',
  border: '#333333',
  error: '#ff0055',
  success: '#00ff66',
};
```

## 5. Verification Method

To verify this setup, the Worker/Reviewer should:
1. Initialize the project directory files with the configurations specified above.
2. Run `npm install` (or `npm ci`) to install the dependencies.
3. Validate TypeScript type-checking using:
   ```bash
   npm run ts:check
   ```
   (Verify it exits with code 0 without any type violations).
4. Run Jest unit tests using:
   ```bash
   npm run test
   ```
   (Verify all tests pass and a snapshot file `__snapshots__/App.test.tsx.snap` is generated).
5. Verification fails if:
   - TypeScript flags errors in `App.tsx` or `App.test.tsx`.
   - `npm run test` fails or throws a `react-test-renderer` dependency mismatch warning.
