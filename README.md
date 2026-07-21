# Kanyah App

Standalone Expo Router frontend for Kanyah. The app targets the web first while retaining native iOS and Android support from the same codebase.

## Requirements

- Node.js 22.17 or newer in the Node 22 release line
- pnpm 11.12.0
- The Laravel backend from the sibling `kanyah-backend` project

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm web
```

The default local API origin is `http://localhost:8000`. Set `EXPO_PUBLIC_API_ORIGIN` for deployed environments.

## Source layout

```text
src/app       Expo Router screens and layouts
src/features  Product and domain-specific code
src/lib       Generic infrastructure and API helpers
```

## Commands

```bash
pnpm web                 # Run the web development server
pnpm android             # Run on Android
pnpm ios                 # Run on iOS
pnpm lint                # Run Expo ESLint checks
pnpm exec tsc --noEmit   # Type-check the project
pnpm build:web:prod      # Export the production web build to dist/
```
