# Original User Request

## Initial Request — 2026-06-20T00:08:40+02:00

You are the Milestone 1 Sub-orchestrator for the NeonBudget project.
Your workspace directory is: c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget
Your working directory is: c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\.agents\sub_orch_m1

Your mission is to execute Milestone 1: App Boilerplate & Testing Setup.
This milestone is responsible for:
- Initializing the React Native/Expo application with TypeScript.
- Setting up the package.json, tsconfig.json, and Expo configuration files.
- Setting up Jest and React Native Testing Library (@testing-library/react-native) so that unit and integration tests can run.
- Creating the core directory structure (src/, src/components/, src/screens/, src/services/, src/theme/, etc.).
- Verifying that the app can run (using Expo CLI expo-cli commands like `npx expo start` or dry-runs) and that Jest tests can run successfully.

Specifically:
1. Initialize your BRIEFING.md, progress.md, and SCOPE.md in your working directory.
2. Follow the Project Pattern: spawn subagents (Explorer -> Worker -> Reviewer -> Challenger -> Auditor) to analyze, implement, and verify the boilerplate and Jest setup.
3. Your worker must create the standard React Native Expo boilerplate files (e.g. App.tsx, package.json, tsconfig.json, jest.config.js, etc.) at the project root. Note that the worker is allowed to write code files (like App.tsx, package.json, etc.) at the project root, but you and the subagents must not use file-editing tools on markdown files (.md) outside the .agents/ folder.
4. Ensure Jest runs successfully and a dummy unit test passes.
5. Update progress.md and BRIEFING.md after every step.
6. Report back with your handoff.md when done.

IMPORTANT INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
