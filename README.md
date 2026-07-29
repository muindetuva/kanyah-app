# Kanyah App

Kanyah is an Expo Router application built primarily for the web, with support for iOS and Android from the same codebase.

## Local development

Requirements:

- Node.js 22.13 or newer
- npm

Install and start the app:

```bash
npm install
cp .env.example .env.local
npm run web
```

Set the Laravel backend URL in `.env.local`:

```dotenv
EXPO_PUBLIC_API_ORIGIN=http://localhost:8000
```

## Deployment

The repository is deployed as one Vercel project.

| Branch | Vercel environment | Domain |
| --- | --- | --- |
| `main` | Production | `kanyah.app` and `www.kanyah.app` |
| `dev` | Preview | `dev.kanyah.app` |

### Vercel build settings

Use these settings when importing the repository into Vercel:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Install Command | Leave blank |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Root Directory | Repository root |

Vercel will run `npm install` automatically because the repository contains `package-lock.json`.

### Production setup

1. Open **Vercel → Project → Settings → Environments → Production**.
2. Set the tracked production branch to `main`.
3. Open **Settings → Domains**.
4. Add `kanyah.app` and connect it to Production.
5. Add `www.kanyah.app` and connect it to Production.
6. Configure `www.kanyah.app` to redirect to `kanyah.app`.
7. Add the DNS records displayed by Vercel.

A successful push to `main` deploys the live site.

### Development Preview setup

1. Open **Vercel → Project → Settings → Domains**.
2. Add `dev.kanyah.app`.
3. Connect the domain to the **Preview** environment.
4. Select the `dev` Git branch when Vercel asks which Preview branch to track.
5. Add the DNS record displayed by Vercel.
6. Push or redeploy `dev` after assigning the domain.

A successful push to `dev` updates `dev.kanyah.app` without changing the live site.

### Environment variables

Open **Vercel → Project → Settings → Environment Variables** and configure:

| Variable | Value | Environments |
| --- | --- | --- |
| `EXPO_PUBLIC_API_ORIGIN` | `https://portal.kanyah.app` | Production and Preview |
| `APP_ENV` | `development` | Preview only |

Do not set `APP_ENV` for Production. Production is the default when the variable is absent.

After adding or changing an environment variable, redeploy the affected branch.
