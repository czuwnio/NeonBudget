# Handoff Report — App Boilerplate & Testing Setup Recommendations

## 1. Observation
- The workspace root `c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget` is currently uninitialized, containing only `.agents/` and a root-level `ORIGINAL_REQUEST.md` file.
- Ran command `node -v; npm -v; yarn -v; pnpm -v` in the project root:
  - Node.js version is: `v24.16.0`.
  - npm script invocation directly via PowerShell was blocked by execution policies:
    ```
    npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
    ```
  - Standard command executor fallback: running `npm.cmd -v` and `npx.cmd -v` succeeded and returned version `11.13.0`.
  - Global `yarn` and `pnpm` are not installed or not in the PATH.
- Read `.agents/orchestrator/plan.md` and `.agents/sub_orch_m1/SCOPE.md`:
  - `plan.md` defines the project color tokens: `DARK_BACKGROUND: '#0D0D11'`, `SURFACE_DARK: '#161622'`, `NEON_PURPLE: '#C084FC'`, `NEON_GREEN: '#4ADE80'`, `GLASS_BACKGROUND: 'rgba(255, 255, 255, 0.03)'`, `GLASS_BORDER: 'rgba(255, 255, 255, 0.08)'`, `TEXT_PRIMARY: '#FFFFFF'`, `TEXT_SECONDARY: '#9CA3AF'`.
  - `SCOPE.md` specifies files and directories required for Milestone 1 (tsconfig.json, app.json, jest.config.js, metro.config.js, and directories `src/components/`, `src/screens/`, `src/services/`, `src/theme/`).

---

## 2. Logic Chain
- **Node.js Environment**: The presence of Node.js (`v24.16.0`) and npm/npx (`11.13.0`) means standard packages can be installed using npm commands. Windows script restrictions require using `npm.cmd` or executing npm with bypass properties, but the standard `npm install` instructions are structurally correct.
- **Expo SDK Version Choice**: Since we are initializing in 2026, we target **Expo SDK 52** (stable release).
  - SDK 52 uses React Native `0.76.0` and React `18.3.1`.
  - Testing libraries (`jest-expo` and `react-test-renderer`) must align exactly to avoid runtime type and version mismatch errors (specifically, `react-test-renderer` must match React `18.3.1` exactly).
- **TypeScript Integration**: Extending `"extends": "expo/tsconfig.base"` in `tsconfig.json` ensures that Expo's asset resolving, JSX, and compiler settings are inherited. To avoid deeply nested relative imports, path aliases (`@/*` mapping to `src/*`) are recommended.
- **Path Resolution**: To implement `@/*` path resolution, we require `babel-plugin-module-resolver`. The alias must be declared in:
  1. `tsconfig.json` for editor autocompletion and compiler safety.
  2. `babel.config.js` via the module resolver plugin for runtime Metro resolution.
  3. `jest.config.js` via `moduleNameMapper` for test-time file loading.
- **Visual Alignment**: The app's design system specifies a dark background (`#0D0D11`). Configuring this in `app.json` for the splash screen background and adaptive icon background ensures a seamless dark mode startup experience.

---

## 3. Caveats
- Since this is a read-only investigation, the configurations have not been written to the root directory. The implementer must execute the commands to write these files.
- Command execution on this host is subject to Windows execution policies. When executing npm scripts, the implementer may need to run `npm.cmd` explicitly or set the PowerShell ExecutionPolicy to `Bypass`.
- Native assets (`./assets/icon.png`, `./assets/splash.png`, and `./assets/adaptive-icon.png`) do not exist yet. Running `npx expo start` will warn about these missing files until placeholder PNG files are added to an `/assets` folder.

---

## 4. Conclusion
We recommend configuring the boilerplate using Expo SDK 52, Jest 29, and React Native Testing Library 12. Below are the recommended implementation strategy, dependencies, folder structure, and configurations.

### 4.1 Recommended Implementation Strategy
To initialize the repository, the implementer should follow these steps:
1. Initialize a package.json by creating it with the recommended content.
2. Create `tsconfig.json`, `babel.config.js`, `jest.config.js`, `app.json`, and `metro.config.js` in the project root.
3. Install production and dev dependencies via npm.
4. Create the recommended folder structure (inside `/src` and `/assets`).
5. Write `App.tsx` and `__tests__/App.test.tsx`.
6. Verify the setup by running the type checker and Jest unit tests.

### 4.2 List of Packages
#### Production Dependencies
| Package | Version | Purpose |
|---|---|---|
| `expo` | `~52.0.0` | Core Expo framework |
| `expo-status-bar` | `~2.0.0` | Status bar component customizer |
| `react` | `18.3.1` | UI component library |
| `react-native` | `0.76.0` | Core React Native runtime |

#### Development Dependencies
| Package | Version | Purpose |
|---|---|---|
| `@babel/core` | `^7.25.2` | JavaScript/TypeScript compilation |
| `@testing-library/react-native` | `^12.8.0` | React Native Testing Library (RNTL) for unit testing |
| `@types/jest` | `^29.5.12` | Type definitions for Jest assertions |
| `@types/react` | `~18.3.12` | Type definitions for React components |
| `@types/react-test-renderer` | `^18.3.0` | Type definitions for test rendering |
| `babel-plugin-module-resolver` | `^5.0.2` | Enables path alias resolution in Babel/Metro |
| `jest` | `^29.2.1` | JavaScript test runner |
| `jest-expo` | `~52.0.0` | Expo custom environment mocks for Jest |
| `react-test-renderer` | `18.3.1` | Render tree analyzer (must match React version exactly) |
| `typescript` | `~5.3.3` | Expo SDK 52-compatible TypeScript compiler |

---

### 4.3 Exact Configurations

#### `package.json`
```json
{
  "name": "neon-budget",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "ts:check": "tsc",
    "test": "jest --watchAll=false",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@testing-library/react-native": "^12.8.0",
    "@types/jest": "^29.5.12",
    "@types/react": "~18.3.12",
    "@types/react-test-renderer": "^18.3.0",
    "babel-plugin-module-resolver": "^5.0.2",
    "jest": "^29.2.1",
    "jest-expo": "~52.0.0",
    "react-test-renderer": "18.3.1",
    "typescript": "~5.3.3"
  },
  "private": true
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
      "@/*": ["./src/*"]
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
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/theme/*.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
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

#### `metro.config.js`
```javascript
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
```

#### `babel.config.js`
```javascript
module.exports = function (api) {
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
```

---

### 4.4 Directory Structure
```
NeonBudget/
├── .agents/                    # Agent metadata (plans, progress, handoffs)
├── assets/                     # App assets (icons, splash screen)
│   ├── adaptive-icon.png       # Android adaptive icon foreground
│   ├── favicon.png             # Web favicon
│   ├── icon.png                # iOS / global icon
│   └── splash.png              # App splash screen image
├── src/                        # Source directory
│   ├── components/             # Reusable UI elements (GlassCard, NeonButton, Charts)
│   ├── screens/                # App screens (Dashboard, Transactions, Form)
│   ├── services/               # Storage and API logic (AsyncStorage wrappers)
│   ├── theme/                  # Design system tokens and styles
│   └── utils/                  # Date parsing, currency formatters
├── __tests__/                  # App-wide test directory
│   └── App.test.tsx            # Initial verification test
├── App.tsx                     # Entry point
├── babel.config.js             # Babel compile presets & path resolver config
├── jest.config.js              # Jest runner options
├── metro.config.js             # Metro bundler config
├── package.json                # Project dependencies and script runner
└── tsconfig.json               # TypeScript compiler config
```

---

### 4.5 Core Files Source Code

#### `App.tsx`
```tsx
import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

// Simple design system mapping matching theme.ts specifications
const THEME = {
  DARK_BACKGROUND: '#0D0D11',
  SURFACE_DARK: '#161622',
  NEON_PURPLE: '#C084FC',
  NEON_GREEN: '#4ADE80',
  GLASS_BACKGROUND: 'rgba(255, 255, 255, 0.03)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.08)',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#9CA3AF',
};

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>
          NEON<Text style={styles.accentText}>BUDGET</Text>
        </Text>
        <Text style={styles.subtitle}>Sleek Transaction Tracker</Text>
      </View>

      {/* GlassCard Component Simulator */}
      <View style={styles.glassCard} testID="glass-card">
        <Text style={styles.cardTitle}>Current Balance</Text>
        <Text style={styles.balanceText}>$0.00</Text>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Income</Text>
            <Text style={styles.incomeText}>+$0.00</Text>
          </View>
          <View>
            <Text style={styles.rowLabel}>Expenses</Text>
            <Text style={styles.expenseText}>-$0.00</Text>
          </View>
        </View>
      </View>

      {/* NeonButton Component Simulator */}
      <View style={styles.buttonContainer}>
        <View style={styles.neonButton} testID="neon-button">
          <Text style={styles.buttonText}>GET STARTED</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.TEXT_PRIMARY,
    letterSpacing: 2,
  },
  accentText: {
    color: THEME.NEON_PURPLE,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.TEXT_SECONDARY,
    marginTop: 8,
  },
  glassCard: {
    width: '100%',
    backgroundColor: THEME.GLASS_BACKGROUND,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.GLASS_BORDER,
    shadowColor: THEME.NEON_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: THEME.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: THEME.TEXT_PRIMARY,
    marginVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.GLASS_BORDER,
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 12,
    color: THEME.TEXT_SECONDARY,
    marginBottom: 4,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.NEON_GREEN,
  },
  expenseText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.TEXT_PRIMARY,
  },
  buttonContainer: {
    marginTop: 40,
    width: '100%',
  },
  neonButton: {
    backgroundColor: THEME.SURFACE_DARK,
    borderWidth: 1.5,
    borderColor: THEME.NEON_PURPLE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: THEME.NEON_PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: THEME.TEXT_PRIMARY,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1.5,
  },
});
```

#### `__tests__/App.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../App';

describe('App Root Entry', () => {
  it('renders NeonBudget header, balance card, and button', () => {
    render(<App />);

    // Assert that the app title is present
    expect(screen.getByText(/NEON/i)).toBeTruthy();
    expect(screen.getByText(/BUDGET/i)).toBeTruthy();
    expect(screen.getByText(/Sleek Transaction Tracker/i)).toBeTruthy();

    // Assert that the glass card balance simulator is rendered
    expect(screen.getByTestId('glass-card')).toBeTruthy();
    expect(screen.getByText(/Current Balance/i)).toBeTruthy();
    expect(screen.getByText(/\$0\.00/i)).toBeTruthy();

    // Assert that the neon button is rendered
    expect(screen.getByTestId('neon-button')).toBeTruthy();
    expect(screen.getByText(/GET STARTED/i)).toBeTruthy();
  });
});
```

---

## 5. Verification Method

To independently verify that the environment works and this configuration compiles/passes tests, run the following commands sequentially from the project root:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run TypeScript Compiler checks**:
   ```bash
   npm run ts:check
   ```
   *Pass Condition*: The command exits with `0` and outputs no compilation/type errors.
3. **Run Jest unit tests**:
   ```bash
   npm run test
   ```
   *Pass Condition*: Jest starts up, successfully mock-renders the `App.tsx` component, passes the test suite in `__tests__/App.test.tsx`, and displays a coverage table showing coverage for `App.tsx`.
