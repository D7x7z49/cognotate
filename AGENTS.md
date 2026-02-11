# AGENTS.md

## TOOL STACK

- Version Control: `git` and GitHub CLI (`gh`), your primary interface for project collaboration.
- Project & Dependency Management: `bun` (JavaScript/TypeScript)
- Safety Check: Always use `[command] --help` or `-h` first if unsure.

## COLLABORATION PRINCIPLES

1. Focus on work that connects to and advances public discussions.
2. The project's active thinking happens in Issues (for discussion) and Pull Requests (for proposed changes).
3. Linking your work to public discussions makes contributions traceable and closes loops.
4. When uncertain how to proceed, the built-in `--help` documentation is your first and most reliable guide.

## CORE BEHAVIORAL PATTERNS

1. Pattern: Investigate Before Starting

- When & Why: Before beginning any substantive task.
- Think: "What existing discussion might relate to this?"
- Act: To investigate, consult your tool's help to learn how to explore the project's Issue and Pull Request history.

2. Pattern: Share Intermediate Thinking

- When & Why: When you encounter a blocker, question, or useful insight during work.
- Think: "Could sharing this help others or invite useful input?"
- Act: To share, consult your tool's help to learn how to contribute to public discussion threads.

3. Pattern: Link When Completing Work

- When & Why: When writing commit messages or pull request descriptions.
- Think: "Which public discussion does this address? How do I link them?"
- Act: To create links, learn how to use keywords (like `[commit type] #number`) from the tool's help. This allows work to be tracked and can automatically update discussions.

4. Pattern: Verify Technical Claims

- When & Why: Before asserting technical capabilities or limitations.
- Think: "Can I prove this claim? Have I verified it externally?"
- Act: Use MCP tools (deepwiki) to verify technical assertions about libraries, versions, or features. Never persist in unverified claims.

## SAFETY RULES

1. Foundational Method: For any unfamiliar operation, first consult the authoritative guide using `[command] --help`. This applies to both tool use and collaboration steps.
2. Confirm Context: Ensure you are in the correct project directory.
3. Be Cautious: Understand the impact before running commands that change history (`git rebase`, `git reset`) or remove dependencies (`bun remove`).
4. Consult Experience: When stuck on a recurring problem, check `share/` for documented solutions.

## FURTHER ASSISTANCE

If you need help beyond the scope of these tools and patterns, you can use MCP (Model Context Protocol) to get help.

- bun: <https://github.com/oven-sh/bun>
- commander: <https://github.com/tj/commander.js>
- prisma: <https://github.com/prisma/prisma>
- ai: <https://github.com/vercel/ai>

NOTE: When stuck on recurring errors, conflicting documentation, or when corrected by the user, consult `share/` for documented experiences and use deepwiki to verify technical claims.
