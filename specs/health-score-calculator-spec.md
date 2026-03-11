# Feature: Health Score Calculator

## Context
- Core business logic library for the Customer Intelligence Dashboard
- Provides predictive analytics for customer relationship health and churn risk
- Used by the `CustomerHealthDisplay` widget and any other component needing health scoring
- Consumed by dashboard operators and business stakeholders to assess account status at a glance

## Requirements

### Functional Requirements
- Calculate a customer health score on a 0–100 scale from four weighted input factors:
  - Payment history: 40%
  - Engagement metrics: 30%
  - Contract information: 20%
  - Support satisfaction: 10%
- Classify the resulting score into risk levels:
  - Healthy (71–100)
  - Warning (31–70)
  - Critical (0–30)
- Expose individual scoring functions for each factor alongside the main composite function
- Validate all inputs and surface descriptive errors for missing or out-of-range data
- Handle edge cases: new customers with no history, missing optional fields, zero-value metrics

### Factor Scoring Details

#### Payment Score (40%)
- Inputs: days since last payment, average payment delay (days), overdue amount
- Lower delay and zero overdue = higher score; significant overdue = Critical range

#### Engagement Score (30%)
- Inputs: login frequency (logins/month), feature usage count, support ticket count
- Higher login frequency and feature usage = higher score; excessive tickets may lower score

#### Contract Score (20%)
- Inputs: days until renewal, contract value, recent upgrades (boolean or count)
- Imminent renewal with no upgrade activity = lower score; recent upgrades = higher score

#### Support Score (10%)
- Inputs: average resolution time (hours), satisfaction score (0–10), escalation count
- Low resolution time, high satisfaction, and zero escalations = higher score

### UI Component Requirements
- `CustomerHealthDisplay` widget displaying:
  - Overall numeric score with color-coded badge (red / yellow / green)
  - Expandable breakdown panel showing each factor's individual score and weight
  - Loading skeleton state while data is being fetched/computed
  - Error state with descriptive message when inputs are invalid
- Real-time score update when the selected customer changes in `CustomerSelector`

### Data Requirements
- TypeScript interfaces for all input structures: `PaymentData`, `EngagementData`, `ContractData`, `SupportData`, `CustomerHealthInput`
- TypeScript interfaces for all output structures: `FactorScore`, `HealthScoreResult` (includes composite score, risk level, and per-factor breakdown)
- All fields documented with JSDoc including units and valid ranges

### Integration Requirements
- Calculator functions imported by `CustomerHealthDisplay` and any future analytics components
- `CustomerHealthDisplay` receives a `CustomerHealthInput` prop; no internal data fetching
- Consistent color coding with existing dashboard health indicators (`text-red-500`, `text-yellow-500`, `text-green-500`)

## Constraints

### Technical Stack
- TypeScript with strict mode
- Pure functions with no side effects (`lib/healthCalculator.ts`)
- No external runtime dependencies for core calculation logic
- Next.js 15 / React 19 for the `CustomerHealthDisplay` UI component
- Tailwind CSS for styling

### Performance Requirements
- Calculations must complete synchronously and in < 1ms per customer for real-time dashboard use
- Memoize or cache results when the same `CustomerHealthInput` object reference is passed repeatedly
- No unnecessary re-computation when unrelated dashboard state changes

### Design Constraints
- `CustomerHealthDisplay` follows existing card/widget pattern: `rounded-lg`, `shadow-sm`
- Color thresholds strictly aligned with the dashboard system: red 0–30, yellow 31–70, green 71–100
- Expandable breakdown uses accessible disclosure pattern (e.g., `<details>` or controlled toggle)

### File Structure and Naming
- Calculator library: `src/lib/healthCalculator.ts`
- All interfaces exported from `src/lib/healthCalculator.ts`
- UI component: `src/components/CustomerHealthDisplay.tsx`
- Props interface: `CustomerHealthDisplayProps` exported from component file
- Custom error classes in `src/lib/healthCalculator.ts`, extending `Error`

### Algorithm Documentation
- JSDoc on every exported function explaining the formula, weighting rationale, and valid input ranges
- Inline comments for non-obvious normalization or clamping logic
- `ASSUMPTIONS.md` or equivalent section documenting business assumptions (e.g., "30+ days overdue = max penalty")

### Security Considerations
- No `dangerouslySetInnerHTML` in `CustomerHealthDisplay`
- Input validation rejects non-numeric values before calculation to prevent NaN propagation

## Acceptance Criteria

### Calculator Library
- [ ] `calculateHealthScore` returns a score in [0, 100] for all valid inputs
- [ ] Composite score equals the weighted sum of the four factor scores (±0.5 rounding tolerance)
- [ ] Risk level is `"Healthy"` for scores 71–100, `"Warning"` for 31–70, `"Critical"` for 0–30
- [ ] Each factor scoring function is exported and independently testable
- [ ] Invalid or missing required inputs throw a descriptive custom error (not a generic Error)
- [ ] New-customer edge case (all zeroes / no history) produces a valid score without throwing
- [ ] All interfaces (`CustomerHealthInput`, `HealthScoreResult`, etc.) are exported and strictly typed
- [ ] No TypeScript strict mode errors
- [ ] JSDoc present on all exported functions and interfaces

### UI Component
- [ ] Displays overall score with correct color coding for all three risk levels
- [ ] Expandable breakdown shows each factor's label, score, and weight percentage
- [ ] Loading state renders a skeleton/placeholder without layout shift
- [ ] Error state renders a descriptive message when invalid data is provided
- [ ] Score updates immediately when a different customer is selected in `CustomerSelector`
- [ ] No console errors or warnings during render
- [ ] Layout is responsive and consistent with other dashboard widgets

### Testing
- [ ] Unit tests cover all four individual factor scoring functions
- [ ] Unit tests verify composite score math across at least three realistic customer scenarios
- [ ] Boundary tests confirm correct risk-level classification at scores 0, 30, 31, 70, 71, and 100
- [ ] Error-handling tests confirm custom errors are thrown for invalid inputs
- [ ] Edge-case tests cover new customers and missing optional fields
