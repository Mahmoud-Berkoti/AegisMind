# AegisMind SIEM Dashboard UI

A production-grade, real-time SIEM dashboard built with React, TypeScript, and modern web technologies.

## Features

- **Real-time updates** via WebSocket connections
- **Interactive visualizations** with Recharts and MapLibre GL
- **Responsive design** that works on all screen sizes
- **Accessibility-first** with ARIA labels and keyboard navigation
- **High performance** - 60fps with 10k+ data points
- **Mock mode** for development without backend

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **MapLibre GL** for interactive maps
- **Zustand** for state management
- **Vitest** + React Testing Library for testing

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server with mock data
pnpm dev

# Start development server with real backend
# (Make sure backend is running on localhost:8080)
VITE_MOCK=false pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui
```

## Development

### Mock Mode

By default, the app runs in mock mode with generated data. This allows you to develop and test the UI without a backend.

To enable mock mode, set `VITE_MOCK=true` in `.env` file or use:

```bash
VITE_MOCK=true pnpm dev
```

### Real Backend

To connect to the real C++ SIEM backend:

1. Make sure the backend is running on `localhost:8080` (REST) and `localhost:8081` (WebSocket)
2. Set `VITE_MOCK=false` in `.env` or run:

```bash
VITE_MOCK=false pnpm dev
```

## Project Structure

```
ui/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── KpiCard.tsx
│   │   ├── Donut.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── WorldMap.tsx
│   │   ├── Timeseries.tsx
│   │   ├── PiePanel.tsx
│   │   ├── Filters.tsx
│   │   ├── Drawer.tsx
│   │   ├── ErrorBanner.tsx
│   │   ├── Skeleton.tsx
│   │   ├── TimePicker.tsx
│   │   └── __tests__/     # Component tests
│   ├── pages/             # Page components
│   │   ├── DeviceSecurity.tsx
│   │   └── Incidents.tsx
│   ├── store/             # State management
│   │   ├── state.ts
│   │   └── hooks.ts
│   ├── lib/               # Utility libraries
│   │   ├── api.ts
│   │   ├── ws.ts
│   │   ├── colors.ts
│   │   ├── format.ts
│   │   └── perf.ts
│   ├── mocks/             # Mock server and data
│   │   ├── server.ts
│   │   └── data.ts
│   ├── test/              # Test setup
│   │   └── setup.ts
│   ├── types.ts           # TypeScript types
│   ├── app.css            # Global styles
│   └── main.tsx           # App entry point
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Architecture

### State Management

The app uses Zustand for global state management. The main store (`src/store/state.ts`) handles:

- Fetching data from the API
- Managing filters and time ranges
- Handling WebSocket updates
- Error states and loading indicators

### Real-time Updates

When connected to the backend WebSocket, the app receives real-time updates for:

- KPI value changes
- Compliance metric updates
- New geo data points
- Incident creation/updates

The WebSocket client (`src/lib/ws.ts`) automatically reconnects on disconnection.

### Performance

The app is optimized for high performance:

- Downsampling large datasets
- RequestAnimationFrame for smooth animations
- Memoization of expensive computations
- Lazy loading of components
- Efficient re-renders with proper React hooks

### Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Screen reader descriptions for charts and visualizations
- Focus management for modals and drawers
- Sufficient color contrast ratios

## API Contracts

### REST Endpoints

- `GET /v1/metrics/device_overview` - Device statistics and KPIs
- `GET /v1/metrics/timeseries` - Time series data for charts
- `GET /v1/metrics/geo` - Geographic distribution of devices
- `GET /v1/incidents` - List of security incidents

### WebSocket Messages

- `metric.kpi.update` - KPI value updated
- `metric.compliance.update` - Compliance data updated
- `metric.geo.upsert` - Geographic point added/updated
- `incident.upsert` - Incident created/updated

## Testing

Run tests with:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test -- --coverage
```

## Building for Production

```bash
# Build the app
pnpm build

# Preview the build
pnpm preview
```

The built files will be in the `dist/` directory, ready to be served by any static file server.

## License

MIT

