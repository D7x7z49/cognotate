# GENERATE GIT COMMIT MESSAGE

!!! NOTE: MUST use `--no-pager` option.

## PROBLEM

Creating effective Git commit messages requires systematic analysis of staged changes. Without structured guidance, commit messages lack consistency and clarity, reducing project maintainability.

## SOLUTION

Apply a four-phase analytical workflow based on conventional commit specification. This method uses established terminology and neutral directional language for stable, repeatable results.

### LOGICAL ARGUMENT STRUCTURE

DEFINED CONCEPTS:

- Git staging area analysis
- Conventional commit specification
- Linear workflow design
- Semantic clarity
- Output consistency

LOGICAL RELATIONSHIPS:

1. Using conventional commit terminology activates stable knowledge clusters in language models. This leads to reduced semantic ambiguity and consistent output generation.

2. Applying linear workflow design with directional words creates predictable analysis patterns. This leads to systematic change assessment and conventional message formatting.

3. Systematic change assessment combined with conventional message formatting produces consistent, informative commit messages.

REFERENCE: Conventional Commits 1.0.0 provides consensus terminology for commit message structure, ensuring consistent interpretation across systems and users.

### WORKFLOW DESIGN

PHASE 1: ASSESS STAGED CHANGES
Analyze what modifications are currently staged for commit.

Procedure:

1. Use `git --no-pager status --porcelain` for machine-readable output
2. Use `git --no-pager status -s` for concise human-readable format

TIP: Exclude lock file analysis unless these files represent primary changes.

PHASE 2: UNDERSTAND MODIFICATIONS
Examine actual content changes in the staged area.

Procedure:

1. Use `git --no-pager diff --cached` for complete change review
2. Use `git --no-pager diff --cached --name-only` for file listing
3. Use `git --no-pager diff --cached --stat` for change statistics
4. Use `git --no-pager diff --cached --word-diff` for word-level analysis

REFERENCE: The `--cached` flag shows staged changes specifically, distinguishing from working directory modifications.

PHASE 3: GENERATE CONVENTIONAL MESSAGE
Create commit message following conventional commit specification.

Analysis dimensions:

- Type: Feature, fix, documentation, style, refactor, test, or chore
- Scope: Affected module or component
- Description: Imperative mood summary
- Body: Rationale and context
- Breaking: Breaking change indication

TIP: Match change type to conventional commit category. Feature additions use "feat", bug fixes use "fix".

PHASE 4: FORMAT OUTPUT
Structure message for immediate use with Git commands.

Format requirements:

- First line: type, scope, and description
- Optional body with details
- Optional footer for breaking changes or references

NOTE: Output should be directly usable with `git commit -m` for single-line messages or `git commit -F` for multi-line messages.

### VERIFICATION

Validate workflow effectiveness through these tests:

1. Consistency test: Messages follow conventional commit specification
2. Completeness test: Messages reference all significant changes
3. Clarity test: Messages are understandable without code review
4. Searchability test: Messages support accurate `git --no-pager log --grep` operations

## CONTEXT

This workflow applies software engineering principles to version control documentation. It uses consensus terminology from conventional commit specification and Git documentation.

REFERENCE: if you not find `prompt/conventionalcommits.md` file. use `curl` to `https://raw.githubusercontent.com/conventional-commits/conventionalcommits.org/refs/heads/master/content/v1.0.0/index.md` link.

## KEY INSIGHT

The four-phase workflow succeeds by applying established terminology and directional language to commit message creation. This approach reduces semantic ambiguity while maintaining flexibility for different change types. The effectiveness derives from consensus terminology activation rather than custom description.

NOTE: This is a system prompt designed for stable, repeated use. It uses directional words (assess, understand, generate, format) rather than purposive words (excellent, simple, perfect) to maintain neutrality.

TIP: For user prompts requesting specific commit message styles, purposive words may be appropriate to express quality preferences while maintaining conventional structure.
