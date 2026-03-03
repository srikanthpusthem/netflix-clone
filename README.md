# Netflix Clone

A full-stack Netflix-inspired streaming platform built with a production-grade FastAPI backend and a Next.js 14 frontend.

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.111 |
| Language | Python 3.11 |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 (async) |
| Driver | asyncpg |
| Migrations | Alembic |
| Auth | JWT (python-jose) — access + refresh tokens |
| Passwords | passlib + bcrypt |
| Validation | Pydantic v2 |
| File Storage | Local filesystem (aiofiles) |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios (with interceptors) |
| State | React Context API |

---

## Features

- **Authentication** — Register, login, JWT access + refresh token flow. Tokens are automatically refreshed on 401.
- **Multi-profile** — Up to 5 profiles per account (Netflix-style "Who's watching?"). Supports kids profiles.
- **Content Titles** — Admin-only create/update/delete. All users can browse and search.
- **Watch History** — Upsert watch progress per profile. "Continue Watching" row sorted by last watched.
- **My List** — Add/remove titles per profile. Duplicate adds return a 409 conflict.
- **Search** — Client-side filtering on the browse page (no extra API call).
- **Netflix UI** — Hero banner, horizontally scrollable rows, hover cards with play/add-to-list, toast notifications, progress bars.

---

## Project Structure

```
netflix-clone/
├── app/                        # FastAPI application
│   ├── main.py                 # App factory, CORS, static file mount
│   ├── core/
│   │   ├── config.py           # Settings via pydantic-settings (.env)
│   │   ├── exceptions.py       # AppError hierarchy + exception handlers
│   │   └── security.py         # JWT creation/decoding, password hashing
│   ├── db/
│   │   ├── base.py             # DeclarativeBase + TimestampMixin
│   │   └── session.py          # Async engine + sessionmaker
│   ├── dependencies/
│   │   ├── auth.py             # get_current_user, get_current_admin
│   │   ├── db.py               # get_db() session dependency
│   │   └── pagination.py       # PaginationParams (page, page_size)
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py             # User (email, hashed_password, is_admin)
│   │   ├── profile.py          # Profile (FK→User, is_kids_profile)
│   │   ├── title.py            # Title (name, description, genre, urls)
│   │   ├── watch_history.py    # WatchHistory (profile+title unique, progress)
│   │   └── my_list.py          # MyList (profile+title unique)
│   ├── schemas/                # Pydantic v2 request/response schemas
│   │   ├── common.py           # PaginatedResponse[T] generic
│   │   ├── auth.py             # LoginRequest, TokenResponse
│   │   ├── user.py             # UserResponse
│   │   ├── profile.py          # ProfileCreate, ProfileResponse
│   │   ├── title.py            # TitleCreate, TitleResponse, TitleUpdate
│   │   ├── watch_history.py    # WatchProgressUpdate, ContinueWatchingResponse
│   │   └── my_list.py          # MyListAddRequest, MyListItemResponse
│   ├── services/               # Business logic layer
│   │   ├── auth_service.py     # register_user, login_user, refresh_access_token
│   │   ├── profile_service.py  # CRUD + _get_owned_profile ownership helper
│   │   ├── title_service.py    # CRUD + ilike search + pagination
│   │   ├── watch_history_service.py  # upsert_progress, get_continue_watching
│   │   └── my_list_service.py  # add_to_list, remove_from_list, get_my_list
│   ├── storage/
│   │   └── local.py            # save_file (UUID filename), delete_file
│   └── api/v1/routers/         # Thin HTTP layer — one line delegates to service
│       ├── auth.py             # /auth/register, /login, /refresh, /me
│       ├── users.py            # /users/me
│       ├── profiles.py         # /profiles CRUD
│       ├── titles.py           # /titles CRUD
│       ├── watch_history.py    # /profiles/{id}/watch-history
│       └── my_list.py          # /profiles/{id}/my-list
├── alembic/                    # Database migrations
│   ├── env.py                  # Async Alembic setup
│   └── versions/               # Generated migration files
├── tests/
│   ├── unit/
│   └── integration/
├── frontend/                   # Next.js 14 application
│   └── src/
│       ├── app/                # App Router pages
│       │   ├── page.tsx        # Root redirect (login → profiles → browse)
│       │   ├── login/          # Netflix-style login page
│       │   ├── register/       # Account creation page
│       │   ├── profiles/       # Profile picker ("Who's watching?")
│       │   └── browse/         # Main content page
│       ├── components/
│       │   ├── Navbar.tsx      # Scroll-aware navbar, search toggle, account menu
│       │   └── TitleCard.tsx   # 224px card with hover overlay, progress bar
│       ├── context/
│       │   └── AuthContext.tsx # Auth state, selectProfile, logout
│       └── lib/
│           ├── api.ts          # Axios client, all API calls, 401 auto-refresh
│           ├── auth.ts         # localStorage helpers (tokens, selected profile)
│           └── types.ts        # TypeScript interfaces
├── .env.example                # Environment variable template
├── requirements.txt
└── pyproject.toml
```

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | — | Exchange refresh token for new access token |
| GET | `/auth/me` | User | Current user info |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | User | Current user profile |

### Profiles
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/profiles` | User | Create profile (max 5 per account) |
| GET | `/profiles` | User | List all profiles for current user |
| DELETE | `/profiles/{profile_id}` | User | Delete a profile |

### Titles
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/titles` | Admin | Create a title |
| GET | `/titles` | User | List titles (paginated, optional `search` query param) |
| GET | `/titles/{title_id}` | User | Get single title |
| PATCH | `/titles/{title_id}` | Admin | Update title fields |
| DELETE | `/titles/{title_id}` | Admin | Delete title |

### Watch History
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PUT | `/profiles/{profile_id}/watch-history` | User | Upsert watch progress (seconds) |
| GET | `/profiles/{profile_id}/watch-history/continue-watching` | User | Get continue watching list |

### My List
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/profiles/{profile_id}/my-list` | User | Add title to list |
| GET | `/profiles/{profile_id}/my-list` | User | Get list (paginated) |
| DELETE | `/profiles/{profile_id}/my-list/{title_id}` | User | Remove title from list |

---

## Architecture Notes

### Backend Design Decisions

**`lazy="raise"` on all relationships**
All SQLAlchemy relationships use `lazy="raise"`, which raises an error if a relationship is accessed without being explicitly loaded. This prevents accidental N+1 queries. Any service that needs related data must use `selectinload()`.

**Service layer owns all business logic**
Routers are kept intentionally thin — each route handler is a single line that delegates to a service function. All database queries, ownership checks, and error handling live in `app/services/`.

**Ownership validation pattern**
`_get_owned_profile(profile_id, user_id, db)` is defined in `profile_service.py` and imported by `watch_history_service` and `my_list_service`. It returns the `Profile` ORM object after verifying it exists (404) and belongs to the requesting user (403).

**Paginated responses**
`PaginatedResponse[T]` is a generic Pydantic v2 model with a `.create(items, total, page, page_size)` classmethod. Totals are always computed with a separate `func.count()` scalar query — never Python `len()`.

**JWT token types**
Access and refresh tokens each carry a `"type"` claim (`"access"` / `"refresh"`). `decode_token()` validates the type, preventing a refresh token from being used as an access token and vice versa.

**Timing-safe login**
`verify_password` is always called even when the user email doesn't exist in the database, preventing timing-based user enumeration attacks.

### Frontend Design Decisions

**Axios interceptors**
The request interceptor injects the `Authorization: Bearer <token>` header on every request. The response interceptor catches 401 responses, attempts a token refresh, and retries the original request transparently. If the refresh also fails, the user is redirected to `/login`.

**AuthContext rehydration**
On mount, `AuthContext` calls `GET /auth/me` to validate the stored access token and repopulate the `user` object. The selected profile ID is restored from `localStorage`.

**Deterministic gradients**
Title cards and the hero banner use a gradient generated from a hash of the title name. This gives each title a consistent color without requiring a thumbnail image.

---

## Local Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 16
- Node.js 18+

### Backend

```bash
# 1. Create and activate virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create database
createdb netflix_clone

# 4. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and generate a JWT_SECRET_KEY:
# openssl rand -hex 32

# 5. Run migrations
alembic upgrade head

# 6. Start API server
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# Available at http://localhost:3000
```

### Environment Variables

#### Backend (`.env`)
```env
DATABASE_URL=postgresql+asyncpg://USER@localhost:5432/netflix_clone
JWT_SECRET_KEY=<hex string — run: openssl rand -hex 32>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
STORAGE_BASE_DIR=./media
STORAGE_BASE_URL=http://localhost:8000/media
MAX_PROFILES_PER_USER=5
```

---

## Making a User Admin

Connect to the database and set the flag directly:

```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

Admins can then create, update, and delete titles via the API or the Swagger UI at `/docs`.

---

## Adding Content (Quick Start)

After starting both servers and creating an admin account:

```bash
# 1. Login and capture the token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq -r '.access_token')

# 2. Create a title
curl -X POST http://localhost:8000/api/v1/titles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Stranger Things",
    "description": "A love letter to the 1980s.",
    "release_year": 2016,
    "genre": "Sci-Fi Thriller"
  }'
```

The title will appear immediately on the browse page.
