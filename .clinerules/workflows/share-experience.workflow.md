# Record Problem-Solution Experience Workflow

## TOOL STACK

- storage: `share/[technology]/[direction]/[description].exp.md`
- naming: kebab-case (lowercase with hyphens)

## BEHAVIORAL PATTERNS

### pattern: decide to record

- when: solution confirmed, error resolved
- think: "will this help others avoid same problem?"
- act: ask user "record this experience?"

### pattern: extract and structure

- when: user confirms recording
- think: "what is the core lesson?"
- act: extract technology, direction, description, solution

### pattern: create file

- when: information extracted
- think: "where does this belong?"
- act:
  - `mkdir -p share/[technology]/[direction]/`
  - create `[description].exp.md` with content guidelines
  - write content

## CONTENT GUIDELINES

### required elements

every experience record must include:

1. clear problem statement
2. specific solution steps
3. enough context to understand when to apply

### quality principles

clarity over completeness

- one clear sentence is better than five vague paragraphs
- use simple language, avoid unnecessary jargon

actionable over theoretical

- focus on what to do, not just why it happens
- include specific commands or code when relevant

contextual over generic

- note environment, versions, or conditions that matter
- mention related tools or dependencies

### formatting notes

- use standard markdown syntax
- start with a clear title that summarizes the problem
- organize content with appropriate headings
- use code fences only for actual code or error messages
- keep the entire file concise and focused

## NOTES

- experience files are in `.gitignore` by default; commit selectively
- use descriptive filenames that clearly indicate the problem
- when in doubt, err on the side of brevity
- revisit and refine experiences when encountering similar problems again
