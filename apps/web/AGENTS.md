# BuildPulse Web (apps/web)

## Overview

- Framework: React 19 + Vite + TypeScript (ESM)
- Styling: Tailwind CSS v4 via @tailwindcss/vite in vite.config.ts
- Entry: src/main.tsx mounts App into #root and imports src/index.css
- API access defaults to same-origin `/api` in the browser; Vite proxies `/api`, `/socket.io`, and `/uploads` to the backend in dev

## Commands

- npm run dev: start Vite dev server (default port 5173)
- npm run build: type-check and build
- npm run preview: preview production build
- npm run lint: run ESLint


## Maintaining this file

Add only stable, reusable frontend details (architecture, conventions, commands).
Avoid temporary notes, guesses, or secrets.
