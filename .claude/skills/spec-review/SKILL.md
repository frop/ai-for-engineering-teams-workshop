---
name: spec-review
description: Validate a spec file against the workshop spec template. Use when reviewing a feature spec, checking spec completeness, or before implementation begins.
argument-hint: <spec-file-path>
disable-model-invocation: true
allowed-tools: Read
---

Review the spec file at: $ARGUMENTS

First, read the spec file at `$ARGUMENTS` and the template at `templates/spec-template.md`.

Then validate the spec against the template with these checks:

## 1. Required Sections Check

Verify all four required sections exist (exact heading match):
- `### Context`
- `### Requirements`
- `### Constraints`
- `### Acceptance Criteria`

## 2. Content Completeness Check

For each section that exists, check whether it addresses the expected sub-items:

**Context** should cover:
- Purpose and role in the application
- How it fits into the larger system
- Who will use it and when

**Requirements** should cover:
- Functional requirements (what it must do)
- User interface requirements
- Data requirements
- Integration requirements

**Constraints** should cover:
- Technical stack (Next.js 15, React 19, TypeScript, Tailwind CSS)
- Performance requirements
- Design constraints
- File structure and naming conventions
- Props interface and TypeScript definitions
- Security considerations

**Acceptance Criteria** should include:
- Testable success criteria (not just template placeholders)
- Edge cases handled
- User experience validated
- Integration points verified

## 3. Format & Quality Check

- Does the spec start with `## Feature:` and a concrete name (not `[Component/Feature Name]`)?
- Are acceptance criteria written as checkboxes (`- [ ]`)?
- Has placeholder text been replaced with real, specific content?

## Output Format

Respond with this exact structure:

```
## Spec Review: <filename>

### Overall Status: PASS | NEEDS IMPROVEMENT | FAIL

### Section Checklist
| Section             | Present | Complete |
|---------------------|---------|----------|
| Context             | ✅/❌   | ✅/⚠️/❌  |
| Requirements        | ✅/❌   | ✅/⚠️/❌  |
| Constraints         | ✅/❌   | ✅/⚠️/❌  |
| Acceptance Criteria | ✅/❌   | ✅/⚠️/❌  |

### Issues Found
- [Section] — <specific missing or incomplete item>

### Recommendations
- <Actionable suggestion with the exact text or heading to add>

### Summary
<1-2 sentence overall assessment>
```

Legend: ✅ complete · ⚠️ present but incomplete or generic · ❌ missing
