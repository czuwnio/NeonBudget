# E2E Test Suite Design & Infrastructure Proposal for NeonBudget

## 1. Executive Summary
This document defines the E2E testing architecture and detailed 4-tier test suite design for NeonBudget, a React Native Expo personal finance application.
- **Testing framework**: Jest with `@testing-library/react-native` (RNTL) simulating the full application environment by rendering the root `App` component.
- **Storage Strategy**: Mocked in-memory `AsyncStorage` to ensure 100% offline predictability, execution speed, and test isolation.
- **UI Interaction Method**: Opaque-box testing relying on predefined `accessibilityLabel` strings and visual text matchers.

---

## 2. Local Environment Status
The environment check was executed on the host system:
- **Node.js**: `v24.16.0` (Verified via CLI)
- **npm**: `11.13.0` (Verified via CLI)
- **Git**: `2.54.0.windows.1` (Verified via CLI)
- **Workspace State**: Uninitialized (empty root directory except for `.agents/` and `ORIGINAL_REQUEST.md`). The boilerplate setup will initialize the Expo TypeScript workspace.

---

## 3. 4-Tier Test Suite Structure

The tests are categorized into 4 tiers, spanning from granular feature correctness to complete real-world multi-step user scenarios.

### Tier 1: Feature Coverage (>=5 test cases per core feature)

#### Feature 1: Add Transaction Form & Logic
- **Test Case 1.1**: Adding a valid Expense transaction.
  - *Steps*: Input amount `50.00`, description `Lunch`, select category `Food`, set type to `Expense`, press `Add Transaction`.
  - *Verification*: Confirm transaction appears in list; Total Balance drops by 50; Total Expense increases by 50.
- **Test Case 1.2**: Adding a valid Income transaction.
  - *Steps*: Input amount `1500.00`, description `Freelance`, select category `Salary`, set type to `Income`, press `Add Transaction`.
  - *Verification*: Confirm transaction appears in list; Total Balance increases by 1500; Total Income increases by 1500.
- **Test Case 1.3**: Toggle transaction type styling and state.
  - *Steps*: Select `Income` toggle, then switch to `Expense` toggle.
  - *Verification*: Assert that toggle elements reflect active/inactive state (accessibility state `selected` or custom test styles).
- **Test Case 1.4**: Category selection updates.
  - *Steps*: Click category selector, choose `Transport`.
  - *Verification*: Assert that selected category field displays `Transport`.
- **Test Case 1.5**: Form reset after success.
  - *Steps*: Fill form, press `Add Transaction`.
  - *Verification*: Verify input amount resets to empty (or default placeholder) and description resets to empty.

#### Feature 2: Transaction List Display
- **Test Case 1.6**: Layout fields correctness.
  - *Steps*: Add a transaction with description `Weekly Bus Pass`, amount `25.50`, category `Transport`.
  - *Verification*: Query list item and assert it displays `Weekly Bus Pass`, `$25.50`, `Transport`, and current date.
- **Test Case 1.7**: Visual type indicators (+/- signs).
  - *Steps*: Add expense `$10` and income `$20`.
  - *Verification*: Verify the expense amount text shows `- $10.00` (or similar sign/color accent) and the income text shows `+ $20.00`.
- **Test Case 1.8**: Sorting order.
  - *Steps*: Add Transaction A (`Lunch`), then Transaction B (`Dinner`).
  - *Verification*: Verify that Transaction B (latest) appears above Transaction A in the UI list.
- **Test Case 1.9**: Empty placeholder view.
  - *Steps*: Render app with zero records in local storage.
  - *Verification*: Confirm that placeholder text (e.g., `No transactions yet`) is visible.
- **Test Case 1.10**: Scrollable list handling.
  - *Steps*: Seed AsyncStorage with 15 transactions and render the app.
  - *Verification*: Verify that all 15 elements are successfully rendered in the FlatList/ScrollView container.

#### Feature 3: Dashboard & Summary
- **Test Case 1.11**: Net Balance calculation.
  - *Steps*: Add income `$2000` and expense `$800`.
  - *Verification*: Verify that total-balance element displays `$1,200.00`.
- **Test Case 1.12**: Aggregate Income calculation.
  - *Steps*: Add income `$1000` and another income `$500`.
  - *Verification*: Verify that total-income element displays `$1,500.00`.
- **Test Case 1.13**: Aggregate Expense calculation.
  - *Steps*: Add expense `$300` and another expense `$150`.
  - *Verification*: Verify that total-expense element displays `$450.00`.
- **Test Case 1.14**: Category Breakdown Chart display.
  - *Steps*: Add expense `$100` (category: `Food`) and expense `$300` (category: `Housing`).
  - *Verification*: Verify chart component or legend highlights `Food` and `Housing` with correct proportion representations (e.g. 25% Food, 75% Housing).
- **Test Case 1.15**: Month boundary filtering.
  - *Steps*: Seed one transaction in the current month and another transaction in the previous month.
  - *Verification*: Confirm only the current month's transaction is factored into the dashboard totals.

---

### Tier 2: Boundary & Edge Cases (>=5 test cases per boundary area)

#### Amount Input Boundaries
- **Test Case 2.1**: Zero value (`0` or `0.00`).
  - *Steps*: Type `0` in amount field, try to submit.
  - *Verification*: Verify error warning is shown or the "Add" button remains disabled.
- **Test Case 2.2**: Negative sign entry.
  - *Steps*: Attempt to enter `-50` in amount field.
  - *Verification*: Assert that input field blocks negative sign input, or automatically converts it to positive value `50`.
- **Test Case 2.3**: Extreme amount overflow (e.g., `99,999,999.00`).
  - *Steps*: Add transaction with amount `99999999`.
  - *Verification*: Verify application does not crash and formatted dashboard text fits UI constraints.
- **Test Case 2.4**: Double-decimal inputs (e.g., `10.556` or `12.34.5`).
  - *Steps*: Try entering `10.556`.
  - *Verification*: Verify that the input trims to `10.56` or rejects the third decimal digit.
- **Test Case 2.5**: Invalid alphabet characters (e.g., `abc`).
  - *Steps*: Attempt to input `abc` into amount field.
  - *Verification*: Field remains empty or throws validation error.

#### Description & Input Text Boundaries
- **Test Case 2.6**: Empty description.
  - *Steps*: Input amount `20.00`, leave description empty, select `Food`, press Add.
  - *Verification*: Transaction is saved successfully, using a fallback description (e.g., `Food Transaction`) or alerts the user.
- **Test Case 2.7**: Extremely long description string.
  - *Steps*: Input a 250-character string as description, submit.
  - *Verification*: Verify text wraps or truncates in list item without causing visual overlap or layout break.
- **Test Case 2.8**: Script/Special Character Injections.
  - *Steps*: Input `<script>alert('hack')</script>` or emojis `🍕🔥` as description, submit.
  - *Verification*: Verify text is rendered literally without HTML execution or crashes.

#### Storage & Offline Resilience Boundaries
- **Test Case 2.9**: Corrupted local storage payload.
  - *Steps*: Write malformed JSON string (e.g. `{invalid-json`) to AsyncStorage under transactions key, start app.
  - *Verification*: Verify app handles it gracefully by resetting storage or starting with empty state instead of crashing.
- **Test Case 2.10**: Storage full / write failure.
  - *Steps*: Force AsyncStorage helper to throw an error during write operation.
  - *Verification*: Verify error alert message is displayed to the user and state is rolled back.

---

### Tier 3: Cross-Feature Combinations (Pairwise coverage)

- **Test Case 3.1**: Add Transaction -> Dashboard update -> List synchronization.
  - *Action*: User adds an expense of `$100`.
  - *Expectation*: The list displays the item instantly AND the dashboard balance updates.
- **Test Case 3.2**: Multi-type transactions balance resolution.
  - *Action*: User adds income `$500`, then adds expense `$200`.
  - *Expectation*: Dashboard displays net balance `$300.00`, income `$500.00`, and expense `$200.00`.
- **Test Case 3.3**: Dynamic Category selection by Transaction type.
  - *Action*: Toggle type to `Income`, check available categories (e.g. `Salary`, `Investment`). Toggle type to `Expense`, verify category options update (e.g. `Food`, `Housing`, `Transport`).
  - *Expectation*: Category options filter dynamically based on selected transaction type.
- **Test Case 3.4**: Multi-category expense chart update.
  - *Action*: Add `$100` expense for `Food` and `$100` expense for `Transport`.
  - *Expectation*: Chart visualizes two segments, each representing exactly 50%.
- **Test Case 3.5**: Month Navigation vs List Filtering.
  - *Action*: Set current filter to "June 2026", add a transaction dated "May 2026".
  - *Expectation*: Transaction does not appear in June list, but does appear when switching month filter to May.

---

### Tier 4: Real-world Scenarios (Multi-step workflows)

#### Test Case 4.1: Monthly Budget Planning & Spending Flow
1. **App Initialization**: User launches app for the first time. Verify balance is `$0.00` and no transactions exist.
2. **Salary Credit**: User adds monthly salary income of `$4,000.00` with description `Paycheck June` on category `Salary`.
3. **Check Dashboard**: Verify Balance is `$4,000.00`, Income is `$4,000.00`, Expense is `$0.00`.
4. **Pay Rent**: User adds housing expense of `$1,500.00` with description `Rent Payment`.
5. **Buy Groceries**: User adds food expense of `$200.00` with description `Weekly Groceries`.
6. **Gas Refueling**: User adds transport expense of `$80.00` with description `Gas Fill-up`.
7. **Final Calculations**: Verify:
   - Balance = `$2,220.00`
   - Total Income = `$4,000.00`
   - Total Expense = `$1,780.00`
8. **Check Chart**: Chart breakdown shows `Housing` (84.3%), `Food` (11.2%), `Transport` (4.5%).
9. **List Inspection**: Verify list has 4 items in descending chronological order.

#### Test Case 4.2: Zero-Sum Budget & Negative Balance Handling
1. **Initialize**: User adds income of `$100.00`.
2. **First Expense**: User adds expense of `$100.00`. Verify balance is exactly `$0.00`.
3. **Deficit Spending**: User adds expense of `$50.00`.
4. **Warning Check**: Verify balance shows `-$50.00` (accented appropriately to indicate negative status).
5. **Recovery**: User adds income of `$60.00`.
6. **Verify Correction**: Verify balance returns to positive `+$10.00`.

#### Test Case 4.3: App Restart and Data Persistence
1. **Seed Data**: User adds income `$500` and expense `$100`.
2. **Verify State**: Confirm list has 2 items, dashboard shows balance `$400.00`.
3. **Simulate Reload**: Unmount the root `App` component and re-render it to simulate an app crash/restart.
4. **Verify Persistent Load**: Verify AsyncStorage loading triggers successfully and displays the exact same 2 list items and `$400.00` balance.

---

## 4. Opaque-Box Interaction Specifications

To ensure the test suite and implementation align, we will utilize the following selectors and interaction contracts:

| UI Component | Query Method / Matcher | Target/Value Example |
|---|---|---|
| **Amount Input Field** | `getByLabelText('amount-input')` | Accessibility label: `amount-input` |
| **Description Input Field** | `getByLabelText('description-input')` | Accessibility label: `description-input` |
| **Income Type Toggle** | `getByLabelText('type-toggle-income')` | Accessibility label: `type-toggle-income` |
| **Expense Type Toggle** | `getByLabelText('type-toggle-expense')` | Accessibility label: `type-toggle-expense` |
| **Category Button/Item** | `getByLabelText('category-chip-Food')` or `getByText('Food')` | Accessibility label matching category name |
| **Add Transaction Button** | `getByLabelText('add-transaction-button')` | Accessibility label: `add-transaction-button` |
| **Transaction List Container** | `getByLabelText('transaction-list')` | Accessibility label: `transaction-list` |
| **Transaction Item Card** | `queryAllByLabelText('transaction-item')` | Accessibility label: `transaction-item` |
| **Total Balance Value** | `getByLabelText('total-balance')` | Accessibility label: `total-balance` |
| **Total Income Value** | `getByLabelText('total-income')` | Accessibility label: `total-income` |
| **Total Expense Value** | `getByLabelText('total-expense')` | Accessibility label: `total-expense` |
| **Category Breakdown Chart** | `getByLabelText('category-chart')` | Accessibility label: `category-chart` |

---

## 5. Configurations & Scripts

### 5.1 Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: [
    '@testing-library/react-native/extend-expect',
    '<rootDir>/jest.setup.js'
  ],
  testMatch: [
    '**/__tests__/e2e/**/*.test.[jt]s?(x)',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.config.js',
  ],
};
```

### 5.2 Jest Setup (`jest.setup.js`)
```javascript
// Mock react-native-reanimated if used
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler if used
jest.mock('react-native-gesture-handler', () => {});

// Mock AsyncStorage in-memory implementation
let store = {};
const mockAsyncStorage = {
  setItem: jest.fn((key, value) => {
    return new Promise((resolve) => {
      store[key] = String(value);
      resolve(null);
    });
  }),
  getItem: jest.fn((key) => {
    return new Promise((resolve) => {
      resolve(store[key] || null);
    });
  }),
  removeItem: jest.fn((key) => {
    return new Promise((resolve) => {
      delete store[key];
      resolve(null);
    });
  }),
  clear: jest.fn(() => {
    return new Promise((resolve) => {
      store = {};
      resolve(null);
    });
  }),
  getAllKeys: jest.fn(() => {
    return new Promise((resolve) => {
      resolve(Object.keys(store));
    });
  }),
  multiGet: jest.fn((keys) => {
    return new Promise((resolve) => {
      resolve(keys.map(key => [key, store[key] || null]));
    });
  }),
  multiSet: jest.fn((keyValuePairs) => {
    return new Promise((resolve) => {
      keyValuePairs.forEach(([key, value]) => {
        store[key] = String(value);
      });
      resolve(null);
    });
  }),
};
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Reset store between tests
beforeEach(() => {
  store = {};
  jest.clearAllMocks();
});
```

### 5.3 package.json Scripts Additions
To be added to `package.json`:
```json
"scripts": {
  "test:e2e": "jest --config jest.config.js",
  "test:e2e:watch": "jest --config jest.config.js --watch",
  "test:e2e:coverage": "jest --config jest.config.js --coverage"
}
```
