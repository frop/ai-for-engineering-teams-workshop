# Feature: PredictiveIntelligence Widget

## Context
- Unified intelligence panel for the Customer Intelligence Dashboard that surfaces proactive risk alerts alongside real-time market sentiment for the selected customer's company
- Combines two data pipelines: the rule-based alerts engine (`lib/alerts.ts`) and the `MarketIntelligenceService` — presenting them in a single coordinated widget so account managers see internal health risk signals and external market signals side by side
- Receives the selected customer object from `CustomerSelector` and auto-refreshes both panels whenever the selection changes
- Used by account managers and customer success teams who need to act quickly on at-risk accounts, informed by both internal engagement data and external market context
- Sits in the main dashboard grid alongside `CustomerHealthDisplay` and `MarketIntelligenceWidget`; reuses their established visual patterns so no new design language is introduced

## Requirements

### Functional Requirements

#### Alerts Panel (`src/lib/alerts.ts`)
- Evaluate all five alert rules against the selected customer's current data and return a prioritized alert list:
  - **High Priority**: Payment Risk (overdue > 30 days OR health score drop > 20 pts in 7 days), Engagement Cliff (login frequency drop > 50% vs. 30-day average), Contract Expiration Risk (expires in < 90 days AND health score < 50)
  - **Medium Priority**: Support Ticket Spike (> 3 tickets in 7 days OR any escalated ticket), Feature Adoption Stall (no new feature usage in 30 days for growing accounts)
- Deduplicate: never return more than one alert per customer/rule pair per evaluation cycle
- Apply per-rule cooldown periods to suppress re-triggering within the configured window
- Attach a `recommendedAction` string and trigger context to every generated alert
- Dismissing an alert removes it from the active list; dismissed alerts are preserved in a history log

#### Market Signals Panel (`src/services/marketIntelligenceService.ts`)
- Fetch market sentiment and headlines for the selected customer's `company` via `GET /api/market-intelligence/[company]`
- Cache results with a 10-minute TTL (in-memory, keyed by normalized company name)
- Display sentiment label and score, article count, last-updated timestamp, and up to 3 headlines
- "Refresh" button bypasses cache and forces a new fetch
- On company change, discard the previous result immediately and show the loading skeleton until the new fetch resolves

#### Combined `PredictiveIntelligenceWidget` Component
- Two-section layout within a single card: **Risk Alerts** (top) and **Market Signals** (bottom), separated by a visual divider
- Sections collapse independently on mobile to fit narrow viewports
- Each section has its own loading skeleton and error state; a failure in one section does not affect the other
- Header shows the selected customer name and company so the user always knows which account is in view
- Badge on the widget card title showing count of active high-priority alerts (hidden when zero)

#### Alert Detail Interaction
- Clicking an alert row expands an inline detail panel showing: trigger reason, recommended action, triggered timestamp
- Dismiss button per alert row; dismissed alerts move to a collapsible "Dismissed" history section at the bottom of the alerts panel
- Empty state when no alerts are active for the selected customer

### Data Requirements
- `Alert` interface: `{ id: string; customerId: string; rule: AlertRule; priority: "high" | "medium"; title: string; reason: string; recommendedAction: string; triggeredAt: Date; dismissed: boolean }`
- `AlertRule` union type: `"payment-risk" | "engagement-cliff" | "contract-expiration" | "support-spike" | "adoption-stall"`
- `MarketIntelligenceResponse` (reused from `src/services/marketIntelligenceService.ts`): `{ company, sentiment, articleCount, headlines, lastUpdated }`
- `PredictiveIntelligenceWidgetProps`: `{ customer: Customer; className?: string }`
- Mock data in `src/data/mock-customers.ts` extended with fields required by all five alert rules for at least 5 representative customers (healthy, at-risk payment, churning engagement, expiring contract, support spike)

### Integration Requirements
- `PredictiveIntelligenceWidget` is rendered in `src/app/page.tsx` inside a `<Suspense>` boundary
- Selected customer flows from `CustomerSelector` → Dashboard page state → `PredictiveIntelligenceWidget` prop (no internal fetching of customer data)
- Alerts engine (`lib/alerts.ts`) is called as a pure function — no API route needed for alerts evaluation
- Market signals fetched via the existing `/api/market-intelligence/[company]` route; no direct service imports in the UI component
- Color coding (`text-red-500` / `text-yellow-500` / `text-green-500`) consistent with `CustomerHealthDisplay` and `MarketIntelligenceWidget`

## Constraints

### Technical Stack and Frameworks
- Next.js 15 (App Router), React 19, TypeScript strict mode, Tailwind CSS
- `lib/alerts.ts`: pure functions only — no side effects, no global state, no async operations
- `MarketIntelligenceService`: in-memory cache with TTL; class-based following the established service pattern

### Performance Requirements
- Alert rule evaluation for a single customer must complete synchronously in < 5 ms
- Market signals cache hit must resolve in < 1 ms
- Widget must not re-evaluate alerts or re-fetch market data when unrelated dashboard state changes (stable `customer.id` = no new work)
- Skeleton dimensions match loaded content to prevent cumulative layout shift

### Design Constraints
- Widget card: `rounded-lg`, `shadow-sm`, consistent padding (`p-4` or `p-6`) — same as `MarketIntelligenceWidget`
- Priority badge colors: `bg-red-100 text-red-700` (High), `bg-yellow-100 text-yellow-700` (Medium)
- Market sentiment colors: `text-green-500` (positive), `text-yellow-500` (neutral), `text-red-500` (negative)
- Alert count badge on the card header: `bg-red-500 text-white` pill, hidden when count is 0
- Collapsed section headers must remain keyboard-accessible (toggle via `Enter` / `Space`)
- Maximum 5 active alerts shown by default; a "Show all" link reveals the rest

### File Structure and Naming
- `src/lib/alerts.ts` — pure alert rules engine and TypeScript interfaces
- `src/lib/__tests__/alerts.test.ts` — unit tests for all rules
- `src/components/PredictiveIntelligenceWidget.tsx` — combined widget component
- `src/components/AlertRow.tsx` — single dismissible alert row with expandable detail panel
- All interfaces and the `AlertRule` type exported from `src/lib/alerts.ts`
- PascalCase for components; camelCase for functions and variables

### Security Considerations
- No raw error messages, stack traces, or internal paths shown in any error state
- Company name passed to the market intelligence API is validated with the same regex used by the API route (`/^[a-zA-Z0-9 .,&'-]{1,100}$/`) before the request is made
- Alert `reason` and `recommendedAction` strings are static templates — no user-provided data interpolated into them
- No `dangerouslySetInnerHTML` anywhere in the widget or its sub-components
- Dismissed alert IDs stored in component state only — no persistence to `localStorage` or external storage without explicit user consent

## Acceptance Criteria

### Alerts Engine (`lib/alerts.ts`)
- [ ] All five rules trigger correctly against synthetic customer data that meets each threshold exactly
- [ ] No duplicate alerts (same `customerId` + `rule`) appear in a single evaluation result
- [ ] High-priority alerts always precede medium-priority alerts in the returned array
- [ ] Cooldown logic suppresses re-triggering the same rule within the configured window (verified with time-shifted test data)
- [ ] Each alert includes a non-empty `recommendedAction` string
- [ ] Throws a descriptive error when required customer fields are missing or out of range

### Market Signals Panel
- [ ] Correct sentiment color renders for positive, neutral, and negative scores
- [ ] Article count and "Last updated" timestamp are displayed
- [ ] Up to 3 headlines shown; fewer displayed when API returns fewer
- [ ] Loading skeleton displayed while fetch is in progress; no layout shift on resolution
- [ ] Error state shows a user-friendly message when the API returns a non-200 response
- [ ] "Refresh" button triggers a new fetch, bypasses cache, and updates displayed data
- [ ] Changing the selected customer triggers a new fetch and clears the previous company's data

### Alerts Panel UI
- [ ] Active alerts render with correct priority badge colors (red / yellow)
- [ ] Clicking an alert row expands the inline detail panel showing reason, recommended action, and timestamp
- [ ] Dismiss button removes the alert from the active list and appends it to the dismissed history section
- [ ] Dismissed alerts do not reappear in the active list after dismissal within the same session
- [ ] Empty state message is shown when no alerts are active for the selected customer
- [ ] "Show all" link reveals alerts beyond the initial 5 when more exist
- [ ] Alert count badge on the card header displays the correct count of active high-priority alerts and hides when count is 0

### Combined Widget
- [ ] Both sections render independently; a simulated fetch failure in Market Signals does not affect the Alerts panel
- [ ] Each section has its own loading skeleton and error state
- [ ] Header displays the selected customer's name and company name
- [ ] Sections collapse and expand correctly on mobile viewports using keyboard (Enter / Space) as well as mouse
- [ ] Selecting a different customer in `CustomerSelector` updates both panels within a single render cycle
- [ ] Widget renders inside a `<Suspense>` boundary in `src/app/page.tsx` without errors

### Quality and Integration
- [ ] No TypeScript strict mode errors across all new files
- [ ] No console errors or warnings during render
- [ ] `lib/alerts.ts` unit tests achieve ≥ 90% line coverage
- [ ] All alert rule, market signals, and component tests pass in CI
- [ ] Color coding is visually consistent with `CustomerHealthDisplay` and `MarketIntelligenceWidget`
