# Project: NeonBudget
# Scope: Global Plan & Milestones

## Architecture
- Root entry point (`App.tsx` or `app/index.tsx` depending on routing)
- Navigation: Standard stack and/or tab layouts with neon indicators
- Styling: Custom design token mapping for deep black/grey and neon colors
- Storage: React Native AsyncStorage module wrapper
- Components:
  - `GlassCard`: A custom translucent wrapper utilizing border and background opacity to simulate glassmorphism.
  - `NeonButton`: Interactive button styled with shadow-based glows and neon accents.
  - `CategoryChart`: A custom or library-based visual rendering of expenses grouped by category.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | M1: App Boilerplate & Testing Setup | Initialize React Native/Expo app, configure TS and Jest, create directory structure. | None | DONE | 6293528d-4fb0-474e-8a26-d10b4ffac35d |
| 2 | M2: Storage Layer & Logic | Define TypeScript interfaces, implement AsyncStorage wrapper, write unit tests for CRUD and business rules. | M1 | IN_PROGRESS | d4e0f54b-3f1c-4a6b-aac3-b8168612cf6b |
| 3 | M3: Navigation & Glassmorphic Layout | Setup navigation, create base layout screens, define colors and global glassmorphic design system/components. | M1 | PLANNED | |
| 4 | M4: Transaction Management UI | Develop Add/View Transaction components, recent transaction lists, form input styling with neon accents. | M2, M3 | PLANNED | |
| 5 | M5: Dashboard & Visual Charts | Build dashboard monthly summaries (total income, total expense, balance) and category-grouped visual breakdown. | M4 | PLANNED | |
| 6 | M6: E2E Verification & Polish | Verify all features against E2E test cases, execute adversarial hardening, visual polish. | M5 | PLANNED | |

## Interface Contracts
### Transaction Data Model
```typescript
export interface Transaction {
  id: string;
  amount: number;             // Positive number representing the monetary value
  type: 'income' | 'expense'; // Transaction category type
  category: string;           // E.g., 'Food', 'Salary', 'Transport', 'Entertainment'
  date: string;               // ISO 8601 Date string (YYYY-MM-DD)
  description?: string;       // Optional textual notes
}
```

### Storage Interface (`src/services/storage.ts`)
- `export const fetchTransactions = (): Promise<Transaction[]>`
- `export const addTransaction = (t: Omit<Transaction, 'id'>): Promise<Transaction>`
- `export const deleteTransaction = (id: string): Promise<void>`
- `export const clearStorage = (): Promise<void>`

### Visual Styles Configuration (`src/theme/theme.ts`)
- `DARK_BACKGROUND`: `#0D0D11`
- `SURFACE_DARK`: `#161622`
- `NEON_PURPLE`: `#C084FC`
- `NEON_GREEN`: `#4ADE80`
- `GLASS_BACKGROUND`: `rgba(255, 255, 255, 0.03)`
- `GLASS_BORDER`: `rgba(255, 255, 255, 0.08)`
- `TEXT_PRIMARY`: `#FFFFFF`
- `TEXT_SECONDARY`: `#9CA3AF`

## Code Layout
```
/
├── .agents/                    # Agent metadata (plans, progress, handoffs)
├── assets/                     # App assets (icons, splash screen)
├── src/                        # Source directory
│   ├── components/             # Reusable UI elements (GlassCard, NeonButton, Charts)
│   ├── screens/                # App screens (Dashboard, Transactions, Form)
│   ├── services/               # Storage and API logic (AsyncStorage wrappers)
│   ├── theme/                  # Design system tokens and styles
│   └── utils/                  # Date parsing, currency formatters
├── __tests__/                  # Unit and integration tests
├── App.tsx                     # Entry point
├── package.json
└── tsconfig.json
```
