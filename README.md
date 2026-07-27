# Kanyah App

Standalone Expo Router frontend for Kanyah. The app targets the web first while retaining native iOS and Android support from the same codebase.

## Requirements

- Node.js 22.13 or newer
- The Laravel backend from the sibling `kanyah-backend` project

## Setup

```bash
npm install
cp .env.example .env.local
npm run web
```

The default local API origin is `http://localhost:8000`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_API_ORIGIN` | Yes in deployments | Full Laravel backend origin, for example `https://api.example.com`. Do not include a trailing slash. |
| `APP_ENV` | Development PWA only | Set to `development` to use the development PWA manifest, name, colors, and icons. Omit it for production. |

`EXPO_PUBLIC_API_ORIGIN` is included in the exported frontend, so it must be the public URL that browsers can reach. Do not put secrets in any `EXPO_PUBLIC_` variable.

## Source layout

```text
src/app       Expo Router screens and layouts
src/features  Product and domain-specific code
src/lib       Generic infrastructure and API helpers
```

## Commands

```bash
npm run web              # Run the web development server
npm run android          # Run on Android
npm run ios              # Run on iOS
npm run lint             # Run Expo ESLint checks
npx tsc --noEmit         # Type-check the project
npm run build            # Export the production web build to dist/
```

Production is the default PWA identity. Set `APP_ENV=development` in the
development deployment to use the development manifest and icons.

## Deploying to Vercel

Import this repository into Vercel and use these settings:

| Setting | Value |
| --- | --- |
| Framework preset | Other |
| Install command | Leave blank; Vercel detects `package-lock.json` and uses npm |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | Repository root |

Add `EXPO_PUBLIC_API_ORIGIN` under the Vercel project's environment variables before deploying. Apply it to Production and Preview deployments if both should connect to the backend.

### Production PWA

For the production Vercel project:

- Set `EXPO_PUBLIC_API_ORIGIN` to the deployed Laravel backend origin.
- Do not set `APP_ENV`; production is the default.
- Use `npm run build` and publish `dist`.

### Development PWA

For a separate development Vercel project using the same repository:

- Set `EXPO_PUBLIC_API_ORIGIN` to the backend origin that development should use.
- Set `APP_ENV=development`.
- Use the same `npm run build` command and `dist` output directory.

Vercel rebuilds and deploys automatically whenever a commit is pushed to the connected branch. To verify the production export locally without deploying, run `npm run build`; the generated files appear in the ignored `dist/` directory.
