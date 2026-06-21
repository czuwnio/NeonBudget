# Project Context: NeonBudget

## Description
NeonBudget is a personal finance tracker mobile application built with React Native and Expo. It features a premium dark theme (deep black/dark grey backgrounds) accented by vibrant neon purple and green elements, employing glassmorphism (translucency and blur) visual styles. All transaction data is stored locally on the device to ensure complete offline usability.

## Tech Stack
- **Framework**: React Native with Expo (TypeScript enabled)
- **Navigation**: Expo Router (or standard React Navigation)
- **Local Storage**: AsyncStorage (`@react-native-async-storage/async-storage`)
- **UI & Styling**: Standard React Native StyleSheet (with custom opacity/glassmorphism styles)
- **Testing Framework**: Jest with `@testing-library/react-native` for testing component trees and interaction
- **Visuals/Charts**: Custom React Native SVG-based charts or similar lightweight visual breakdown to represent category expenses.

## Core Requirements
- **R1. Core Transactions**: Add expenses and incomes, assign to categories, view recent transactions list.
- **R2. Data Storage**: Offline-first AsyncStorage for transaction CRUD operations.
- **R3. Dashboard**: Monthly summary view, visual breakdown (chart/graph) of expenses by category.
- **R4. Premium Dark Design**: Black/Grey backgrounds, neon purple/green accents, glassmorphic styling (borders, translucency, overlays).

## Verification Strategy
- **Unit/Integration Testing**: Jest unit tests verifying AsyncStorage CRUD operations, budget calculations, and date filtering.
- **E2E/Opaque-Box Testing**: Testing the complete application container under Jest using `@testing-library/react-native`. It will simulate user actions (e.g., entering amounts, selecting categories, clicking submit) and check for output on the screen using accessibility labels or visible text, ensuring decoupling from implementation details.
