# Koli — Fleet Operations Web App

[![CI](https://github.com/Clizco/garage-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Clizco/garage-frontend/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

Web app used by the field team of **Koli**, a fleet and vehicle-workshop management platform running in production. Staff use it to check vehicles in and out, register visitors, log mileage, plan routes and report workshop work — from a desktop or a phone.

> Backend API: [garage-backend](https://github.com/Clizco/garage-backend) (Node.js + Express + MariaDB)

---

## Features

- **Vehicle check-in / check-out** — entry and exit inspections with mileage, fuel level, lights, accessories and notes.
- **Exit orders** — record which vehicle leaves, with which driver and client, and when it returns.
- **Mileage log** — mileage history per vehicle.
- **Workshop reports** — repairs and parts used.
- **Routes** — trips with travel time per vehicle and user.
- **Visitor log** — people and vehicles entering the premises.
- **Authentication** — JWT sign-in; every change is tied to the user for the audit trail.
- **Dark mode** and a fully responsive layout.

## Tech stack

| Area | Tools |
|---|---|
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite |
| Routing | React Router 7 |
| HTTP | Axios |
| Charts & dates | ApexCharts, FullCalendar, date-fns, Flatpickr |
| UX | Framer Motion, React Hot Toast, React Dropzone |

Built on top of the open-source [TailAdmin](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard) React template.

## Architecture

```
Browser ──HTTPS──▶ Nginx ──┬──▶ this SPA (static build)
                           └──▶ /api/* ──▶ garage-backend (Express) ──▶ MariaDB
```

In production the SPA is served by Nginx, which also proxies `/api/*` to the backend, so the app and the API share the same domain.

## Getting started

```bash
git clone https://github.com/Clizco/garage-frontend.git
cd garage-frontend
npm install
cp .env.example .env   # point VITE_API_URL to your backend
npm run dev
```

| Script | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:3004` |

## Author

**Abraham Gonzalez** — Full Stack Developer · [GitHub](https://github.com/Clizco)
