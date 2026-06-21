# NeonBudget E2E Test Suite Infrastructure & Design

This report outlines the complete E2E testing strategy, detailed 4-tier test case suite, opaque-box UI interaction contracts, and Jest configuration for **NeonBudget**.

---

## 1. Local Environment Assessment

The local system has been evaluated and verified for E2E testing compatibility. The available dependencies are:
- **Node.js**: `v24.16.0`
- **NPM**: `11.13.0`
- **Expo CLI**: `56.1.16` (invoked via `npx expo`)
- **Jest**: `30.4.1` (invoked via `npx jest`)

All necessary prerequisites for running a Node/Expo/Jest-based React Native E2E test suite are fully available.

---

## 2. Opaque-Box Interaction Specifications

To ensure the test implementation and the application codebase align seamlessly without coupling to implementation details, the following **accessibility labels**, **text matchers**, and UI elements are defined.

### Form Inputs & Toggles
| UI Element | Type | Accessibility Label (`accessibilityLabel`) | Matching Criteria / Expected Values |
|---|---|---|---|
| **Amount Input** | `TextInput` | `amount-input` | Accepts numeric input (e.g., `15.50`). |
| **Description Input** | `TextInput` | `description-input` | Accepts alphanumeric input (e.g., `Grocery Shopping`). |
| **Transaction Type Selector** | Toggle/Buttons | `type-toggle-income`<br>`type-toggle-expense` | Selects Income vs Expense mode. The selected button should have a visual accent. |
| **Category Button (Food)** | Button/Touch | `category-picker-Food` or text `Food` | Selects the "Food" category. |
| **Category Button (Salary)** | Button/Touch | `category-picker-Salary` or text `Salary` | Selects the "Salary" category. |
| **Category Button (Transport)** | Button/Touch | `category-picker-Transport` or text `Transport` | Selects the "Transport" category. |
| **Category Button (Utilities)** | Button/Touch | `category-picker-Utilities` or text `Utilities` | Selects the "Utilities" category. |
| **Category Button (Other)** | Button/Touch | `category-picker-Other` or text `Other` | Selects the "Other" category. |
| **Add Transaction Button** | Button/Touch | `add-transaction-button` | Triggers form validation and submission. |

### Dashboard & Analytics Displays
| UI Element | Type | Accessibility Label (`accessibilityLabel`) | Matching Criteria / Expected Values |
|---|---|---|---|
| **Total Balance Value** | `Text` | `total-balance` | String representation of net balance, e.g. `$2,500.00` or `+$50.00`. |
| **Total Income Value** | `Text` | `total-income` | Sum of all incomes, e.g. `$5,000.00`. |
| **Total Expense Value** | `Text` | `total-expense` | Sum of all expenses, e.g. `$2,500.00`. |
| **Category Chart Card** | `View` | `category-chart` | Chart container showing percentage breakdowns of expenses. |
| **Current Month Header** | `Text` | `current-month-label` | Current filtered month display, e.g., `June 2026`. |
| **Prev Month Button** | Button/Touch | `month-picker-prev` | Toggles dashboard filters to the previous calendar month. |
| **Next Month Button** | Button/Touch | `month-picker-next` | Toggles dashboard filters to the next calendar month. |

### Transaction History List
| UI Element | Type | Accessibility Label (`accessibilityLabel`) | Matching Criteria / Expected Values |
|---|---|---|---|
| **Transaction FlatList** | `FlatList` | `transaction-list` | Container scroll view containing individual history items. |
| **Empty State Text** | `Text` | `empty-state-text` | Visible when list is empty, e.g. `"No transactions for this month."` |
| **Transaction Item Row** | `View` | `transaction-item` | Single list item. Inner elements match description, category, and styled amount. |

---

## 3. 4-Tier E2E Test Suite Structure

A structured 4-tier test plan is designed to run in Jest and `@testing-library/react-native`.

```
__tests__/e2e/
├── tier1_features.test.tsx      # Tier 1: Core Feature Verification (20+ tests)
├── tier2_boundaries.test.tsx    # Tier 2: Boundary & Edge Case Verification (12+ tests)
├── tier3_combinations.test.tsx  # Tier 3: Cross-Feature Interactions (5+ tests)
└── tier4_workflows.test.tsx     # Tier 4: End-to-End User Workflows (4+ tests)
```

---

### Tier 1: Feature Coverage (>=5 test cases per core feature)

#### Feature 1.1: Core Transaction Lifecycle (Expense/Income adding, listing, and categorization)
* **T1_TX_01: Add Valid Expense**
  * *Description*: Verify that filling out the form with amount `45.00`, description `Dinner with friends`, category `Food`, and type `Expense` correctly appends the item to the list.
  * *Verification*: Check that a transaction item with text `"Dinner with friends"` and `"$45.00"` (or similar formatting) is rendered in the transaction list.
* **T1_TX_02: Add Valid Income**
  * *Description*: Verify that selecting type `Income`, entering amount `1200.00`, description `Freelance Work`, category `Salary`, and clicking Add succeeds.
  * *Verification*: Check that a transaction item with text `"Freelance Work"` and `"$1,200.00"` is rendered in the list.
* **T1_TX_03: Chronological Sorting**
  * *Description*: Add three transactions with distinct descriptions sequentially.
  * *Verification*: Verify that the transaction list renders the most recently added transaction at the top (newest first).
* **T1_TX_04: Category Assignment Verification**
  * *Description*: Create an expense with category `Transport`.
  * *Verification*: Check that the resulting transaction item displays the correct category label or icon identifier corresponding to `Transport`.
* **T1_TX_05: Input Clears After Submission**
  * *Description*: Submit a valid transaction and check the inputs.
  * *Verification*: Verify that `amount-input` and `description-input` text values are reset to empty string post-submission.
* **T1_TX_06: Validation Error on Empty Description**
  * *Description*: Leave description blank, enter amount `10`, and try to submit.
  * *Verification*: Verify transaction is not added, and an validation alert or error text is displayed.

#### Feature 1.2: Offline Storage Persistence (AsyncStorage integration)
* **T1_ST_01: Initialize with Empty Storage**
  * *Description*: Mount the app with `AsyncStorage` returning `null` or empty array.
  * *Verification*: Verify the transaction list displays the `empty-state-text` and balance displays show `$0.00`.
* **T1_ST_02: Write to Storage on Adding Transaction**
  * *Description*: Add an expense of `100.00`.
  * *Verification*: Verify `AsyncStorage.setItem` is called with a JSON payload containing the transaction list with the newly created expense.
* **T1_ST_03: Load Transactions from Storage on Mount**
  * *Description*: Seed the mock `AsyncStorage` with two preset transactions: Expense `50` (Utilities) and Income `100` (Other). Mount the App.
  * *Verification*: Check that both transactions immediately render in the history list, and totals display a Net Balance of `+$50.00`.
* **T1_ST_04: Graceful Degradation on Corrupted Storage**
  * *Description*: Seed `AsyncStorage` with corrupted, malformed JSON string (e.g. `"{invalid_json"`). Mount the App.
  * *Verification*: Check that the app does not crash, degrades gracefully to an empty state, and handles the parser error internally.
* **T1_ST_05: Storage Failure Error Alert**
  * *Description*: Mock `AsyncStorage.setItem` to throw a `WriteError`. Attempt to add a transaction.
  * *Verification*: Verify that the app displays an error message or alert informing the user that saving failed.

#### Feature 1.3: Dashboard & Summary Analytics
* **T1_DB_01: Total Balance Calculation**
  * *Description*: Add income `500.00` and expense `120.00`.
  * *Verification*: Verify that `total-balance` display updates to read `+$380.00` (or `$380.00`).
* **T1_DB_02: Total Income Calculation**
  * *Description*: Add multiple incomes (`300.00`, `150.00`) and one expense (`50.00`).
  * *Verification*: Verify that `total-income` displays `+$450.00` and does not include the expense.
* **T1_DB_03: Total Expense Calculation**
  * *Description*: Add multiple expenses (`40.00`, `60.00`) and one income (`1000.00`).
  * *Verification*: Verify that `total-expense` displays `-$100.00` (or `$100.00`) and ignores the income.
* **T1_DB_04: Category Breakdown Aggregation**
  * *Description*: Add two expenses under `Food` (`25.00` and `35.00`) and one under `Transport` (`40.00`).
  * *Verification*: Verify that the category chart or summary details show a total of `$60.00` for `Food` and `$40.00` for `Transport` (Food represents 60% of total expenses).
* **T1_DB_05: Exclude Incomes from Expense Breakdown Chart**
  * *Description*: Add an expense of `100.00` (Utilities) and an income of `1000.00` (Salary).
  * *Verification*: Verify that the category breakdown chart contains only `Utilities` at 100% and does not aggregate `Salary` inside the expense chart.

#### Feature 1.4: Premium Dark Theme & Accents (Visual/Structural styling checks)
* **T1_TH_01: Deep Dark Theme Background**
  * *Description*: Fetch the style of the root app container.
  * *Verification*: Verify the background color is a deep dark grey or black (e.g. `#000000`, `#121212`, or `#1A1A1A`).
* **T1_TH_02: Neon Green Accents for Income**
  * *Description*: Add an income transaction and select/find the text element representing the amount.
  * *Verification*: Verify its style `color` property matches a neon green color (e.g. `#39FF14` or similar vibrant green).
* **T1_TH_03: Neon Purple/Pink Accents for Expenses**
  * *Description*: Add an expense transaction and find the text element representing the amount.
  * *Verification*: Verify its style `color` property matches a neon purple/pink/red accent color (e.g. `#BD00FF` or `#FF007F`).
* **T1_TH_04: Glassmorphic Panel Verification**
  * *Description*: Retrieve styling attributes for card panels (e.g. the summary panel).
  * *Verification*: Verify the styles include semi-translucent background colors (rgba with opacity < 1.0) and border colors with subtle opacities to produce the glassmorphism aesthetic.
* **T1_TH_05: Active Toggle Highlight Style**
  * *Description*: Toggle the transaction type between Income and Expense.
  * *Verification*: Verify that the active toggle button changes its style to a vibrant neon color highlight, while the inactive one remains muted.

---

### Tier 2: Boundary & Edge Cases (>=5 test cases per feature/boundary)

#### Boundary Area 2.1: Numeric Input Boundaries (Amount Field)
* **T2_BD_01: Extreme Value Overflow Protection**
  * *Description*: Attempt to input a transaction amount of `999999999` (999 million).
  * *Verification*: Verify the app blocks addition, caps the input, or shows a validation message warning of limit exceeded.
* **T2_BD_02: Decimals Over two Digits**
  * *Description*: Enter an amount with three or more decimal digits (e.g. `12.3456`).
  * *Verification*: Verify the transaction is added with the amount formatted/rounded to 2 decimal places (e.g. `12.35` or `12.34`).
* **T2_BD_03: Special & Alphabetic Character Filtering**
  * *Description*: Try to type alphabetic characters and symbols (`abc#$%-`) into the `amount-input`.
  * *Verification*: Verify that the input field filters out these invalid characters, leaving the amount field either empty or only containing valid numerical parts.
* **T2_BD_04: Zero & Negative Amount Submission**
  * *Description*: Enter `0` or `-15.00` in the amount input.
  * *Verification*: Verify the add button is disabled, or clicking it shows a validation error message.
* **T2_BD_05: Empty Amount Submission**
  * *Description*: Enter a description but leave the amount blank.
  * *Verification*: Verify the form fails to submit and requests an amount.

#### Boundary Area 2.2: Time, Filter, and Text Overflows
* **T2_BD_06: Date Span and Month Boundary Isolation**
  * *Description*: Seed the app with transactions from June 2026 (current viewed month) and July 2026 (future month).
  * *Verification*: Verify only the June transactions are displayed in the list and aggregated in the dashboard totals, hiding the July transactions until the month is toggled.
* **T2_BD_07: Long Text Description Overflow**
  * *Description*: Add an expense with a description containing 200+ characters.
  * *Verification*: Verify that the layout remains intact, and the text uses ellipsis or wraps cleanly without breaking the layout of other elements.
* **T2_BD_08: Category Chart with Zero Expenses**
  * *Description*: Add only income transactions (no expenses).
  * *Verification*: Verify that the `category-chart` handles this case gracefully (e.g. showing a placeholder text "No expenses recorded this month" or drawing a neutral base ring instead of crashing).
* **T2_BD_09: Identical Timestamps Sorting**
  * *Description*: Rapidly add two transactions with identical descriptions and amounts within milliseconds of each other.
  * *Verification*: Verify that both items are added correctly with unique internal keys, and do not cause key collision warnings in the list.

---

### Tier 3: Cross-Feature Combinations (Pairwise Coverage of Key Interactions)

* **T3_CF_01: Transaction Flow -> Local Storage Sync -> Live Dashboard Updates**
  * *Description*: Add multiple mixed transactions (2 incomes, 2 expenses of different categories).
  * *Verification*: Check that:
    1. Storage is updated with the full list of 4 items.
    2. Dashboard reflects the correct net balance and totals.
    3. The category chart displays the correct category percentages.
    4. The list displays all items.
* **T3_CF_02: Month Filtering Navigation -> Transaction Addition -> Local Storage Consistency**
  * *Description*: Navigate to a different month (e.g., May 2026) using `month-picker-prev`. Add an expense. Then return to June 2026.
  * *Verification*:
    1. Verify that the added expense is not shown in the list when viewing June 2026.
    2. Verify the expense appears and updates totals when returning to May 2026.
    3. Verify AsyncStorage stores the transaction with the correct date metadata.
* **T3_CF_03: Empty State Transition and Dashboard Reset**
  * *Description*: Clear all transactions (or mock empty storage), verify empty state. Add a single expense. Then delete/remove the expense (if deletion is supported, or clear storage and trigger re-render).
  * *Verification*: Verify that the app switches dynamically from empty state -> active state -> empty state, with balances updating to $0.00.
* **T3_CF_04: AsyncStorage Mock Write Failures & State rollback**
  * *Description*: Cause the local storage mock to fail on writes (`setItem` throws exception) while the user is actively entering a transaction.
  * *Verification*: Verify the application UI keeps the transaction input details intact (does not reset the form on error) and prompts the user with a retry warning, preventing desynchronization between UI state and offline state.
* **T3_CF_05: Parallel State Updates & Storage Integrity**
  * *Description*: Add multiple transactions sequentially without waiting for individual storage promises to fully resolve.
  * *Verification*: Verify that the state updates are queued correctly in React, and the final state in AsyncStorage contains all added transactions without loss of intermediate data.

---

### Tier 4: Real-World Scenarios (End-to-End User Journeys)

* **T4_RW_01: Detailed Onboarding & Monthly Expense Tracking**
  1. User opens the application for the first time. The screen shows `$0.00` total balance, an empty list, and a placeholder chart.
  2. User receives monthly salary: enters amount `4200`, description `Monthly Salary`, selects `Income` toggle, and selects category `Salary`. Clicks `Add`.
     * *Verification*: Balance shows `+$4,200.00`, Income shows `+$4,200.00`, Expenses show `$0.00`. The list displays one entry.
  3. User pays rent: enters amount `1400`, description `June Rent Payment`, selects `Expense` toggle, selects category `Other` (or `Rent` if available). Clicks `Add`.
     * *Verification*: Balance updates to `+$2,800.00`. Expenses show `-$1,400.00`. Chart displays 100% `Other`.
  4. User buys groceries: enters amount `180.50`, description `Weekly grocery shopping`, selects `Expense`, selects category `Food`. Clicks `Add`.
     * *Verification*: Balance updates to `+$2,619.50`. Expenses show `-$1,580.50`. Chart displays breakdown: ~88.6% `Other`, ~11.4% `Food`.
  5. User reloads the application.
     * *Verification*: The app displays the exact same balance `+$2,619.50` and the same transaction list and chart percentage breakdowns, confirming offline persistence.
* **T4_RW_02: Transaction Correction & Budget Recalculation**
  1. User adds a transaction with an error: amount `500.00` (instead of `50.00`) for description `Dinner`, category `Food`.
     * *Verification*: Expenses total increases by `500.00`. Chart shows `Food` taking up a massive proportion.
  2. User deletes or edits the transaction (e.g. clicking a delete button or trash icon next to the item row).
     * *Verification*: The transaction is removed from the list, and totals are updated instantly (Expenses total drops, balance increases, chart recalculates).
  3. User re-adds the correct transaction: amount `50.00` for `Dinner`, category `Food`.
     * *Verification*: Balance, expenses, and category chart reflect the correct `50.00` value.
* **T4_RW_03: Multi-Month Budget Management & Traversal**
  1. User is in June 2026. Adds an income: `2000.00` (Salary).
  2. User navigates to July 2026 (switches month).
     * *Verification*: Dashboard shows empty state for July. Total Balance displays `$0.00`.
  3. User adds an expense in July: `150.00` (Utilities).
     * *Verification*: Dashboard for July shows `-$150.00` Balance. List has 1 item.
  4. User navigates back to June 2026.
     * *Verification*: Dashboard shows `+$2,000.00` Balance. List shows June transactions.
  5. User restarts application.
     * *Verification*: App loads back to the current month (June) and retains all June and July data in storage.
* **T4_RW_04: Budget Exhaustion Alert & Visual State Check**
  1. User starts with no balance.
  2. User adds an expense of `100.00` (Transport) without adding income.
     * *Verification*: Balance shows `-$100.00` in red/purple accent.
  3. User adds more expenses: `400.00` (Food).
     * *Verification*: Balance shows `-$500.00`. The chart reflects 80% `Food`, 20% `Transport`.
  4. User adds income of `600.00` (Salary).
     * *Verification*: Balance updates to positive value `+$100.00`, turning back to green accent, demonstrating proper positive/negative styling transitions.

---

## 4. Proposed Jest & Script Infrastructure

We propose the following configuration files and scripts to support execution of the E2E tests.

### Jest Config: `jest.config.e2e.js`
This file is placed in the project root directory and configured to specifically discover and run the E2E tests in the `__tests__/e2e/` folder.

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  testMatch: ['**/__tests__/e2e/**/*.test.[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: false, // Turn off for E2E tests to speed up execution
  verbose: true,
};
```

### Jest Setup File: `jest-setup.ts`
This setup file mocks React Native internal modules, native modules, and establishes a clean, fully simulated in-memory `AsyncStorage` instance to keep test runs fast, stable, and completely offline.

```typescript
import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage with in-memory store
let storageStore: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key: string, value: string) => {
    return new Promise<void>((resolve) => {
      storageStore[key] = String(value);
      resolve();
    });
  }),
  getItem: jest.fn((key: string) => {
    return new Promise<string | null>((resolve) => {
      resolve(key in storageStore ? storageStore[key] : null);
    });
  }),
  removeItem: jest.fn((key: string) => {
    return new Promise<void>((resolve) => {
      delete storageStore[key];
      resolve();
    });
  }),
  clear: jest.fn(() => {
    return new Promise<void>((resolve) => {
      storageStore = {};
      resolve();
    });
  }),
  getAllKeys: jest.fn(() => {
    return new Promise<string[]>((resolve) => {
      resolve(Object.keys(storageStore));
    });
  }),
  multiGet: jest.fn((keys: string[]) => {
    return new Promise<[string, string | null][]>((resolve) => {
      const results = keys.map((key) => [key, storageStore[key] || null] as [string, string | null]);
      resolve(results);
    });
  }),
  multiSet: jest.fn((keyValuePairs: [string, string][]) => {
    return new Promise<void>((resolve) => {
      keyValuePairs.forEach(([key, value]) => {
        storageStore[key] = value;
      });
      resolve();
    });
  }),
  multiRemove: jest.fn((keys: string[]) => {
    return new Promise<void>((resolve) => {
      keys.forEach((key) => {
        delete storageStore[key];
      });
      resolve();
    });
  }),
}));

// Reset database before each test run
beforeEach(() => {
  storageStore = {};
  jest.clearAllMocks();
});
```

### Package Script Proposed Addition (`package.json`)
The following script configurations should be added to the React Native project's `package.json` to allow developers or CI systems to invoke the tests easily.

```json
{
  "scripts": {
    "test": "jest",
    "test:e2e": "jest --config jest.config.e2e.js",
    "test:e2e:watch": "jest --config jest.config.e2e.js --watch",
    "test:e2e:coverage": "jest --config jest.config.e2e.js --coverage"
  }
}
```

---

## 5. Summary & Implementation Alignment

By establishing accessibility labels (`amount-input`, `description-input`, etc.) as the core contract, we ensure that:
1. The engineering team can build out the UI elements with these exact properties.
2. The testing team can write full E2E test suites in parallel using `@testing-library/react-native`.
3. Changes to internal components (e.g., refactoring state management or swapping out input designs) will not break the test suite as long as the accessibility labels are maintained.
