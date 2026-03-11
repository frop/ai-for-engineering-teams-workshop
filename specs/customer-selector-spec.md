# Feature: CustomerSelector Component

## Context
- Main customer selection interface for the Customer Intelligence Dashboard
- Container component that renders a list of `CustomerCard` components
- Enables dashboard operators to quickly find and select a customer for deeper analysis
- Used as the primary navigation mechanism within the dashboard sidebar or main view

## Requirements

### Functional Requirements
- Display a scrollable list of customer cards (name, company, health score)
- Provide a search/filter input to narrow customers by name or company
- Highlight the currently selected customer card visually
- Persist the selected customer across page interactions (e.g., tab switches, re-renders)
- Handle lists of 100+ customers efficiently without noticeable lag

### User Interface Requirements
- Search input at the top of the selector panel with placeholder text (e.g., "Search customers…")
- Customer list rendered below the search input using `CustomerCard` components
- Selected card visually distinguished (e.g., highlighted border or background)
- Empty state message shown when no customers match the search query
- Scrollable container so the panel does not grow unbounded on large lists

### Data Requirements
- Consumes the full customer list from `src/data/mock-customers.ts`
- Filters customers client-side based on search input (name and company fields)
- Maintains selected customer `id` in local component state
- No external data fetching; all data passed via props or imported directly

### Integration Requirements
- Renders `CustomerCard` components, passing each customer's data and an `onSelect` handler
- Exposes an `onCustomerSelect` callback prop, invoked with the selected `Customer` object when selection changes
- Properly typed TypeScript interface exported for use by parent components

## Constraints

### Technical Stack
- Next.js 15 (App Router)
- React 19
- TypeScript with strict mode
- Tailwind CSS for styling

### Performance Requirements
- Client-side filtering must remain responsive for 100+ customer records
- No unnecessary re-renders of unselected cards when selection changes
- No layout shift when the customer list is filtered

### Design Constraints
- Responsive: full-width on mobile, fixed panel width (~360px) on desktop
- Search input uses standard Tailwind form styles (`border`, `rounded-md`, `px-3 py-2`)
- Selected card indicated with a ring or border: `ring-2 ring-blue-500` or equivalent
- Scrollable list area has a defined max-height with `overflow-y-auto`

### File Structure and Naming
- Component file: `src/components/CustomerSelector.tsx`
- Props interface: `CustomerSelectorProps` exported from component file
- Imports `Customer` type and customer data from `src/data/mock-customers.ts`
- Imports and renders `CustomerCard` from `src/components/CustomerCard.tsx`
- Follow PascalCase naming convention for components

### Security Considerations
- No use of `dangerouslySetInnerHTML`
- Search input value used only for client-side filtering, not sent to any API

## Acceptance Criteria

- [ ] Renders a card for every customer in the mock data set by default
- [ ] Typing in the search input filters cards to only those matching name or company (case-insensitive)
- [ ] Clearing the search input restores the full customer list
- [ ] Clicking a customer card updates the visual selection state on that card
- [ ] `onCustomerSelect` callback is invoked with the correct `Customer` object on selection
- [ ] Selected customer remains highlighted after the list is filtered
- [ ] Empty state message is shown when the search query matches no customers
- [ ] Component handles 100+ customers without visible performance degradation
- [ ] `CustomerSelectorProps` TypeScript interface is defined and exported
- [ ] No TypeScript strict mode errors
- [ ] No console errors or warnings during render
- [ ] Layout is responsive and does not break on mobile viewports
