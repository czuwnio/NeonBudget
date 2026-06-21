# Handoff Report — Explorer 2 (Milestone 1: App Boilerplate & Testing Setup)

This report details the recommended initialization strategy and exact file configurations for the NeonBudget React Native/Expo project using TypeScript, Jest, and React Native Testing Library.

---

## 1. Observation

1. **Workspace Inspection**:
   - The directory `c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget` is empty except for the `.agents` metadata folder and the original request markdown file. No source files, folders, or project configuration files (`package.json`, `app.json`, etc.) currently exist.
2. **Environment Analysis**:
   - Terminal verification commands:
     `node --version; cmd.exe /c npm --version; cmd.exe /c npx --version`
   - Output observed:
     - Node.js: `v24.16.0`
     - npm: `11.13.0`
     - npx: `11.13.0`
   - Global package managers `yarn`, `pnpm`, and `bun` are not recognized cmdlets on the system.
   - The default PowerShell environment has a script execution policy block preventing the direct execution of script-based files (like `npm.ps1` or `yarn.ps1`). Executions of npm must be run using `cmd.exe /c npm` or with PowerShell execution policies bypassed (e.g., `-ExecutionPolicy Bypass`).
3. **Milestone & Architecture Context**:
   - `sub_orch_m1/SCOPE.md` specifies:
     - Application source root: `src/`
     - Subdirectories: `src/components/`, `src/screens/`, `src/services/`, `src/theme/`
     - Unit tests co-located or under `__tests__/`
     - Main entry points: `App.tsx` or `index.ts`
   - `orchestrator/plan.md` specifies:
     - Design tokens:
       - Background color: `#0D0D11`
       - Surface Dark: `#161622`
       - Neon Purple: `#C084FC`
       - Neon Green: `#4ADE80`
       - Glass Background: `rgba(255, 255, 255, 0.03)`
       - Glass Border: `rgba(255, 255, 255, 0.08)`
       - Text Primary: `#FFFFFF`
       - Text Secondary: `#9CA3AF`
     - AsyncStorage wrapper: `@react-native-async-storage/async-storage`

---

## 2. Logic Chain

1. **Package Manager Choice**: Since Node.js `v24.16.0` and npm `11.13.0` are installed and available globally, while yarn/pnpm/bun are missing, **npm** is the target package manager for this project. Because PowerShell blocks script execution, CLI commands during the worker phase should be run through `cmd.exe /c` or with execution policy bypass flags.
2. **Framework Version Choice**: Expo SDK 51 (React Native 0.74.5, React 18.2.0) is selected as it represents a highly stable, well-supported platform version for local storage (AsyncStorage) and testing modules (Jest 29, `@testing-library/react-native` 12.5) running on modern Node.js environments.
3. **Testing Mock Requirement**: The project relies on `@react-native-async-storage/async-storage`. During Jest tests, which run in a pure Node environment without native modules, any attempt to import or call AsyncStorage will crash. Thus, a global Jest setup file (`jest.setup.js`) is required to mock the AsyncStorage API before running any test files.
4. **Theme Configuration**: To maintain visual consistency from the start, a static design token configuration file (`src/theme/theme.ts`) should export the exact hex and RGBA values defined in the global plan.

---

## 3. Caveats

1. **Node.js 24 compatibility**: Since Node 24 is a very recent version, npm might print peer dependency warnings during install (e.g. for older tooling). These are harmless and can be bypassed, but executing with `--legacy-peer-deps` is recommended if npm encounters resolving conflicts.
2. **Babel presets**: The transpilation of typescript files containing JSX requires `babel-preset-expo`. A `babel.config.js` is included in our recommendations to ensure tests transpiled by Jest function correctly.

---

## 4. Conclusion

We recommend initializing the boilerplate with the following structure, dependencies, and configuration templates.

### Recommended Folder Structure
```
NeonBudget/
├── .agents/
├── assets/
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash.png
├── src/
│   ├── components/
│   ├── screens/
│   ├── services/
│   └── theme/
│       └── theme.ts
├── __tests__/
│   └── App.test.tsx
├── App.tsx
├── app.json
├── babel.config.js
├── jest.config.js
├── jest.setup.js
├── metro.config.js
├── package.json
└── tsconfig.json
```

---

### Configuration File Specifications

#### 1. `package.json`
```json
{
  "name": "neon-budget",
  "version": "1.0.0",
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "ts:check": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.23.1",
    "expo": "~51.0.38",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.5"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@testing-library/react-native": "^12.5.0",
    "@types/jest": "^29.5.12",
    "@types/react": "~18.2.79",
    "@types/react-test-renderer": "^18.0.7",
    "jest": "^29.2.1",
    "jest-expo": "~51.0.0",
    "react-test-renderer": "18.2.0",
    "typescript": "~5.3.3"
  },
  "private": true
}
```

#### 2. `tsconfig.json`
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

#### 3. `babel.config.js`
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

#### 4. `jest.config.js`
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/react-native/extend-expect'
  ],
  setupFiles: [
    './jest.setup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'App.tsx',
    '!src/**/*.d.ts',
    '!src/theme/**'
  ]
};
```

#### 5. `jest.setup.js`
```javascript
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
```

#### 6. `app.json`
```json
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
```

#### 7. `metro.config.js`
```javascript
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
```

---

### Core Implementation Files

#### `src/theme/theme.ts`
```typescript
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
```

#### `App.tsx` (Entry File)
```typescript
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/theme/theme';

export default function App() {
  return (
    <SafeAreaView style={styles.container} testID="app-safe-area">
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title} testID="app-title">
          NeonBudget
        </Text>
        <Text style={styles.subtitle}>
          Track your expenses in style
        </Text>
        
        {/* Neon Card Placeholder */}
        <View style={styles.card} testID="welcome-card">
          <Text style={styles.cardText}>
            Welcome to the ultimate dark-themed personal finance tracker.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textShadowColor: theme.colors.neonPurple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  card: {
    backgroundColor: theme.colors.surfaceDark,
    borderColor: theme.colors.glassBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    shadowColor: theme.colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

#### `__tests__/App.test.tsx` (Verification Test)
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App Component', () => {
  it('renders title and welcome message correctly', () => {
    const { getByTestId, getByText } = render(<App />);
    
    // Check if App title renders
    const titleElement = getByTestId('app-title');
    expect(titleElement).toBeTruthy();
    expect(getByText('NeonBudget')).toBeTruthy();
    
    // Check if the welcome card renders
    const cardElement = getByTestId('welcome-card');
    expect(cardElement).toBeTruthy();
  });
});
```

---

## 5. Verification Method

To verify this configuration independently on the target system:

1. **Environment Setup & Dependency Install**:
   Ensure dependencies are installed using npm:
   ```cmd
   cmd.exe /c "npm install --legacy-peer-deps"
   ```
2. **TypeScript Compilation Verification**:
   Verify typescript config checks pass successfully:
   ```cmd
   cmd.exe /c "npm run ts:check"
   ```
   No compilation errors should occur.
3. **Jest Unit Test Execution**:
   Run the test runner to execute the test cases:
   ```cmd
   cmd.exe /c "npm test"
   ```
   The test should output the execution details, indicating that the `App Component` rendering test passes, showing `1 passed, 1 total` and providing a coverage report.
4. **Invalidation conditions**:
   - Test execution failure (e.g. due to missing modules or incorrect Babel/Jest versions).
   - TypeScript checking errors due to mismatch in React Native / Expo types.
