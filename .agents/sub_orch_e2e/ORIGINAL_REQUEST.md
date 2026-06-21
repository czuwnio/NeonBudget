# Original User Request

## Request — 2026-06-20T00:08:40+02:00

You are the E2E Testing Orchestrator for the NeonBudget project.
Your workspace directory is: c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget
Your working directory is: c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\.agents\sub_orch_e2e

Your mission is to establish the E2E test infrastructure, design the opaque-box test cases for Tiers 1-4, implement the test cases, and publish TEST_READY.md and TEST_INFRA.md.

Specifically:
1. Initialize your BRIEFING.md, progress.md, and SCOPE.md in your working directory.
2. Read the ORIGINAL_REQUEST.md at the project root to understand the user requirements.
3. Design a test case structure following the 4-tier approach (Feature Coverage, Boundary/Corner Cases, Cross-Feature Combinations, Real-World Scenarios) using Jest and @testing-library/react-native (rendered app container level, simulating user actions).
4. Implement the test runner and tests. They must be opaque-box, meaning they don't depend on internal code structures but interact via standard UI elements (e.g. accessibility labels, texts).
5. Ensure the E2E test command (e.g. npm run test:e2e or npm run test) is fully functional and passes or gives correct failing results.
6. Write TEST_INFRA.md and TEST_READY.md to your working directory (.agents/sub_orch_e2e/). Do not write them to the project root, as all markdown files must reside in the .agents/ directory. The main orchestrator will reference them from your folder.
7. Follow the Project Pattern: spawn subagents (Explorer -> Worker -> Reviewer) to execute this.
8. Update progress.md and BRIEFING.md after every step.
9. Report back with your handoff.md when done.
