# E2E Test Infra: NeonBudget

## Test Philosophy
- **Opaque-Box, Requirement-Driven**: The tests do not import internal functions or state hooks. Instead, they mount the full `<App />` component and interact with the UI through accessibility labels and text matching, representing a true end-user experience.
- **Data Isolation**: Local storage is mocked in-memory, resetting state before each test suite execution. This guarantees repeatable, side-effect-free, and 100% offline-predictable testing.
- **Systematic Test Design**: Tests follow the 4-tier methodology (Feature Coverage, Boundary Value Analysis, Pairwise Combinations, and Real-World User Workflows).

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Core Transactions Form & List | ORIGINAL_REQUEST §R1 | 5      | 6      | ✓      |
| 2 | Data Storage Persistence | ORIGINAL_REQUEST §R2 | 2      | 1      | ✓      |
| 3 | Dashboard & Category Chart | ORIGINAL_REQUEST §R3 | 3      | 2      | ✓      |

## Test Architecture
- **Test Runner**: Jest configured via `jest.config.e2e.js` using standard `jest-expo` environment.
- **Invocation Command**: `npm run test:e2e` (or `npm run test` to run all unit and E2E suites).
- **Setup Scripts**: `jest-setup.ts` (mocks AsyncStorage, Gesture Handler, and Native Animations) and `jest-setup-after-env.ts` (sets up matching extensions).
- **Directory Layout**:
  ```
  __tests__/e2e/
  ├── tier1_features.test.tsx      # Tier 1: Core Feature Verification (10 tests)
  ├── tier2_boundaries.test.tsx    # Tier 2: Boundary & Edge Cases (9 tests)
  ├── tier3_combinations.test.tsx  # Tier 3: Cross-Feature Interactions (4 tests)
  └── tier4_workflows.test.tsx     # Tier 4: Real-world User Journeys (3 tests)
  ```

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Monthly Budgeting Flow | F1, F2, F3 | Medium |
| 2 | Deficit Spending & Recovery | F1, F3 | Medium |
| 3 | App Crash/Reload Continuity | F1, F2, F3 | High |

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: Verified that all core requirements (Adding, Categorization, Listing, storage triggers, calculations, empty states) have dedicated test coverage.
- **Tier 2 (Boundary & Corner Cases)**: Verified bounds for amount inputs (zero, negative, decimal precision, numeric filtering), description bounds (special chars, long strings), calculations (net zero), and storage errors.
- **Tier 3 (Cross-Feature Combinations)**: Verified interactions between form submission, storage writes, list additions, dynamic chart segments, and type toggles.
- **Tier 4 (Real-world Scenarios)**: Verified sequential user pathways to confirm budget limits, recovery, and persistence.
