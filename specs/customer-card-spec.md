# Feature: CustomerCard Component

## Context
- Individual customer display card for the Customer Intelligence Dashboard
- Used within the `CustomerSelector` container component to list selectable customers
- Provides at-a-glance customer information (name, company, health score, domains) for quick identification
- Supports future integration with domain health monitoring features
- Used by dashboard operators reviewing customer account status

## Requirements

### Functional Requirements
- Display customer name, company name, and health score
- Render a color-coded health indicator based on score range:
  - Red (0–30): Poor health
  - Yellow (31–70): Moderate health
  - Green (71–100): Good health
- Display the customer's domain(s) for health monitoring context
- Show a domain count badge when a customer has more than one domain
- Adapt layout for both mobile and desktop viewports

### User Interface Requirements
- Card-based visual design with clear hierarchy: name > company > health score > domains
- Health indicator displayed as a colored badge or dot alongside the numeric score
- Domains listed below the main customer info; truncate or summarize when count is high
- Domain count badge (e.g., "+2 domains") shown when multiple domains exist
- Consistent spacing and typography aligned with the dashboard design system

### Data Requirements
- Accepts a `Customer` object imported from `src/data/mock-customers.ts`
- Required fields: `id`, `name`, `company`, `healthScore`
- Optional field: `domains` (array of URL strings); handle gracefully when absent or empty

### Integration Requirements
- Rendered by the `CustomerSelector` container component
- Receives customer data as a prop; no internal data fetching
- Emits an `onSelect` callback when the card is clicked, passing the customer `id`
- Properly typed TypeScript interface exported for use by parent components

## Constraints

### Technical Stack
- Next.js 15 (App Router)
- React 19
- TypeScript with strict mode
- Tailwind CSS for styling

### Performance Requirements
- No external dependencies; pure presentational component
- No layout shift when domain list varies in length across customers

### Design Constraints
- Responsive: full-width on mobile, fixed card width (~320px) on desktop
- Rounded corners (`rounded-lg`) and subtle shadow (`shadow-sm`)
- Health indicator colors map strictly to Tailwind classes: `text-red-500`, `text-yellow-500`, `text-green-500`
- Domain text uses `text-sm` and muted color to maintain visual hierarchy

### File Structure and Naming
- Component file: `src/components/CustomerCard.tsx`
- Props interface: `CustomerCardProps` exported from component file
- Imports `Customer` type from `src/data/mock-customers.ts`
- Follow PascalCase naming convention for components

### Security Considerations
- No use of `dangerouslySetInnerHTML`
- Domain strings rendered as plain text only (no anchor tags that open external URLs without `rel="noopener noreferrer"`)

## Acceptance Criteria

- [ ] Renders customer name, company name, and health score for all mock customers
- [ ] Health indicator displays red for scores 0–30, yellow for 31–70, green for 71–100
- [ ] Domains are displayed when the `domains` array is present and non-empty
- [ ] Domain count badge appears when a customer has more than one domain
- [ ] Component renders without errors when `domains` is undefined or empty
- [ ] `onSelect` callback is invoked with the correct customer `id` on card click
- [ ] Layout is responsive and does not break on mobile viewports
- [ ] `CustomerCardProps` TypeScript interface is defined and exported
- [ ] No TypeScript strict mode errors
- [ ] No console errors or warnings during render
- [ ] Passes visual inspection against design constraints (spacing, colors, typography)
