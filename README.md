# Book Explorer - World of Books Scraping Platform

A production-minded product exploration platform that enables users to browse books from World of Books through live, on-demand scraping. Built with NestJS (backend) and Next.js (frontend).

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Step 1: Install PostgreSQL](#step-1-install-postgresql)
  - [Step 2: Install Redis](#step-2-install-redis)
  - [Step 3: Setup Backend](#step-3-setup-backend)
  - [Step 4: Setup Frontend](#step-4-setup-frontend)
- [API Documentation](#api-documentation)
- [Ethical Scraping](#ethical-scraping)
- [License](#license)

## Overview

Book Explorer is a demonstration project showcasing production-quality web scraping combined with modern full-stack development. The platform allows users to navigate through categories and discover books, with all data fetched dynamically from World of Books.

### Key Principles

- **Cache-first reads**: Always attempt to serve from PostgreSQL before triggering scrapes
- **Non-blocking scraping**: All scraping runs through job queues to prevent request timeouts
- **Ethical practices**: Rate limiting, delays, and minimal impact on source site
- **Scalable architecture**: Queue-based processing allows horizontal scaling

## Features

- 🔍 **Browse by Navigation**: Explore high-level book categories
- 📚 **Category Drill-down**: Navigate hierarchical category structure
- 📖 **Product Grid**: View paginated book listings with filters
- 📋 **Product Details**: Full book information including reviews
- 🕐 **View History**: Client-side tracking of browsing history
- ⚡ **Smart Caching**: Configurable cache expiry per entity type
- 🔄 **Job Queue**: BullMQ-powered async scraping jobs

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   React     │  │   React     │  │   View History          │ │
│  │   Query     │  │   Router    │  │   (localStorage)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (NestJS)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   REST API  │  │   Scrape    │  │   Winston Logger        │ │
│  │   Modules   │  │   Module    │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌───────────┐  ┌───────────┐  ┌───────────────┐
        │PostgreSQL │  │   Redis   │  │World of Books │
        │           │  │  (Queue)  │  │   (Source)    │
        └───────────┘  └───────────┘  └───────────────┘
```

## Tech Stack

### Backend
- **NestJS 10** - Progressive Node.js framework
- **TypeORM** - Database ORM with PostgreSQL
- **BullMQ** - Redis-based job queue
- **Crawlee + Playwright** - Web scraping framework
- **Winston** - Logging
- **Swagger** - API documentation

### Frontend
- **Next.js 14** - React framework with App Router
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - See installation below
- **Redis 6+** - See installation below

---

### Step 1: Install PostgreSQL

#### Windows:
1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Set password to `postgres` (or update `.env` file later)
4. Keep default port `5432`
5. Complete installation

#### Create the database:
Open **pgAdmin** or **psql** and run:
```sql
CREATE DATABASE book_explorer;
```

Or via command line:
```bash
psql -U postgres -c "CREATE DATABASE book_explorer;"
```

---

### Step 2: Install Redis

#### Option A: Memurai (Recommended for Windows)
1. Download from [memurai.com/get-memurai](https://www.memurai.com/get-memurai)
2. Install (free Developer edition)
3. It runs automatically as a Windows service on port `6379`

#### Option B: Redis Windows Port
1. Download from [github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
2. Extract and run `redis-server.exe`

#### Option C: WSL (Windows Subsystem for Linux)
```bash
wsl --install
# Then in WSL:
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### Verify Redis is running:
```bash
redis-cli ping
# Should respond: PONG
```

---

### Step 3: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# The .env file is already created with defaults
# Edit if your PostgreSQL password is different

# Start the development server
npm run start:dev
```

The backend will:
- Connect to PostgreSQL
- Auto-create tables (in development mode)
- Connect to Redis for job queue
- Start on http://localhost:3001

**API Documentation**: http://localhost:3001/api

---

### Step 4: Setup Frontend

```bash
# Navigate to frontend folder (new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Configuration Reference

### Backend `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_HOST` | localhost | PostgreSQL host |
| `DATABASE_PORT` | 5432 | PostgreSQL port |
| `DATABASE_USERNAME` | postgres | Database user |
| `DATABASE_PASSWORD` | postgres | Database password |
| `DATABASE_NAME` | book_explorer | Database name |
| `REDIS_HOST` | localhost | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `PORT` | 3001 | Backend server port |
| `NODE_ENV` | development | Environment mode |
| `FRONTEND_URL` | http://localhost:3000 | CORS whitelist |
| `SCRAPE_CACHE_TTL_MINUTES` | 60 | Cache duration |
| `SCRAPE_RATE_LIMIT_DELAY_MS` | 2000 | Delay between scrapes |

### Frontend `.env.local`

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | http://localhost:3001/api | Backend API URL |

---

## API Documentation

When running the backend, Swagger documentation is available at:
- http://localhost:3001/api

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/navigation` | Get navigation items |
| GET | `/api/categories` | Get categories |
| GET | `/api/categories/:id` | Get category by ID |
| GET | `/api/products` | Get products (with filters) |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/scrape/trigger` | Trigger a scrape job |
| GET | `/api/scrape/jobs/:id` | Get job status |
| GET | `/api/health` | Health check |

---

## Ethical Scraping

This project implements ethical web scraping practices:

- ⏱️ **Rate Limiting**: 2-second delays between requests
- 🔄 **Caching**: 60-minute cache to prevent repeat requests
- 📊 **Queue System**: Async processing prevents server overload
- 🔁 **Deduplication**: Duplicate jobs are merged

⚠️ **Disclaimer**: This project is for educational purposes only. All book data belongs to World of Books.

---

## Troubleshooting

### "ECONNREFUSED" to PostgreSQL
- Ensure PostgreSQL service is running
- Check credentials in `.env`
- Verify database `book_explorer` exists

### "ECONNREFUSED" to Redis
- Ensure Redis/Memurai is running
- Check port 6379 is not blocked
- Run `redis-cli ping` to verify

### Playwright errors
- Run `npx playwright install chromium` in backend folder
- Ensure you have sufficient disk space

---

## 🚀 Railway Deployment

### Quick Deploy

1. **Create a Railway Account**: Go to [railway.app](https://railway.app) and sign up

2. **Create New Project**: Click "New Project" → "Empty Project"

3. **Add PostgreSQL**:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway auto-provides `DATABASE_URL`

4. **Add Redis**:
   - Click "+ New" → "Database" → "Redis"
   - Railway auto-provides `REDIS_URL`

5. **Deploy Backend**:
   - Click "+ New" → "GitHub Repo" → Select your repo
   - Set Root Directory: `backend`
   - Add environment variables:
     ```
     NODE_ENV=production
     DATABASE_SSL=true
     FRONTEND_URL=* (update after frontend deploys)
     ```
   - Deploy will start automatically

6. **Deploy Frontend**:
   - Click "+ New" → "GitHub Repo" → Select same repo
   - Set Root Directory: `frontend`
   - Add environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
     ```
   - Deploy will start automatically

7. **Update Backend FRONTEND_URL**:
   - Go to backend service → Variables
   - Update `FRONTEND_URL` to your frontend URL

### Environment Variables Reference

#### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL (auto-provided) | `postgresql://...` |
| `REDIS_URL` | Redis connection URL (auto-provided) | `redis://...` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-provided) | `3001` |
| `DATABASE_SSL` | Enable SSL for DB | `true` |
| `FRONTEND_URL` | Allowed CORS origin | `https://frontend.up.railway.app` |

#### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://backend.up.railway.app/api` |

### Custom Domain (Optional)
1. Go to your service → Settings → Domains
2. Click "Generate Domain" or add custom domain
3. Update environment variables with new URLs

---

## License

MIT License - See [LICENSE](LICENSE) file.

---

Built with ❤️ as a demonstration of modern full-stack development and ethical web scraping.
