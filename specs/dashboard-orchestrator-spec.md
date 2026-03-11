# Feature: DashboardOrchestrator

## Context
- Top-level orchestration layer for the Customer Intelligence Dashboard, responsible for composing all widgets and enforcing production-grade cross-cutting concerns
- Acts as the single root boundary for error handling, performance optimization, accessibility structure, and export coordination
- Sits above `CustomerSelector`, `CustomerHealthDisplay`, `AlertsWidget`, and any future dashboard widgets — each widget is isolated inside its own error boundary so a single failure cannot bring down the whole dashboard
- Used by business-critical operations teams who require 100% uptime confidence, keyboard accessibility, and the ability to export compliance-relevant data at any time

## Requirements

### Functional Requirements

#### Error Boundary System
- Render a `DashboardErrorBoundary` at the application root that catches unhandled React errors and displays a full-page recovery UI with a retry button
- Render a `WidgetErrorBoundary` around every individual widget so a failing widget degrades gracefully without affecting siblings
- Custom error classes (`DashboardError`, `WidgetError`, `ExportError`) extend `Error` with `code`, `context`, and `userMessage` fields
- In development mode, display full stack traces and component trees inside error UIs; in production, show only safe user-facing messages
- Retry logic capped at 3 attempts per widget per session; after exhaustion show a permanent fallback with a support contact link
- Automatic error reporting: errors are logged to the console in development and forwarded to the configured monitoring endpoint in production

#### Data Export System (`src/lib/exportUtils.ts`)
- Export customer data, health score reports, alert history, and market intelligence summaries in CSV and JSON formats
- Support configurable filters: date range, customer segment, risk level, alert priority
- Streaming export for datasets > 1,000 rows with a visible progress bar and a cancel button
- File names follow the convention `{dataType}_{segment}_{YYYY-MM-DD}.{ext}` (e.g., `health-scores_enterprise_2026-03-11.csv`)
- All export operations are logged to an audit trail (timestamp, user action, record count, format)
- Export endpoints validate user permissions before generating files; reject unauthorized requests with a clear error message

#### Performance Optimization
- Lazy-load each widget with `React.lazy` and wrap in `Suspense` with a skeleton placeholder
- Memoize widget props with `useMemo` / `useCallback` to prevent unnecessary re-renders when unrelated state changes
- Virtual scrolling for the customer list when it exceeds 50 entries
- Service worker registers on first load to cache static assets and API responses; supports offline read-only mode
- Core Web Vitals instrumented and reported: FCP, LCP, CLS, TTI

#### Accessibility
- Semantic landmark structure: `<header>`, `<nav>`, `<main>`, `<aside>` (alert panel), `<footer>`
- Skip-to-main-content link as the first focusable element on the page
- Logical tab order following visual reading flow; no focus traps outside of modals and dialogs
- All dynamic content changes (alerts, score updates) announced via ARIA live regions (`aria-live="polite"` for routine updates, `aria-live="assertive"` for high-priority alerts)
- Keyboard shortcuts for common actions: `Alt+E` to open export panel, `Alt+A` to jump to alerts, `Alt+C` to focus customer selector
- Loading states announce progress to screen readers (`aria-busy`, `aria-label` on spinners/skeletons)
- All interactive elements meet WCAG 2.1 AA contrast ratio (≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI components)

#### Security Hardening
- Content Security Policy header configured in `next.config.ts`: `default-src 'self'`; explicit allowlists for fonts, images, and configured API origins
- Security headers set for every response: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- All user-provided inputs (search queries, filter values, export parameters) sanitized before use — no raw interpolation into queries or file paths
- Rate limiting on export endpoints: maximum 10 export requests per user per minute
- Error messages never include internal paths, stack traces, or sensitive customer data in production responses

#### Monitoring and Health Checks
- `GET /api/health` endpoint returns `{ status: "ok" | "degraded", services: { ... }, version, timestamp }` for load-balancer probes
- Core Web Vitals sent to the monitoring endpoint on each page load
- Error rate tracked per widget; if any widget exceeds 5 errors/minute an automated alert is generated

### Data Requirements
- `DashboardConfig` interface: `{ monitoring: { endpoint: string }, export: { maxRowsSync: number, rateLimit: number }, featureFlags: Record<string, boolean> }`
- `ExportOptions` interface: `{ format: "csv" | "json"; dataType: "customers" | "healthScores" | "alerts" | "marketIntelligence"; filters: ExportFilters }`
- `ExportFilters` interface: `{ dateRange?: { from: Date; to: Date }; customerSegment?: string; riskLevel?: RiskLevel[]; alertPriority?: AlertPriority[] }`
- `ErrorReport` interface: `{ errorId, code, message, componentStack, timestamp, userId?, sessionId }`

### Integration Requirements
- Orchestrates all previously built widgets: `CustomerSelector`, `CustomerHealthDisplay`, `AlertsWidget`, and `MarketIntelligenceWidget`
- Each widget slot is independently mountable; adding or removing a widget requires changes only at the orchestrator composition level
- Shared `DashboardContext` provides selected customer, global error handler, and export trigger to all child widgets — no prop drilling beyond one level
- Export system works with both real-time widget data and cached snapshots
- Monitoring hooks integrate without modifying individual widget internals

## Constraints

### Technical Stack and Frameworks
- Next.js 15 (App Router) — security headers and CSP configured in `next.config.ts`
- React 19 — `React.lazy`, `Suspense`, `ErrorBoundary` (class component) for boundary isolation
- TypeScript strict mode throughout
- Tailwind CSS; no custom CSS files except for a single `globals.css` reset

### Performance Requirements
- Initial page load < 3 s on standard broadband; FCP < 1.5 s, LCP < 2.5 s, CLS < 0.1, TTI < 3.5 s
- Smooth 60 fps for all interactions and animations
- Individual widget render time < 16 ms (one frame budget) after initial mount
- Bundle size budget: main chunk < 150 kB gzipped; each lazy widget chunk < 50 kB gzipped

### Design Constraints
- Dashboard grid: two-column layout on ≥ 1024 px, single-column stacked on < 1024 px
- Error fallback UIs must occupy the exact space of the widget they replace (no layout shift)
- Export panel opens as a slide-over drawer (not a full-page navigation)
- Focus indicators must be clearly visible in both light and high-contrast modes

### File Structure and Naming
- `src/components/DashboardOrchestrator.tsx` — root composition component
- `src/components/DashboardErrorBoundary.tsx` — application-level error boundary
- `src/components/WidgetErrorBoundary.tsx` — widget-level error boundary
- `src/components/ExportPanel.tsx` — export UI drawer
- `src/lib/exportUtils.ts` — format-agnostic export handlers
- `src/lib/monitoring.ts` — Core Web Vitals reporting and error forwarding
- `src/context/DashboardContext.tsx` — shared context provider
- `src/errors/index.ts` — custom error classes
- `src/app/api/health/route.ts` — health check API route
- `next.config.ts` — CSP and security header configuration

### Props and Context Interfaces
- `DashboardOrchestratorProps`: `{ config: DashboardConfig }`
- `DashboardContextValue`: `{ selectedCustomerId: string | null; setSelectedCustomerId: (id: string) => void; reportError: (error: ErrorReport) => void; triggerExport: (options: ExportOptions) => void }`

### Security Considerations
- `dangerouslySetInnerHTML` is strictly forbidden across all orchestrator and export components
- File paths in export filenames are constructed from an allowlist of known safe segments — no user input interpolated directly
- Health check endpoint exposes no internal infrastructure details (no hostnames, IPs, or dependency versions)
- CSP nonces or hashes used for any inline scripts required by Next.js runtime

## Acceptance Criteria

### Error Boundaries
- [ ] An error thrown inside any single widget does not crash adjacent widgets or the dashboard shell
- [ ] `DashboardErrorBoundary` renders a full-page recovery UI with a retry button on unhandled root-level errors
- [ ] `WidgetErrorBoundary` renders a widget-sized fallback that preserves dashboard layout (no CLS)
- [ ] Retry logic attempts up to 3 times; after 3 failures the fallback displays a support contact link
- [ ] Development mode shows stack trace and component tree in the error UI; production mode shows only the safe `userMessage`
- [ ] All errors are captured with `errorId`, `timestamp`, and `componentStack` before display

### Export System
- [ ] CSV and JSON exports are generated correctly for all four data types (customers, health scores, alerts, market intelligence)
- [ ] Export filters (date range, segment, risk level, alert priority) correctly narrow the exported dataset
- [ ] Datasets > 1,000 rows stream progressively with a visible progress percentage and a functional cancel button
- [ ] Generated file names follow the `{dataType}_{segment}_{YYYY-MM-DD}.{ext}` convention
- [ ] Export audit log entry is created for every completed or cancelled export
- [ ] Unauthorized export requests are rejected with a 403 response before any data is read

### Performance
- [ ] Lighthouse CI score ≥ 90 for Performance on the production build
- [ ] FCP ≤ 1.5 s, LCP ≤ 2.5 s, CLS ≤ 0.1, TTI ≤ 3.5 s measured on a simulated 4G connection
- [ ] No widget re-renders when an unrelated sibling widget's state changes (verified via React DevTools Profiler)
- [ ] Virtual scrolling activates when the customer list exceeds 50 entries
- [ ] Main JS chunk ≤ 150 kB gzipped; each widget chunk ≤ 50 kB gzipped

### Accessibility
- [ ] axe-core automated scan reports zero WCAG 2.1 AA violations on the full dashboard
- [ ] Skip-to-main-content link is the first focusable element and works correctly with keyboard-only navigation
- [ ] Tab order matches visual reading flow across all viewport sizes
- [ ] High-priority alerts are announced immediately by screen readers via `aria-live="assertive"`
- [ ] Keyboard shortcuts (`Alt+E`, `Alt+A`, `Alt+C`) function correctly and are listed in a discoverable help tooltip
- [ ] All interactive elements pass color-contrast checks in both default and high-contrast modes

### Security
- [ ] `Content-Security-Policy` header is present on every response and blocks inline script execution
- [ ] `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` headers present on every response
- [ ] No stack traces, file paths, or raw error messages appear in production UI or API responses
- [ ] Export rate limiter rejects the 11th request within a 60-second window with a 429 response
- [ ] Input sanitization prevents XSS payloads in search, filter, and export fields

### Monitoring and Health Check
- [ ] `GET /api/health` returns `200 { status: "ok" }` when all services are reachable
- [ ] `GET /api/health` returns `200 { status: "degraded" }` (not 5xx) when a non-critical service is unavailable
- [ ] Core Web Vitals are reported to the monitoring endpoint on each page load in production
- [ ] Widget error rate threshold breach generates an automated alert entry in the monitoring log

### Integration
- [ ] All existing widgets (`CustomerSelector`, `CustomerHealthDisplay`, `AlertsWidget`) render correctly inside the orchestrator without modification
- [ ] Selecting a customer in `CustomerSelector` propagates to all widgets within a single render cycle via `DashboardContext`
- [ ] No TypeScript strict mode errors across all new files
- [ ] Full unit test suite passes for `exportUtils.ts`, custom error classes, and the health check route
