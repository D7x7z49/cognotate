# Record Problem-Solution Experience Workflow

## TOOL STACK

- storage: `share/[technology]/[direction]/[description].exp.md`
- naming: kebab-case (lowercase with hyphens)

## BEHAVIORAL PATTERNS

### pattern: decide to record

- when: solution confirmed, error resolved
- think:
  - "will this help others avoid same problem?"
  - "does this have reusable value?"
- act: ask user "record this experience?"

### pattern: extract and structure

- when: user confirms recording
- think:
  - "what is the minimal essential information?"
  - "which technology and direction categories fit best?"
- act:
  - extract technology (primary tool) and direction (problem type)
  - distill core problem and solution essence
  - generate concise kebab-case description

### pattern: create file

- when: information extracted
- think:
  - "does similar experience already exist?"
  - "is the directory structure correct?"
- act:
  - check existing `share/[technology]/[direction]/` for similar files
  - `mkdir -p share/[technology]/[direction]/`
  - create `[description].exp.md` with clear content

### pattern: verify quality

- when: file created, before finalizing
- think:
  - "can i understand this 6 months from now?"
  - "does this include all required elements?"
  - "is this concise yet complete?"
- act:
  - review file against content guidelines
  - make necessary improvements
  - confirm file is ready for sharing

## CONTENT GUIDELINES

### required elements

every experience record must include:

1. problem statement: what went wrong or what challenge was faced
2. solution: how it was resolved or worked around
3. context: enough information to understand when this applies
4. verification: how to test that the solution works

### quality standards

1. length: aim for 300-500 words for typical experiences
2. clarity: use simple language, avoid unnecessary jargon
3. actionability: focus on what to do, include specific steps when possible
4. completeness: include enough context but avoid irrelevant details

### formatting notes

- use standard markdown syntax
- start with a clear title that summarizes the problem
- organize content with appropriate headings
- use code fences only for actual code or error messages
- keep the entire file concise and focused

### categorization guidance

common technology categories:

- specific tools: git, docker, npm, python, node, etc.
- meta-knowledge: prompt-engineering, workflow-design, collaboration
- process: code-review, testing, deployment, documentation

common direction categories:

- network: connectivity, ports, protocols
- auth: authentication, authorization, permissions
- dependency: package management, version conflicts
- config: configuration files, environment variables
- build: compilation, packaging, optimization
- runtime: execution errors, performance issues

## NOTES

- experience files are in `.gitignore` by default; commit selectively
- use descriptive filenames that clearly indicate the problem
- when in doubt, err on the side of brevity
- revisit and refine experiences when encountering similar problems again
- this workflow should be used to record its own design and improvement experiences
