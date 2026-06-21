# E2E Test Suite Design and Infrastructure Handoff Report

## 1. Observation

* **File Path `c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\ORIGINAL_REQUEST.md`**: Contains the core system requirements (R1: Core Transactions, R2: Data Storage, R3: Dashboard and Summary, R4: Premium Dark Design).
* **File Path `c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\.agents\sub_orch_e2e\SCOPE.md`**: Specifies that the E2E test runner is Jest and `@testing-library/react-native` rendering the full `App.tsx` component, mocking `AsyncStorage`, and interacting via accessibility labels.
* **Environment Checks**:
  * Command: `cmd /c "node -v && npm -v"` returned:
    ```
    v24.16.0
    11.13.0
    ```
  * Command: `cmd /c "npx expo --version"` returned:
    ```
    56.1.16
    ```
  * Command: `cmd /c "npx jest --version"` returned:
    ```
    30.4.1
    ```
* **Directory State**: List contents of root `c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget` contains only `.agents` folder and `ORIGINAL_REQUEST.md`. No packages, typescript setup, or boilerplate code exist yet.

## 2. Logic Chain

1. **Test Suite Mapping**: Using the requirements in `ORIGINAL_REQUEST.md` (R1-R4) and the E2E architecture guidelines in `SCOPE.md`, I established a mapping of core functionalities to test cases.
2. **Environment Verification**: Checking command availability shows that Node, NPM, Expo, and Jest are fully operational locally, validating that the proposed Jest configuration is runnable on the current host.
3. **4-Tier Structure**:
   * **Tier 1 (Feature Coverage)**: Requires `>=5` test cases per core feature. I mapped four core features (Transaction Lifecycle, Storage, Dashboard/Analytics, Theme styling) with 5-6 test cases each (22 total).
   * **Tier 2 (Boundary/Edge Cases)**: Requires `>=5` test cases per feature/boundary area. I mapped two boundary areas (Numeric inputs, Time/filters/overflows) with 5 and 4 cases respectively (9 total).
   * **Tier 3 (Cross-Feature Combinations)**: Mapped 5 pairwise key interaction tests (e.g. Transaction addition -> Storage sync -> Dashboard updates).
   * **Tier 4 (Real-world Scenarios)**: Mapped 4 multi-step user workflows describing complete user sessions.
4. **Opaque-Box Contracts**: To decouple tests from React Native element internal hierarchies, I proposed a formal table of 15 accessibility labels/matchers (e.g., `amount-input`, `description-input`, `type-toggle-income`, `total-balance`, etc.) aligned with `SCOPE.md`.
5. **Configuration Specification**: Designed the `jest.config.e2e.js` and `jest-setup.ts` to mock `AsyncStorage` using a custom in-memory store, ensuring fast and isolated E2E runs.

## 3. Caveats

* The codebase does not exist yet. As a result, the style checks in Tier 1 (e.g., checking neon colors `#39FF14` or `#BD00FF`) are based on the design language requirements from R4. If the final implementation uses different hex codes or style properties, these test assertions will need adjustment.
* No actual tests were executed because the implementation is read-only and no React Native boilerplate exists.

## 4. Conclusion

The E2E test design is complete, structured, and documented in `analysis.md`. The environment is ready to support execution. A strict opaque-box UI contract has been defined to allow tests and code to be implemented concurrently without alignment drift.

## 5. Verification Method

To verify the test design:
1. Inspect the detailed report at `.agents/teamwork_preview_explorer_e2e_infra_2/analysis.md` to ensure all 4 tiers, UI contracts, and Jest configurations are fully covered.
2. Once the app boilerplate and tests are created, run the test command:
   ```bash
   npm run test:e2e
   ```
   Verify that it executes tests in the `__tests__/e2e/` folder using the proposed `jest.config.e2e.js` config and mock setup.
