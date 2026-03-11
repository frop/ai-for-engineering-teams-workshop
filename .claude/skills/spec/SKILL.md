---
name: spec
description: Generate a feature spec from a requirements file using the workshop spec template. Use when starting implementation of a new component or feature.
argument-hint: <ComponentName>
disable-model-invocation: false
allowed-tools: Read, Write, Glob
---

Generate a spec for the component or feature: **$ARGUMENTS**

## Steps

1. **Derive file paths** from the argument `$ARGUMENTS`:
   - Component name as-is: `$ARGUMENTS` (e.g., `CustomerCard`)
   - Kebab-case filename: lowercase with hyphens (e.g., `customer-card`)
   - Requirements file: `requirements/<kebab-case>.md`
   - Output spec file: `specs/<kebab-case>-spec.md`

2. **Read the template** at `templates/spec-template.md`

3. **Check for requirements file** at `requirements/<kebab-case>.md`
   - If it exists, read it and use its content to populate the spec
   - If it does not exist, generate reasonable content based on the component name and common workshop patterns (Next.js 15, React 19, TypeScript, Tailwind CSS dashboard app)

4. **Generate the spec** following the template structure exactly:

```
## Feature: <ComponentName>

### Context
- Purpose and role in the application
- How it fits into the larger system
- Who will use it and when

### Requirements

#### Functional Requirements
- <specific functional requirements>

#### User Interface Requirements
- <specific UI requirements>

#### Data Requirements
- <specific data requirements>

#### Integration Requirements
- <specific integration requirements>

### Constraints

#### Technical Stack
- Next.js 15 (App Router)
- React 19
- TypeScript with strict mode
- Tailwind CSS for styling

#### Performance Requirements
- <specific performance requirements>

#### Design Constraints
- <specific design constraints>

#### File Structure and Naming
- Component file: `src/components/<ComponentName>.tsx`
- Props interface: `<ComponentName>Props` exported from component file
- Follow PascalCase naming convention for components

#### Security Considerations
- No use of `dangerouslySetInnerHTML`
- <any other relevant security constraints>

### Acceptance Criteria
- [ ] <specific testable criterion>
- [ ] <edge cases handled>
- [ ] <user experience validated>
- [ ] <integration points verified>
- [ ] `<ComponentName>Props` TypeScript interface is defined and exported
- [ ] No TypeScript strict mode errors
- [ ] No console errors or warnings during render
```

5. **Write the spec** to `specs/<kebab-case>-spec.md`

6. **Confirm** by outputting:
   - The path where the spec was saved
   - A brief summary of what was generated
   - Whether a requirements file was found and used
