# Scope: Milestone 2 — Storage Layer & Logic

## Architecture
- `src/services/storage.ts` contains the logic for transaction state persistence using React Native AsyncStorage.
- React components (and screens) import storage functions to perform CRUD operations on budget transactions.
- Concurrency and async locks might be required to prevent race conditions during parallel reads and writes.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Interface & CRUD | Define Transaction interface & implement fetch, add, delete, clear CRUD in `src/services/storage.ts`. | None | PLANNED |
| 2 | Testing | Implement comprehensive unit tests in `__tests__/storage.test.ts` (verification). | Milestone 1 | PLANNED |
| 3 | Verification | Compile TypeScript and run tests via Jest. Verify no integrity issues. | Milestone 2 | PLANNED |

## Interface Contracts
### `src/services/storage.ts` ↔ App Code
- `Transaction` interface:
  ```typescript
  export interface Transaction {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string; // ISO string format
    type: 'income' | 'expense';
  }
  ```
- Functions:
  - `fetchTransactions(): Promise<Transaction[]>`
  - `addTransaction(t: Omit<Transaction, 'id'>): Promise<Transaction>`
  - `deleteTransaction(id: string): Promise<void>`
  - `clearStorage(): Promise<void>`
