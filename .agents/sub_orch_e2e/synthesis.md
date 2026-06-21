# E2E Test Suite Synthesis & Specification

## 1. Consensus on E2E Test Architecture
- **Framework**: Jest + `@testing-library/react-native` (RNTL) rendering the root `<App />` component.
- **Paradigm**: Opaque-box testing using accessibility labels and text matches, completely decoupled from internal state/modules.
- **Data Isolation**: In-memory mock of `@react-native-async-storage/async-storage` reset before each test run to ensure offline stability, speed, and liveness.
- **Node & Jest Environment**: Verified Node.js `v24.16.0`, npm `11.13.0`, Jest `30.4.1` on the local system.

## 2. Synthesized UI Interaction Contract (Accessibility Labels)
To ensure tests run correctly, the app UI must implement the following accessibility labels:
- **Form Inputs**:
  - `amount-input`: Numeric text input for transaction amount.
  - `description-input`: Text input for transaction description.
  - `type-toggle-income`: Button/Toggle for selecting "Income" type.
  - `type-toggle-expense`: Button/Toggle for selecting "Expense" type.
  - `category-picker-button` or text matchers: Selects category (categories: Food, Salary, Rent, Transport, Utilities, Other).
  - `category-option-<Name>`: Option in category list/modal (e.g. `category-option-Food`).
  - `add-transaction-button`: Button to submit the transaction.
- **Dashboard Summary**:
  - `total-balance`: Net balance text (displays calculated `Income - Expenses` with `$` and +/- sign).
  - `total-income`: Aggregate income text (displays sum of incomes).
  - `total-expense`: Aggregate expense text (displays sum of expenses).
  - `category-chart`: Expense category chart container.
- **History List**:
  - `transaction-list`: FlatList/ScrollView container holding history.
  - `transaction-item`: Individual transaction list items.
  - `transaction-item-desc`: Transaction description text inside an item.
  - `transaction-item-category`: Category label inside an item.
  - `transaction-item-amount`: Signed amount text inside an item (e.g. `+$4,500.00` or `-$12.00`).
  - `empty-state-text`: Text displayed when the list is empty (e.g., "No transactions yet").

## 3. Synthesized 4-Tier Test Cases

### Tier 1: Feature Coverage (>=5 test cases per feature area)
- **TC-1.1**: Add Valid Expense: Input amount, description, select "Expense", category "Food", click add. Verify it renders in list and totals update.
- **TC-1.2**: Add Valid Income: Input amount, description, select "Income", category "Salary", click add. Verify list item and totals update.
- **TC-1.3**: Form Inputs Reset: Adding a transaction clears amount and description inputs.
- **TC-1.4**: Category Assignment: Selecting "Transport" category correctly stores and displays "Transport" in the list item.
- **TC-1.5**: Chronological Order: Newer transactions are prepended to the top of the transaction list.
- **TC-1.6**: Storage Persistence (Write): Adding a transaction triggers `AsyncStorage.setItem`.
- **TC-1.7**: Storage Persistence (Read on Mount): Seeding storage and mounting App loads transactions and displays them.
- **TC-1.8**: Empty State Display: First launch with empty storage shows `empty-state-text` and `$0.00` dashboard totals.
- **TC-1.9**: Dashboard Calculations: Adding Income and Expense correctly aggregates and displays Total Income, Total Expense, and Net Balance.
- **TC-1.10**: Category Chart Render: Adding expenses renders `category-chart` showing expense distribution.

### Tier 2: Boundary & Corner Cases (>=5 test cases per boundary)
- **TC-2.1**: Zero Amount Input: Entering `0` or `0.00` rejects addition or shows validation error.
- **TC-2.2**: Negative Amount Input: Entering negative amounts is either filtered out or rejected with a validation error.
- **TC-2.3**: Extreme Value Input: Large amount (e.g., `99999999`) does not crash the app and wraps properly in UI text.
- **TC-2.4**: Decimal Precision: Decimal input with 3+ decimals (e.g., `15.556`) is rounded/truncated to 2 decimal places.
- **TC-2.5**: Empty/Whitespace Fields: Empty description/amount submissions display validation error messages.
- **TC-2.6**: Special Characters: Descriptions with emojis/special characters render literally without crashing.
- **TC-2.7**: Corrupted Storage Recovery: App loads gracefully (empty state) when storage contains corrupted JSON, without crashing.
- **TC-2.8**: Storage Write Failures: App displays error alert when AsyncStorage write fails, retaining form inputs.
- **TC-2.9**: Net Zero Balance: Income and Expense of equal values result in exactly `$0.00` balance.

### Tier 3: Cross-Feature Combinations (Pairwise interactions)
- **TC-3.1**: Add Transaction -> Storage Sync -> List update -> Dashboard recalculation.
- **TC-3.2**: Type-Toggle vs Category Sync: Toggling type updates available categories (e.g., Salary is not shown for Expenses).
- **TC-3.3**: Dynamic Category Chart Updates: Adding different expenses updates category chart percentages.
- **TC-3.4**: Parallel State Submissions: Adding multiple transactions rapidly queues state updates correctly without losing items.

### Tier 4: Real-World Scenarios
- **TC-4.1 (Happy Path Budgeting)**: Initial launch -> Add Salary -> Check totals -> Add Rent -> Add Groceries -> Check totals ($2,300 balance, Rent 88.2%, Groceries 11.8% of expenses) -> Check chronological list.
- **TC-4.2 (Deficit Spending)**: First launch -> Add Expense $100 -> Verify negative balance display (-$100) -> Add Expense $50 -> Verify -$150 -> Add Income $200 -> Verify positive balance display (+$50).
- **TC-4.3 (App Crash/Reload Session Continuity)**: Seed storage -> Mount app -> Verify state -> Unmount and re-mount App -> Verify same transactions and balance are loaded from AsyncStorage.
