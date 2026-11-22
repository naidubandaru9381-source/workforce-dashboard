# Workforce Dashboard

A production-oriented employee management dashboard built with **Next.js App Router, TypeScript, Redux Toolkit, RTK Query, MSW, React Hook Form, Zod, Tailwind CSS, Jest, React Testing Library, and Playwright**.

The application demonstrates authentication, role-based access, employee management, Kanban task management, leave management, dashboard analytics, optimistic updates, server-side pagination, URL-driven filters, responsive UI, accessibility, and performance optimization.

---

## Features

### Authentication

- Login with validation and error handling
- Protected application routes
- Intended-destination redirect after authentication
- Access-token based authentication
- Refresh-token handling through RTK Query
- Concurrent `401` requests handled with a refresh mutex
- Clean logout when token refresh fails
- Role-based UI and route protection
- Forbidden-state handling

### Dashboard

- Headcount by department
- Task completion rate
- Overdue task count
- Upcoming leave
- Date-range filtering
- Accessible data visualizations
- Text alternatives for chart information
- Server-side initial dashboard summary
- RTK Query hydration without unnecessary duplicate requests
- Independent loading/error boundaries

### Employee Directory

- Server-side pagination
- Server-side sorting
- Multi-column sorting
- Department and status filtering
- Join-date range filtering
- Debounced search
- URL-synchronized filters and pagination
- Employee edit panel
- Server validation error mapping
- Bulk-action support
- Virtualized infinite-list implementation

### Kanban Task Management

- Todo
- In Progress
- In Review
- Done
- Drag-and-drop using `dnd-kit`
- Keyboard-accessible interactions
- Optimistic task movement
- Rollback on server failure
- Task side panel
- Comments and activity
- Background polling
- Dragged-card protection during polling

### Leave Management

- Leave request form
- Date-range selection
- Working-day calculation
- Weekend exclusion
- Holiday exclusion
- Leave balance display
- Manager approval/rejection
- Conflict handling
- Cache invalidation after mutations

### Cross-cutting UX

- Route-level loading states
- Error boundaries
- Not-found page
- Global toast notifications
- Offline indicator
- Light/dark theme
- Responsive layouts
- Keyboard accessibility
- Reduced-motion considerations

---

## Tech Stack

| Technology            | Purpose                                 |
| --------------------- | --------------------------------------- |
| Next.js               | App Router and application framework    |
| TypeScript            | Static typing                           |
| React                 | UI                                      |
| Redux Toolkit         | Application state                       |
| RTK Query             | Server state, caching and API mutations |
| MSW                   | Mock API                                |
| React Hook Form       | Form management                         |
| Zod                   | Validation                              |
| Tailwind CSS          | Styling                                 |
| dnd-kit               | Accessible drag and drop                |
| Jest                  | Unit/integration testing                |
| React Testing Library | Component testing                       |
| Playwright            | End-to-end testing                      |
| Husky                 | Git hooks                               |
| lint-staged           | Pre-commit checks                       |
| Prettier              | Formatting                              |
| ESLint                | Code quality                            |

---

## Getting Started

### Requirements

- Node.js 20+
- npm

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Run production build

```bash
npm run build
```

### Start production server

```bash
npm run start
```

---

## Mock API

The application uses **Mock Service Worker (MSW)** to provide the backend API required by the assignment.

The mock API includes endpoints for:

- Authentication
- Token refresh
- Employees
- Projects
- Tasks
- Leave requests
- Dashboard summary
- Holidays

The mock data is generated locally and includes:

- 5,000+ employees
- 20,000+ tasks
- Seeded projects and leave requests

The mock API also simulates realistic asynchronous behavior and failure scenarios required for testing error handling and optimistic updates.

---

## Architecture

The project follows a feature-oriented structure.

```text
workforce-dashboard/
├── app/
│   ├── dashboard/
│   ├── employees/
│   ├── leave/
│   ├── login/
│   ├── projects/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── MSWProvider.tsx
│   └── shared UI components
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── employees/
│   ├── kanban/
│   └── leave/
│
├── mocks/
│   ├── data/
│   ├── handlers/
│   ├── browser.ts
│   └── server.ts
│
├── store/
│   ├── api/
│   └── store configuration
│
├── tests/
│   ├── integration/
│   ├── unit/
│   └── e2e/
│
├── types/
│
├── reports/
│   ├── lighthouse-dashboard-desktop.html
│   └── lighthouse-employee-desktop.html
│
├── proxy.ts
└── README.md
```

### Why feature-based architecture?

Feature-specific API logic, components, hooks, validation and state are kept close to the feature that uses them.

This makes the application easier to:

- Maintain
- Test
- Extend
- Debug
- Scale

Shared infrastructure such as the Redux store, API configuration, types and reusable components remains separate from feature-specific implementation.

---

## RTK Query Architecture

RTK Query is used for server state management.

The application uses a shared API layer with feature-specific endpoints.

### Why RTK Query?

RTK Query provides:

- Request caching
- Automatic request lifecycle handling
- Cache invalidation
- Loading and error states
- Mutation handling
- Refetching
- Optimistic updates
- Typed API responses

### Tag design

Entity tags are used to invalidate related cached data after mutations.

For example:

```text
Employee
Employee LIST
Task
Task LIST
Leave
Leave LIST
Dashboard
```

Mutations invalidate only the relevant cached resources instead of unnecessarily refetching the entire application.

### Cache behavior

Queries are cached through RTK Query and are refetched according to their configured lifecycle and invalidation rules.

Mutations invalidate affected tags so dependent screens receive updated data.

---

## Optimistic Updates

Optimistic updates are used where immediate UI feedback improves the user experience.

The Kanban task movement flow:

```text
User moves task
      ↓
Update UI immediately
      ↓
Send mutation request
      ↓
Success
  → Keep optimistic state

Failure
  → Roll back previous state
  → Display error feedback
```

The implementation also handles rapid successive task movements to maintain consistent client state.

---

## Authentication and Token Refresh

API requests use the application's authentication mechanism.

When an API request receives a `401` response:

```text
API request
    ↓
401 Unauthorized
    ↓
Check refresh state
    ↓
One request performs refresh
    ↓
Other requests wait
    ↓
Refresh succeeds
    ↓
Retry original requests
```

A mutex is used to prevent multiple simultaneous refresh requests.

If refresh fails, the user is logged out and redirected to authentication.

---

## URL State

Employee directory state such as:

- Search
- Filters
- Sorting
- Pagination

is synchronized with the URL.

This provides:

- Shareable URLs
- Browser back/forward support
- Page refresh persistence
- Predictable navigation state

---

## Server-Side Rendering and Hydration

The dashboard summary is initially obtained on the server.

The server result is then integrated with the client-side RTK Query state so that the application does not unnecessarily request the same dashboard data again after hydration.

The approach combines:

- Next.js Server Components
- RTK Query
- Server-side data fetching
- Client-side cache hydration

---

## Performance

Performance was validated using **Chrome Lighthouse 13.5.0** with the production build.

### Dashboard — Desktop

| Metric                   |     Result |
| ------------------------ | ---------: |
| Performance              |    **100** |
| Accessibility            |    **100** |
| Best Practices           |    **100** |
| SEO                      |    **100** |
| First Contentful Paint   |  **0.2 s** |
| Largest Contentful Paint |  **0.9 s** |
| Total Blocking Time      | **240 ms** |
| Cumulative Layout Shift  |      **0** |
| Speed Index              |  **0.5 s** |

### Employee List — Desktop

The Employee List also achieved:

| Category       |  Result |
| -------------- | ------: |
| Performance    | **100** |
| Accessibility  | **100** |
| Best Practices | **100** |
| SEO            | **100** |

### Lighthouse reports

Full HTML Lighthouse reports are available in:

- `reports/lighthouse-dashboard-desktop.html`
- `reports/lighthouse-employee-desktop.html`

### Performance considerations

The application uses performance-oriented techniques including:

- Server Components where appropriate
- Avoiding unnecessary client components
- Lazy initialization of large mock datasets
- Virtualized employee rendering
- Debounced employee search
- Server-side pagination
- Optimized dashboard calculations
- Next.js font optimization
- Production webpack build
- Cached API data through RTK Query

Lighthouse also identified opportunities for further optimization, including unused JavaScript and long main-thread tasks. These did not prevent the required Lighthouse thresholds from being achieved.

---

## Accessibility

The application was tested with Lighthouse accessibility audits.

Both required desktop pages achieved:

- **100 Accessibility score**

Accessibility considerations include:

- Keyboard-accessible controls
- Logical focus order
- Semantic landmarks
- Accessible interactive controls
- ARIA usage where required
- Keyboard-accessible Kanban interactions
- Responsive layouts
- Reduced-motion considerations
- Accessible loading/error states
- Text alternatives for dashboard visualizations

Automated Lighthouse testing does not replace manual accessibility testing, so keyboard and screen-reader behavior should also be manually verified before production deployment.

---

## Testing

### Unit and integration tests

Run:

```bash
npm test
```

Coverage:

```bash
npm run test:coverage
```

The test suite covers authentication, API behavior, employee URL state, edit forms, RTK Query behavior, optimistic rollback and refresh handling.

### End-to-end tests

Run:

```bash
npm run test:e2e
```

The Playwright suite covers key application flows including:

1. Authentication and protected-route redirect
2. Kanban task movement with simulated failure
3. Leave submission and approval flow

---

## Code Quality

### ESLint

```bash
npm run lint
```

### Prettier

The project uses Prettier for consistent formatting.

### Pre-commit checks

Husky and lint-staged run formatting and ESLint checks on staged files before commits.

---

## Production Validation

Before submitting the project, run:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

The production application can then be started with:

```bash
npm run start
```

---

## Known Limitations

- The backend is simulated using MSW rather than a real production server.
- Authentication and token handling are mock implementations for the assignment.
- Mock data is generated locally.
- Lighthouse diagnostics may identify additional JavaScript optimization opportunities even when the required performance thresholds are satisfied.
- A production deployment would require a real backend, persistent database and production authentication infrastructure.

---

## Future Improvements

Potential production improvements include:

- Real backend integration
- Persistent database
- Real authentication/authorization service
- Server-side observability
- Automated CI/CD
- Additional accessibility testing with real assistive technologies
- Further JavaScript bundle optimization

---

## License

This project was created as part of a Frontend Developer technical assignment.
