# Scope: Milestone 1 — App Boilerplate & Testing Setup

## Architecture
- Root Level: React Native application configured with Expo and TypeScript.
- Build/Config Files: package.json, tsconfig.json, app.json / app.config.js, jest.config.js, metro.config.js.
- Folder Structure:
  - `src/` - Application source root
  - `src/components/` - Shared UI components
  - `src/screens/` - Main application screen components
  - `src/services/` - Services (API client, storage, budget logic, etc.)
  - `src/theme/` - Color schemes, styles, typography
  - `__tests__/` or unit tests alongside source files.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1.1 | Project Directory & Configs | Initialize TypeScript, Expo configuration, package.json, tsconfig.json | None | PLANNED |
| 1.2 | Testing Setup (Jest & RNTL) | Install and configure jest, jest-expo, @testing-library/react-native, and verify with a dummy test | 1.1 | PLANNED |
| 1.3 | Core Directory Structure | Create src/, src/components/, src/screens/, src/services/, src/theme/ | 1.1 | PLANNED |
| 1.4 | Application Core Verification | Verify that the app can run (dry-run/start) and unit tests pass | 1.2, 1.3 | PLANNED |

## Interface Contracts
- Standard React Native/Expo CLI entry point (App.tsx / index.ts).
- Jest execution command (`npm test` or `npm run test` or `npx jest`).
