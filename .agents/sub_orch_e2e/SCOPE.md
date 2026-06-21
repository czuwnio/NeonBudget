# Scope: E2E Testing Track

## Architecture
- **E2E Test Runner**: Jest combined with `@testing-library/react-native` for rendering the full App component in a simulated React Native environment.
- **Opaque-Box Interaction**: The test suite interacts with the app purely via accessibility labels, UI text, and common UI elements.
- **Mocking**: Mock AsyncStorage to ensure offline data consistency and stability during tests.
- **UI Elements to target (Accessibility Labels / Text)**:
  - Add Transaction Form:
    - Input amount: accessibilityLabel = `amount-input`
    - Input description: accessibilityLabel = `description-input`
    - Category picker/buttons: accessibilityLabel = `category-picker` or text like `Food`, `Salary`, etc.
    - Transaction type toggle: accessibilityLabel = `type-toggle-income`, `type-toggle-expense`
    - Add button: accessibilityLabel = `add-transaction-button` or text `Add Transaction`
  - Transaction List:
    - Transaction items: accessibilityLabel = `transaction-item` or matching text
  - Summary / Dashboard:
    - Total Balance: accessibilityLabel = `total-balance`
    - Total Income: accessibilityLabel = `total-income`
    - Total Expense: accessibilityLabel = `total-expense`
    - Category Breakdown Chart: accessibilityLabel = `category-chart`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | E2E.1: Test Design | Define specific test cases across Tiers 1-4. | None | DONE |
| 2 | E2E.2: Test Infrastructure | Setup Jest & RNTL config, configure npm scripts (`test:e2e`). | None | DONE |
| 3 | E2E.3: Test Case Implementation | Write Jest E2E tests for Tiers 1-4 targeting the App component. | E2E.1, E2E.2 | DONE |
| 4 | E2E.4: Verification & Publication | Run tests (verify correct failures on dummy/empty app), publish TEST_INFRA.md and TEST_READY.md. | E2E.3 | DONE |

## Interface Contracts
- The E2E tests will import `App.tsx` (the root React Native component) and render it using `@testing-library/react-native`.
- Testing command: `npm run test:e2e` or `npm run test` executes Jest tests located in `__tests__/e2e/`.
