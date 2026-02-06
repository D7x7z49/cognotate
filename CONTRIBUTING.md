# CONTRIBUTING

## BRANCH MANAGEMENT

### PURPOSE

This section defines the branch strategy. Following these rules creates a linear, clear project history that is easy to maintain and understand.

### 1. BRANCH CLASSIFICATION

All work must use one of these three branch types.

#### 1.1 MAINLINE BRANCH

- Purpose: The permanent, stable foundation of the project.
- Participants: Multiple. These branches are protected.
- Lifecycle: Permanent.
- Naming Rule: Use a single, lowercase noun.
- Naming Examples: `main`, `dev`.
- Key Rule: Do not commit directly to the remote mainline. Always use a merge request.

#### 1.2 TASK BRANCH

- Purpose: To develop a single new feature, fix, or change.
- Participant: Single owner.
- Lifecycle: Short-lived. Created from and merged into a mainline branch.
- Naming Rule: Use the format `type/description`.
  - `type`: Must be a standard type from **Conventional Commits 1.0.0** (e.g., `feat`, `fix`, `docs`, `refactor`, `chore`).
  - `description`: Must be in **kebab-case** (lowercase words separated by hyphens). Link to an issue if possible.
- Naming Examples: `feat/add-user-login`, `fix/issue-123-crash-on-startup`, `docs/update-api`.
- Key Rule: Sync frequently with its target mainline branch.

#### 1.3 SPIKE BRANCH

- Purpose: For local experiments, trials, or incomplete work.
- Participant: Single owner.
- Lifecycle: Very short-lived (a few hours). Must remain a local branch.
- Naming Rule: Use the format `type/description`.
  - `type`: Use a common term for temporary work (e.g., `tmp`, `spike`, `experiment`).
  - `description`: Must be in **kebab-case**.
- Naming Examples: `tmp/debug-auth-flow`, `spike/test-new-database`.
- Key Rule: Never push to the remote server. Its final result should be integrated into a task branch.

### 2. CORE OPERATIONAL RULES

For all branch interactions, follow these three rules.

#### 2.1 RULE 1: SYNC WITH UPSTREAM CHANGES

- Instruction: Use the command `git rebase`.
- When to Use: When you need to update your branch with the latest commits from the branch it started from (e.g., updating your `feat/...` branch with new changes from `dev`).
- Example Command: `git rebase origin/dev`

#### 2.2 RULE 2: INTEGRATE COMPLETED WORK

- Instruction: Use a `merge` operation.
- When to Use: When the work on a task branch is finished and ready to become part of a stable mainline branch.
- How to Apply: For remote branches, create a Merge Request (Pull Request). The maintainer will merge it. For local branches, use the command `git merge`.

#### 2.3 RULE 3: CONCLUDE A LOCAL EXPERIMENT

- Instruction: Use the command `git merge --squash`.
- When to Use: When you finish a spike branch and want to keep only the final result in your task branch.
- Example Command: `git checkout feat/add-search && git merge --squash tmp/try-algorithm`
