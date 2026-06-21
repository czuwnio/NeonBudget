# NeonBudget E2E Test Suite Design & Infrastructure Analysis

## Executive Summary
This document provides the architectural design and detailed test suite structure for the End-to-End (E2E) testing track of the NeonBudget personal finance tracker application. By employing Jest and `@testing-library/react-native`, we will mount the root `App` component and simulate user interactions through an opaque-box paradigm. This ensures tests are resilient to internal code refactoring and focus purely on user behavior, layout requirements, calculations, and local persistence.

---

## 1. Local Environment Status
Based on terminal environment checks, the following tools are available locally on the system:
- **Node.js**: `v24.16.0`
- **npm**: `11.13.0`
- **Expo CLI**: `56.1.16`
- **Jest (runner)**: `30.4.1`

*Note: The project root currently contains only the `.agents` folder and the `ORIGINAL_REQUEST.md`. No React Native or Expo project scaffold exists yet. The proposed test infrastructure below is designed to be drop-in compatible once the code repository is initialized.*

---

## 2. 4-Tier Test Suite Structure

This test suite ensures full coverage of features, boundary states, multi-feature integrations, and complex real-world workflows.

### Tier 1: Feature Coverage (>=5 test cases per core feature)

#### Feature 1.1: Core Transactions (Adding & Listing)
- **TC-1.1.1 (Expense Addition)**: Verify adding a valid expense transaction displays it in the recent transaction list with correct amount, description, and category.
- **TC-1.1.2 (Income Addition)**: Verify adding a valid income transaction displays it in the recent transaction list with correct details.
- **TC-1.1.3 (Default State)**: Verify that when the transaction form is loaded, the transaction type defaults to "Expense".
- **TC-1.1.4 (Chronological Ordering)**: Verify that the transaction list renders items in reverse chronological order (newest transaction at the top).
- **TC-1.1.5 (Category Color/Accent)**: Verify that transaction items render with styling indicating their category/type (e.g. green accent for income, purple accent for expense).

#### Feature 1.2: Dashboard and Summary Calculations
- **TC-1.2.1 (Balance Increment)**: Verify adding a $1,000.00 income increases the Total Balance display by exactly $1,000.00.
- **TC-1.2.2 (Balance Decrement)**: Verify adding a $250.00 expense decreases the Total Balance display by exactly $250.00.
- **TC-1.2.3 (Total Income Aggregation)**: Verify adding multiple income transactions ($100, $250) correctly aggregates and displays the Total Income as $350.00.
- **TC-1.2.4 (Total Expense Aggregation)**: Verify adding multiple expense transactions ($50, $120) correctly aggregates and displays the Total Expense as $170.00.
- **TC-1.2.5 (Category Chart Rendering)**: Verify that the Category Breakdown Chart component is visible when transactions exist and lists categories associated with current expenses.

#### Feature 1.3: Data Storage & Persistence (AsyncStorage)
- **TC-1.3.1 (Write Trigger)**: Verify that adding a new transaction triggers `AsyncStorage.setItem` with the updated JSON array of transactions.
- **TC-1.3.2 (Read Trigger on Mount)**: Verify that when the App component mounts, it calls `AsyncStorage.getItem` to retrieve existing transaction data.
- **TC-1.3.3 (Initial State Restoration)**: Verify that if `AsyncStorage` contains pre-existing transactions on mount, they are immediately rendered in the transaction list and summarized in the dashboard.
- **TC-1.3.4 (Offline Storage Isolation)**: Verify that transaction operations do not attempt to invoke any external network endpoints (confirming local-only execution).
- **TC-1.3.5 (Storage Data Schema Integrity)**: Verify that saved objects contain the correct JSON schema properties: `id` (string/UUID), `amount` (number), `description` (string), `category` (string), `type` ('income' | 'expense'), and `timestamp` (ISO string).

---

### Tier 2: Boundary & Edge Cases (>=5 test cases per feature/boundary)

#### Boundary 2.1: Input Fields & Formatting Boundaries
- **TC-2.1.1 (Zero Amount)**: Attempt to add a transaction with an amount of `0`. Verify that validation blocks the action and displays "Amount must be greater than 0".
- **TC-2.1.2 (Negative Amount Input)**: Attempt to input a negative number (e.g., `-50`) in the amount input. Verify that negative numbers are either blocked at input level or yield a validation error.
- **TC-2.1.3 (Large Numbers & Overflow)**: Add a transaction of `$99,999,999.99`. Verify that calculations display the number correctly without formatting overflows and the app does not crash.
- **TC-2.1.4 (Decimal Precision & Rounding)**: Add a transaction with three decimals (e.g. `10.556`). Verify that the amount is correctly formatted and stored with standard currency rounding (e.g. `$10.56` or `$10.55`).
- **TC-2.1.5 (Empty/Whitespace Fields)**: Attempt to add a transaction with only spaces in the description or with an empty description. Verify that the form rejects it or defaults the description to the category name.
- **TC-2.1.6 (Special Characters in Description)**: Add a transaction with description `"Lunch 🍕 & Drinks $!!"`. Verify that the text renders correctly in the list item.

#### Boundary 2.2: State & Storage Edge Cases
- **TC-2.2.1 (Fresh Launch / Null Storage)**: Simulate a first-time launch where `AsyncStorage.getItem` returns `null`. Verify the app initializes gracefully, displaying $0.00 totals, and doesn't throw a rendering crash.
- **TC-2.2.2 (Corrupted Storage Recovery)**: Mock `AsyncStorage.getItem` to return corrupted JSON data (e.g. `{invalid-json]`). Verify the app catches the parsing error, resets storage to an empty array `[]`, and loads successfully without crashing.
- **TC-2.2.3 (Write Failure Resiliency)**: Mock `AsyncStorage.setItem` to throw a storage-full or permission error. Verify that the app keeps the local memory state intact and shows a user-facing error message or Toast without crashing.
- **TC-2.2.4 (High Log Volume / Scalability)**: Populate the storage with 100 transaction logs. Verify that the scrollable list renders them successfully and dashboard chart processes the calculations without visual lags.
- **TC-2.2.5 (Date Crossing/Sorting Stability)**: Add transactions with identical timestamps. Verify that the sorting algorithm resolves stable order without infinite render loops or duplicate key issues in the React list.

#### Boundary 2.3: Calculations & Visual Limits
- **TC-2.3.1 (Net Zero Budget)**: Add an Income of `$1,500.00` and an Expense of `$1,500.00`. Verify that the Total Balance computes to exactly `$0.00` (and not `-0.00` or `NaN`).
- **TC-2.3.2 (Negative Balance Display)**: Add an Income of `$500.00` and an Expense of `$1,200.00`. Verify that the Total Balance displays negative sign correctly as `-$700.00` and applies any specific styling (e.g., red or dimmed neon highlights).
- **TC-2.3.3 (Aggregate Category Chart Calculations)**: Add 5 small expenses under the same category `"Food"` ($10, $15, $5, $12, $8). Verify that the chart groups them as a single `"Food"` slice worth `$50.00`.
- **TC-2.3.4 (Single Category Dominance)**: Add one expense of `$100.00` under `"Rent"`. Verify the Category Breakdown Chart shows `"Rent"` as 100% of the distribution.
- **TC-2.3.5 (Case Sensitivity & Normalization)**: Ensure categories are mapped uniformly so that lowercase `"food"` and uppercase `"Food"` map to the same category bucket in calculations and chart representation.

---

### Tier 3: Cross-Feature Combinations (Pairwise coverage of key interactions)

- **TC-3.1 (Form Submission Flow)**: Enter valid inputs, press the Add Transaction button. Verify that:
  1. The form inputs are reset to default states.
  2. The transaction list prepends the new item.
  3. The dashboard numbers recalculate.
  4. `AsyncStorage` receives the save command.
- **TC-3.2 (Type-Toggle & Category List Sync)**: Toggle transaction type between "Expense" and "Income". Verify that:
  1. The category selector updates its list options to match the type (e.g. showing "Food, Rent, Travel" for Expense; "Salary, Freelance, Interest" for Income).
  2. Any previously selected invalid category is cleared or updated.
- **TC-3.3 (Mock Data Restore & Synchronized Visuals)**: Load the app with 3 pre-saved transactions in mock AsyncStorage (1 Income, 2 Expenses across different categories). Verify that upon mounting, the list displays all 3 items, the totals reflect (Income - Expenses), and the category chart shows the correct split percentage, all matching the same state.
- **TC-3.4 (Validation Blocker & Storage Isolation)**: Trigger a validation failure in the form (e.g. submit empty description and 0 amount). Verify that:
  1. Input-error labels appear on screen.
  2. The transaction list length does not change.
  3. No write commands are issued to `AsyncStorage`.
- **TC-3.5 (Rapid Tap Debounce)**: Fill out a valid transaction and click the "Add Transaction" button twice in quick succession. Verify that only a single transaction is added to the list and AsyncStorage.

---

### Tier 4: Real-world scenarios (Complete multi-step user workflows)

#### TC-4.1 (Onboarding and Initial Budget Setup)
1. User opens the application for the first time.
2. Verify total balance displays `$0.00`, total income `$0.00`, total expense `$0.00`. Verify an empty state message is shown in the transaction list ("No transactions yet").
3. User adds their monthly salary: type "Income", category "Salary", amount "4500.00", description "Monthly Salary Paycheck". Clicks "Add".
4. Verify form resets. Verify transaction list contains 1 item.
5. Verify dashboard displays: Total Balance = `$4,500.00`, Total Income = `$4,500.00`, Total Expense = `$0.00`.
6. User adds rent: type "Expense", category "Rent", amount "1500.00", description "Apartment Rent Payment". Clicks "Add".
7. Verify dashboard updates: Balance = `$3,000.00`, Expense = `$1,500.00`.
8. Verify category chart is rendered and shows "Rent" occupying 100% of expenses.
9. User adds groceries: type "Expense", category "Food", amount "300.00", description "Weekly grocery haul". Clicks "Add".
10. Verify dashboard updates: Balance = `$2,700.00`, Expense = `$1,800.00`.
11. Verify category chart updates slice values: Rent: 83.3%, Food: 16.7%.
12. Verify transaction list shows 3 items in descending order (groceries at the top, then rent, then salary).

#### TC-4.2 (Interactive Validation Recovery & Safe Logging)
1. User opens the transaction form.
2. User tries to submit the form empty. Clicks "Add Transaction".
3. Verify validation error message appears: "Please fill out all fields".
4. User enters description "New Shoes" but leaves amount blank. Clicks "Add".
5. Verify error: "Amount must be a valid positive number".
6. User enters invalid amount "-25.00". Clicks "Add".
7. Verify error: "Amount must be greater than 0".
8. User corrects amount to "120.00", category to "Shopping", and type to "Expense". Clicks "Add".
9. Verify error messages disappear from the screen.
10. Verify list shows "New Shoes" expense added, and balance is deducted by `$120.00`.

#### TC-4.3 (Continuous Logging & Reload Session Continuity)
1. User adds 4 transactions sequentially:
   - Expense: $15.00, "Dinner", Category "Food"
   - Expense: $8.50, "Bus Ticket", Category "Travel"
   - Income: $150.00, "Sold old chair", Category "Other"
   - Expense: $40.00, "Gas", Category "Travel"
2. Verify list displays all 4 entries in sequence.
3. Unmount the root App component (simulating app close).
4. Re-mount the root App component (simulating app reload).
5. Verify that the transaction list loads the 4 entries correctly.
6. Verify dashboard displays the correct aggregated totals: Balance = `+$86.50` (assuming $0.00 starting), Income = `$150.00`, Expense = `$63.50`.
7. Verify chart contains two slices: Travel ($48.50 / 76.4%) and Food ($15.00 / 23.6%).

---

## 3. Opaque-Box Interaction Specifications

To ensure the test suite remains decoupled from the component implementation details, tests will query elements strictly using the following accessibility labels (`accessibilityLabel` or `testID`) and text matchers:

| UI Component | Query Method / accessibilityLabel | Text Matcher / Expected Values | Description / Action |
|---|---|---|---|
| **Amount Input** | `accessibilityLabel="amount-input"` | Placeholder: `"0.00"`, `keyboardType="numeric"` | Numeric input for entering the transaction cost. |
| **Description Input** | `accessibilityLabel="description-input"` | Placeholder: `"Description"` | TextInput for typing transaction details. |
| **Type Income Toggle** | `accessibilityLabel="type-toggle-income"` | Text: `"Income"` | Button to switch transaction type to Income. |
| **Type Expense Toggle** | `accessibilityLabel="type-toggle-expense"` | Text: `"Expense"` | Button to switch transaction type to Expense. |
| **Category Selector** | `accessibilityLabel="category-picker-button"` | Text of selected category | Button that opens category options. |
| **Category Option Item**| `accessibilityLabel="category-option-<Name>"` | E.g. `"Food"`, `"Salary"`, `"Rent"` | Selectable category item from the list/dropdown. |
| **Add Button** | `accessibilityLabel="add-transaction-button"` | Text: `"Add Transaction"` | Clickable button that submits the transaction. |
| **Validation Error** | `accessibilityLabel="input-error"` | E.g. `"Amount must be greater than 0"` | Text display showing validation failures. |
| **Total Balance** | `accessibilityLabel="total-balance"` | Dollar regex: `/^\$?\-?[0-9,]+\.[0-9]{2}$/` | Dashboard display showing calculated net balance. |
| **Total Income** | `accessibilityLabel="total-income"` | Dollar regex: `/^\$?[0-9,]+\.[0-9]{2}$/` | Dashboard display showing total income sum. |
| **Total Expense** | `accessibilityLabel="total-expense"` | Dollar regex: `/^\$?[0-9,]+\.[0-9]{2}$/` | Dashboard display showing total expense sum. |
| **Category Chart** | `accessibilityLabel="category-chart"` | - | Visual chart representation container. |
| **Transaction List** | `accessibilityLabel="transaction-list"` | - | Scrollable list container holding logged items. |
| **Empty List Text** | `accessibilityLabel="transaction-list-empty"`| Text: `"No transactions yet"` | Label shown when no logs exist in storage. |
| **Transaction Item** | `accessibilityLabel="transaction-item"` | - | Custom container for individual transaction logs. |
| **Item Description** | `accessibilityLabel="transaction-item-desc"` | String matching input description | Displays description inside list item. |
| **Item Category** | `accessibilityLabel="transaction-item-category"`| String matching selected category | Displays category label inside list item. |
| **Item Amount** | `accessibilityLabel="transaction-item-amount"`| Signed dollar amount (e.g. `"+$4,500.00"`) | Displays signed amount formatted with decimal. |

---

## 4. Proposed Jest Configurations and Scripts

The Jest configuration uses the standard `jest-expo` preset to mock the React Native native modules and environment. 

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/react-native/extend-expect',
    '<rootDir>/jest.setup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'App.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
};
```

### Jest Setup File (`jest.setup.js`)
```javascript
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage for offline storage consistency
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Silence React Native animated helper warning logs in test runs
jest.mock('react-native/Libraries/Animated/Driver/NativeAnimatedHelper');

// Reset AsyncStorage before each test run to isolate cases
beforeEach(async () => {
  await mockAsyncStorage.clear();
});
```

### Proposed `package.json` Scripts
Add the following scripts to the `package.json` once the project scaffold is generated:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:e2e": "jest __tests__/e2e/ --watchAll=false"
}
```

---

## 5. Verification Plan
To ensure the test suite executes cleanly and validates the app features:
1. **Runner test**: Run `npm run test:e2e` and verify it executes without config or import syntax errors.
2. **Failure Check**: Run the test suite against a blank dummy app that lacks form elements or storage triggers, confirming that all designed tests fail as expected (verifying testing sensitivity).
3. **Success Check**: Run tests against the completed NeonBudget implementation and verify a 100% pass rate.
