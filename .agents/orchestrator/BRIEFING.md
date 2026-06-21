# BRIEFING — 2026-06-20T00:07:56+02:00

## Mission
Orchestrate and coordinate the development of NeonBudget, a React Native/Expo personal finance tracker with premium dark mode and neon accents.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\.agents\orchestrator
- Original parent: main agent
- Original parent conversation ID: 65dad307-de1f-40e9-b667-c6cc33abf95d

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\.agents\orchestrator\plan.md
1. **Decompose**: Decompose the project into sequential milestones (modules) and an E2E testing track.
2. **Dispatch & Execute**:
   - **Delegate (sub-orchestrator)**: Spawn sub-orchestrators for milestones (Implementation Track and E2E Testing Track).
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns, write handoff.md, spawn successor.
- **Work items**:
  1. Initialize project files and planning (done)
  2. Spawn E2E Testing Orchestrator (pending)
  3. Spawn Implementation milestones (pending)
- **Current phase**: 1
- **Current focus**: Planning and initializing project setup

## 🔒 Key Constraints
- Never write, modify, or create source code files directly.
- Never run build/test commands yourself — require workers to do so.
- File-editing tools may only be used for metadata/state files (.md) in .agents/ folder.
- Binary veto for Forensic Auditor: if auditor reports integrity violation, fail and rollback immediately.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: 65dad307-de1f-40e9-b667-c6cc33abf95d
- Updated: not yet

## Key Decisions Made
- Use Project Pattern with parallel Implementation Track and E2E Testing Track.
- Target React Native + Expo structure using Expo Router or basic Expo structure, to be defined in layout.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| E2E Testing Orch | teamwork_preview_orchestrator | E2E Testing Track | completed | 13383e7a-37a7-400d-bb6d-3d4af84bf853 |
| M1 Sub-orch | teamwork_preview_orchestrator | Milestone 1 Setup | completed | 6293528d-4fb0-474e-8a26-d10b4ffac35d |
| M2 Sub-orch | teamwork_preview_orchestrator | Storage Layer & Logic | in-progress | d4e0f54b-3f1c-4a6b-aac3-b8168612cf6b |

## Succession Status
- Succession required: no
- Spawn count: 3 / 16
- Pending subagents: d4e0f54b-3f1c-4a6b-aac3-b8168612cf6b
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-25
- Safety timer: none

## Artifact Index
- c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\ORIGINAL_REQUEST.md — Verbatim user request
- c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\.agents\orchestrator\plan.md — Milestones and decomposition
- c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\.agents\orchestrator\progress.md — Liveness and checkpoints
- c:\Users\czuwn\OneDrive\Pulpit\random aplikacja\NeonBudget\.agents\orchestrator\context.md — Project technical context
