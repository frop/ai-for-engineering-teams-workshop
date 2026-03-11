# Feature: Market Intelligence Widget

## Context
- Dashboard widget providing real-time market sentiment and news analysis for customer companies
- Composed of three layers: an API route, a service class, and a UI component
- Receives the selected customer's `company` name from the parent Dashboard and auto-fetches on change
- Used by dashboard operators to assess external market conditions affecting customer accounts
- Sits alongside other dashboard widgets; follows the same card/widget visual pattern established in the project

## Requirements

### Functional Requirements

#### API Layer
- Next.js Route Handler at `GET /api/market-intelligence/[company]`
- Validates and sanitizes the `company` path parameter before use
- Delegates to `MarketIntelligenceService` for data retrieval
- Returns a consistent JSON response:
  ```json
  {
    "company": "string",
    "sentiment": { "score": number, "label": "positive"|"neutral"|"negative", "confidence": number },
    "articleCount": number,
    "headlines": [{ "title": "string", "source": "string", "publishedAt": "string" }],
    "lastUpdated": "ISO 8601 string"
  }
  ```
- Simulates realistic API delay (200–600 ms) for authentic UX
- Returns 400 for invalid/empty company name; 500 with sanitized message for unexpected errors

#### Service Layer
- `MarketIntelligenceService` class in `src/services/marketIntelligenceService.ts`
- Uses `generateMockMarketData` and `calculateMockSentiment` from `src/data/mock-market-intelligence.ts`
- In-memory cache with 10-minute TTL; cache key is the normalized (lowercased, trimmed) company name
- Custom `MarketIntelligenceError` class extending `Error` with a `code` field (`INVALID_INPUT` | `SERVICE_ERROR`)
- All public methods are pure-function-friendly (no hidden side effects beyond cache mutation)

#### UI Component
- `MarketIntelligenceWidget` in `src/components/MarketIntelligenceWidget.tsx`
- Accepts `company` prop (string); fetches from the API route on mount and whenever `company` changes
- Displays:
  - Sentiment badge: color-coded label + numeric score (green = positive, yellow = neutral, red = negative)
  - Article count and "Last updated" timestamp
  - Top 3 headlines with source and publication date
- Loading skeleton state while the fetch is in progress (no layout shift)
- Error state with a user-friendly message (no raw error details exposed)
- Manual "Refresh" button that bypasses cache and re-fetches

#### Dashboard Integration
- `MarketIntelligenceWidget` rendered in the main Dashboard (`src/app/page.tsx`) inside a `<Suspense>` boundary
- Receives `company` from the currently selected `Customer` object (sourced from `CustomerSelector`)
- Fits the existing responsive grid layout alongside other widgets

### Data Requirements
- Reuses `MockHeadline` and `MockMarketData` interfaces from `src/data/mock-market-intelligence.ts`
- New exported interface `MarketIntelligenceResponse` in `src/services/marketIntelligenceService.ts` matching the API response shape above
- `MarketIntelligenceWidgetProps`: `{ company: string; className?: string }`

### Integration Requirements
- API route imports only from the service layer; no direct mock-data imports
- `MarketIntelligenceWidget` calls `/api/market-intelligence/[company]` via `fetch`; no direct service imports
- Color coding aligned with existing dashboard system: `text-green-500` / `text-yellow-500` / `text-red-500`

## Constraints

### Technical Stack
- Next.js 15 App Router — Route Handler (`src/app/api/market-intelligence/[company]/route.ts`)
- React 19 with hooks (`useState`, `useEffect`) for the UI component
- TypeScript with strict mode throughout
- Tailwind CSS for styling

### Performance Requirements
- Cache hits must resolve in < 1 ms (in-memory lookup)
- Widget must not re-fetch when unrelated dashboard state changes (stable `company` prop = no new request)
- Skeleton layout dimensions match the loaded content to prevent cumulative layout shift

### Design Constraints
- Widget follows card pattern: `rounded-lg`, `shadow-sm`, consistent padding (`p-4` or `p-6`)
- Sentiment badge uses same Tailwind color classes as the health score system
- Headline list limited to 3 items; truncate long titles to one line with `truncate`
- "Last updated" uses a muted text style (`text-sm text-gray-500`)

### File Structure and Naming
- API route: `src/app/api/market-intelligence/[company]/route.ts`
- Service: `src/services/marketIntelligenceService.ts`
- UI component: `src/components/MarketIntelligenceWidget.tsx`
- All interfaces and the error class exported from the service file
- PascalCase for components and classes; camelCase for functions and variables

### Security Considerations
- Company name parameter validated with a regex or length check before any processing (`/^[a-zA-Z0-9 .,&'-]{1,100}$/`)
- No raw error messages, stack traces, or internal paths returned to the client
- No `dangerouslySetInnerHTML` in the UI component
- Mock data generation only; no external HTTP calls, eliminating SSRF risk

## Acceptance Criteria

### API Route
- [ ] `GET /api/market-intelligence/Acme` returns 200 with the correct JSON shape
- [ ] `GET /api/market-intelligence/` (empty) or a name exceeding 100 characters returns 400
- [ ] Response includes `sentiment`, `articleCount`, `headlines` (≤ 3), and `lastUpdated`
- [ ] Two identical requests within 10 minutes return the same `lastUpdated` value (cache hit)
- [ ] A request after cache expiry returns a new `lastUpdated` value
- [ ] Error responses contain no stack traces or internal file paths

### Service Layer
- [ ] `MarketIntelligenceService` is instantiable and its public method returns `MarketIntelligenceResponse`
- [ ] Cache stores results and serves them within TTL without calling mock generators again
- [ ] Cache invalidates after 10 minutes (verified via time manipulation in tests)
- [ ] Invalid input throws `MarketIntelligenceError` with `code: "INVALID_INPUT"`
- [ ] `MarketIntelligenceError` is exported and instanceof-checkable
- [ ] No TypeScript strict mode errors

### UI Component
- [ ] Widget renders sentiment badge with correct color for positive, neutral, and negative values
- [ ] Article count and "Last updated" timestamp are displayed
- [ ] Exactly 3 headlines are shown (or fewer if the API returns fewer)
- [ ] Loading skeleton is shown while fetch is in progress; no layout shift on resolution
- [ ] Error state displays a user-friendly message when the API returns a non-200 response
- [ ] "Refresh" button triggers a new fetch and updates the displayed data
- [ ] `company` prop change triggers a new fetch and replaces previous results
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] No console errors or warnings during render

### Dashboard Integration
- [ ] Widget is rendered within a `<Suspense>` boundary in `src/app/page.tsx`
- [ ] Widget receives the selected customer's `company` field from `CustomerSelector`
- [ ] Layout remains responsive and consistent with other dashboard widgets
