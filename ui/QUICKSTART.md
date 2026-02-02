# Quick Start Guide

Get the SIEM dashboard running in 2 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm (recommended) or npm

## Install pnpm (if needed)

```bash
npm install -g pnpm
```

## Step 1: Install Dependencies

```bash
cd ui
pnpm install
```

This will install all required packages including React, TypeScript, Tailwind, Recharts, MapLibre GL, and more.

## Step 2: Run the Development Server

```bash
pnpm dev
```

The app will start on **http://localhost:3000** with mock data enabled by default.

You should see:
- 4 KPI cards showing device statistics
- A compliance donut chart
- Security training progress bar
- Interactive world map with device distribution
- Time series charts
- Device connections pie chart

## Step 3: Explore the Dashboard

### Navigation

- **Dashboard** - Main view at `/device-security`
- **Incidents** - Incidents table at `/incidents`

### Interactive Features

- **Time Picker** (top right) - Change time range (15m, 1h, 4h, 24h, 7d, 30d)
- **Filters** (top right) - Filter by host group, country, device type, compliance
- **Live Updates** (top right) - Toggle real-time updates
- **Map Markers** - Click on location markers to see detailed breakdown
- **Charts** - Hover over data points for tooltips
- **KPI Cards** - Animated sparklines show trends

### Keyboard Navigation

- Press `Tab` to navigate between interactive elements
- Press `Enter` or `Space` to activate buttons
- Press `Escape` to close modals/drawers

## Connect to Real Backend

Once you have the C++ SIEM backend running:

1. Make sure backend is running on:
   - REST API: `http://localhost:8080`
   - WebSocket: `ws://localhost:8081`

2. Disable mock mode:

```bash
# In ui/ directory
echo "VITE_MOCK=false" > .env
pnpm dev
```

The dashboard will now fetch real data from your backend!

## Build for Production

```bash
pnpm build
```

Built files will be in `dist/` directory. Serve with any static file server:

```bash
pnpm preview
```

## Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage
```

## Troubleshooting

### Port 3000 already in use

```bash
# Use a different port
pnpm dev -- --port 3001
```

### Dependencies not installing

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript errors

```bash
# Check types without building
pnpm exec tsc --noEmit
```

## Project Structure

```
ui/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Main pages
│   ├── store/          # State management
│   ├── lib/            # Utilities
│   ├── mocks/          # Mock server
│   └── test/           # Test setup
├── index.html          # HTML entry
├── package.json        # Dependencies
└── vite.config.ts      # Build config
```

## Next Steps

- **Customize**: Edit components in `src/components/`
- **Add Features**: Create new pages in `src/pages/`
- **Style**: Update theme in `tailwind.config.js` and `src/app.css`
- **Test**: Add tests in `src/components/__tests__/`
- **Deploy**: Build and deploy `dist/` to your hosting provider

## Need Help?

- Check `README.md` for detailed documentation
- Review component tests in `src/components/__tests__/`
- Inspect mock data in `src/mocks/data.ts`

Enjoy your SIEM dashboard!
