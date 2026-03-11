# Feature: Customer Health Monitoring System

## Context
- Comprehensive customer health scoring and predictive alerting system for the Customer Intelligence Dashboard
- Combines a multi-factor health score calculator (`lib/healthCalculator.ts`) with a rule-based alerts engine (`lib/alerts.ts`)
- Consumed by two UI widgets: `CustomerHealthDisplay` (score breakdown) and `AlertsWidget` (real-time alert feed)
- Used by account managers and customer success teams to proactively identify at-risk accounts and prioritize interventions
- Integrates with `CustomerSelector` so scores and alerts update in real time as users switch between customers

## Requirements

### Functional Requirements

#### Health Score Calculator (`lib/healthCalculator.ts`)
- Calculate a single 0–100 health score from four weighted factors:
  - Payment History: 40% — days since last payment, average payment delay, overdue amount
  - Engagement: 30% — login frequency, feature usage count, open support tickets
  - Contract Status: 20% — days until renewal, contract value, recent upgrade activity
  - Support Satisfaction: 10% — average resolution time, satisfaction scores, escalation count
- Classify each score into a risk level: **Healthy** (71–100), **Warning** (31–70), **Critical** (0–30)
- Expose individual factor scoring functions (`scorePayment`, `scoreEngagement`, `scoreContract`, `scoreSupport`) and a main `calculateHealthScore` function
- Validate all inputs; throw descriptive errors for missing or out-of-range values
- Handle edge cases: new customers with no payment history, zero engagement data, missing optional fields

#### Predictive Alerts Engine (`lib/alerts.ts`)
- Evaluate all alert rules against customer data and return a prioritized list of active alerts
- **High Priority** rules:
  - Payment Risk: payment overdue > 30 days OR health score dropped > 20 points in 7 days
  - Engagement Cliff: login frequency dropped > 50% vs. 30-day average
  - Contract Expiration Risk: contract expires in < 90 days AND health score < 50
- **Medium Priority** rules:
  - Support Ticket Spike: > 3 support tickets in 7 days OR any escalated ticket
  - Feature Adoption Stall: no new feature usage in 30 days for accounts on a growth plan
- Deduplicate alerts — never surface the same customer/rule combination twice in one evaluation cycle
- Apply cooldown periods per rule to prevent alert fatigue
- Attach recommended action text and contextual data to every generated alert

#### `CustomerHealthDisplay` Widget
- Show overall health score as a large numeric value with color-coded ring or progress bar
- Color coding: red for Critical, yellow for Warning, green for Healthy (consistent with `CustomerCard`)
- Expandable accordion revealing individual factor scores and their contribution to the total
- Loading skeleton while data is being fetched; inline error state with retry affordance

#### `AlertsWidget`
- Real-time list of active alerts for the selected customer, sorted by priority then recency
- Color-coded priority badges: red (High), yellow (Medium)
- Each alert row shows: title, trigger reason, recommended action, timestamp
- Dismiss button per alert; dismissed alerts move to a collapsible history section
- Empty state when no alerts are active

### Data Requirements
- `CustomerHealthInput` interface covering all four factor input groups
- `HealthScoreResult` interface: `{ overallScore, riskLevel, factors: { payment, engagement, contract, support } }`
- `Alert` interface: `{ id, customerId, rule, priority, title, reason, recommendedAction, triggeredAt, dismissed }`
- Mock data in `src/data/mock-customers.ts` extended with health input fields for at least 5 representative scenarios (healthy, warning, critical, new customer, churning)

### Integration Requirements
- Both widgets subscribe to the selected customer from `CustomerSelector`; score and alerts recalculate on selection change
- Shared color-coding utility reused from (or consistent with) `CustomerCard` health indicator logic
- No prop drilling beyond one level — use a shared context or co-located state at the dashboard page level

## Constraints

### Technical Stack and Frameworks
- Next.js 15 (App Router), React 19, TypeScript strict mode, Tailwind CSS
- Pure function architecture for `lib/healthCalculator.ts` and `lib/alerts.ts` — no side effects, no global state

### Performance Requirements
- Health score calculation must complete synchronously in < 5 ms for a single customer
- Alert rule evaluation must handle 500 customers in < 100 ms (batch use case)
- Memoize `calculateHealthScore` results in the UI layer to avoid redundant recomputation on re-renders

### Design Constraints
- `CustomerHealthDisplay`: max width 400 px, collapsible factor breakdown hidden by default on mobile
- `AlertsWidget`: scrollable list capped at 400 px height; virtualize if alert count exceeds 50
- Priority colors must use Tailwind classes: `text-red-500` (High / Critical), `text-yellow-500` (Medium / Warning), `text-green-500` (Healthy)

### File Structure and Naming
- `src/lib/healthCalculator.ts` — pure calculation functions and TypeScript interfaces
- `src/lib/alerts.ts` — alert rules engine and interfaces
- `src/components/CustomerHealthDisplay.tsx` — score widget
- `src/components/AlertsWidget.tsx` — alerts widget
- `src/lib/__tests__/healthCalculator.test.ts` — unit tests
- `src/lib/__tests__/alerts.test.ts` — unit tests

### Props Interfaces
- `CustomerHealthDisplayProps`: `{ customerId: string; healthInput: CustomerHealthInput }`
- `AlertsWidgetProps`: `{ customerId: string; alerts: Alert[]; onDismiss: (alertId: string) => void }`

### Security Considerations
- No sensitive financial figures (exact ARR, overdue balances) rendered in alert message text — use bucketed labels (e.g., "high-value account")
- Input validation must reject negative values, scores outside 0–100, and future timestamps for historical fields
- No `dangerouslySetInnerHTML`; all alert text rendered as plain strings

## Acceptance Criteria

### Health Score Calculator
- [ ] `calculateHealthScore` returns a value in [0, 100] for all valid inputs
- [ ] Risk level is `"Healthy"` for scores 71–100, `"Warning"` for 31–70, `"Critical"` for 0–30
- [ ] Each factor score reflects its documented weight (payment 40%, engagement 30%, contract 20%, support 10%)
- [ ] Throws a descriptive `ValidationError` when required fields are missing or out of range
- [ ] Returns a valid score for a new customer with no payment history (graceful default)
- [ ] All individual factor functions (`scorePayment`, etc.) are exported and independently testable

### Predictive Alerts Engine
- [ ] All five alert rules trigger correctly against synthetic customer data that meets each threshold
- [ ] No duplicate alerts generated for the same customer/rule in a single evaluation pass
- [ ] High-priority alerts always appear before medium-priority alerts in returned list
- [ ] Cooldown logic suppresses re-triggering an alert within the configured window
- [ ] Dismissed alerts do not re-appear in the active list after dismissal

### `CustomerHealthDisplay` Widget
- [ ] Renders overall score and correct risk level color for Critical, Warning, and Healthy customers
- [ ] Factor breakdown is hidden by default and expands on user interaction
- [ ] Shows loading skeleton while `healthInput` is undefined
- [ ] Shows inline error state (with retry button) when calculation throws

### `AlertsWidget`
- [ ] Displays active alerts sorted by priority (High before Medium) then by `triggeredAt` descending
- [ ] Dismissing an alert removes it from the active list and appends it to the history section
- [ ] Renders empty state message when no alerts are active
- [ ] List scrolls independently and does not overflow the dashboard layout

### Integration
- [ ] Selecting a different customer in `CustomerSelector` updates both widgets within a single render cycle
- [ ] Health score color coding is visually consistent between `CustomerCard` and `CustomerHealthDisplay`
- [ ] No TypeScript strict mode errors across all new files
- [ ] Unit test suites pass with ≥ 90% line coverage for `lib/healthCalculator.ts` and `lib/alerts.ts`
