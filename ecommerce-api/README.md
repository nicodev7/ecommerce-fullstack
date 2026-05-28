# E-Commerce Backend API

A full-featured async backend API built with FastAPI, PostgreSQL, and Docker.

---

## Quick Start

```bash
# Start all services (PostgreSQL + Redis + API)
docker compose up --build

# API available at: http://localhost:8000
# Swagger docs:     http://localhost:8000/docs
```

Without Docker:
```bash
# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL + Redis manually, then:
uvicorn app.main:app --reload
```

---

## How The App Works

### Architecture Overview

The app follows a **layered architecture** where each layer has one job:

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Request                          │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  ROUTERS (app/api/)                                     │
│  Handles HTTP only: URLs, status codes, auth headers    │
│  Calls services, never does business logic              │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  SERVICES (app/services/)                               │
│  All business logic: validation, calculations, rules    │
│  No knowledge of HTTP or FastAPI                        │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  DATABASE (app/db/)                                     │
│  SQLAlchemy ORM models + async session management       │
│  Translates Python → SQL queries                        │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                    │
└─────────────────────────────────────────────────────────┘
```

**Rules:**
- Routers don't do business logic (just parse HTTP, call services, return JSON)
- Services don't know about HTTP (no Request/Response objects)
- Services are testable without a running server (just instantiate and call methods)

---

## API Endpoints (26 total)

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Create new user account | No |
| POST | `/api/v1/auth/login` | Authenticate, get JWT token | No |

### User Profile
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users/me` | Get your profile | Yes |
| PUT | `/api/v1/users/me` | Update your email | Yes |

### Products (Public)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/products/` | List products (paginated, filterable) | No |
| GET | `/api/v1/products/{id}` | Get product details | No |

### Products (Admin Only)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/products/` | Create new product | Admin |
| PUT | `/api/v1/products/{id}` | Update product | Admin |
| DELETE | `/api/v1/products/{id}` | Soft delete product | Admin |

### Shopping Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/cart/` | Get your cart with items | Yes |
| POST | `/api/v1/cart/items` | Add product to cart | Yes |
| PUT | `/api/v1/cart/items/{id}` | Change item quantity | Yes |
| DELETE | `/api/v1/cart/items/{id}` | Remove item from cart | Yes |
| DELETE | `/api/v1/cart/` | Clear entire cart | Yes |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/orders/` | List your orders | Yes |
| GET | `/api/v1/orders/{id}` | Get order details | Yes |
| POST | `/api/v1/orders/` | Create order from cart | Yes |
| PATCH | `/api/v1/orders/{id}/status` | Update order status | Admin |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/payments/` | Initiate payment for order | Yes |
| GET | `/api/v1/payments/{id}` | Check payment status | Yes |
| POST | `/api/v1/payments/{id}/simulate` | Simulate payment processing | Yes |

### Admin Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/admin/stats` | Sales & user metrics | Admin |
| GET | `/api/v1/admin/users` | List all users | Admin |
| GET | `/api/v1/admin/orders` | List all orders | Admin |

---

## Authentication Flow

```
REGISTER:
  Client → POST /auth/register {email, password}
    → Server hashes password with bcrypt
    → Saves user to database
    → Returns {user_id, message}

LOGIN:
  Client → POST /auth/login {email, password}
    → Server looks up user by email
    → Verifies password hash
    → Creates JWT token (contains user_id, email, expiry)
    → Returns {access_token, token_type: "bearer"}

AUTHENTICATED REQUESTS:
  Client → GET /orders [Authorization: Bearer <token>]
    → Server decodes JWT, extracts user_id
    → Fetches user from database
    → Executes the request for that user
    → Returns data
```

The JWT token is **stateless** — the server doesn't store it. All user info is encoded inside the token itself, signed with a secret key.

---

## Complete Business Flow

```
1. REGISTER → Create an account
2. LOGIN → Get your JWT token
3. User browses products (GET /products)
4. User adds items to cart (POST /cart/items)
5. User reviews cart (GET /cart)
6. User creates order (POST /orders)
   → Cart is snapshotted: product name, price, quantity
   → Cart is cleared after order creation
   → Order status: "pending"
7. User initiates payment (POST /payments)
   → Payment record created with order total
   → Payment status: "pending"
8. User simulates payment (POST /payments/{id}/simulate)
   → Payment → "processing" → (2s delay) → "succeeded"
   → Order auto-updates to "paid"
9. Admin can update order status: shipped → delivered
```

---

## Database Tables (6)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | id (UUID), email, password_hash, role (user/admin) |
| `products` | Product catalog | id (UUID), name, price, stock, is_active (soft delete) |
| `carts` | Shopping carts (1 per user) | id (UUID), user_id (FK) |
| `cart_items` | Items in a cart | id (UUID), cart_id (FK), product_id (FK), quantity |
| `orders` | Customer orders | id (UUID), user_id (FK), items (JSON snapshot), total, status (enum) |
| `payments` | Payment records | id (UUID), order_id (FK), amount, status (enum) |

### Important Design Choices

| Decision | Why |
|----------|-----|
| **UUID keys** | Prevents ID enumeration attacks, globally unique |
| **Order items as JSON** | Snapshot at purchase time — prices/names can change later |
| **Soft delete on products** | Prevents broken references from old orders |
| **Enum for status fields** | Database rejects invalid state transitions |

---

## Project Structure

```
ecommerce-api/
├── app/
│   ├── api/              # 7 router files (HTTP layer)
│   │   ├── auth.py           Register + login
│   │   ├── users.py          Profile
│   │   ├── products.py       Product CRUD + list
│   │   ├── cart.py           Cart operations
│   │   ├── orders.py         Order management
│   │   ├── payments.py       Payment simulation
│   │   └── admin.py          Dashboard stats
│   ├── core/             # Cross-cutting concerns
│   │   ├── config.py         Settings from env vars
│   │   ├── security.py       Password hashing + JWT
│   │   └── deps.py           Auth dependency
│   ├── db/               # Database layer
│   │   ├── base.py           Re-exports Base + models
│   │   ├── session.py        Async engine + DB session
│   │   ├── models.py         6 ORM models
│   │   └── migrations/       Alembic migration files
│   ├── models/           # Pydantic schemas (API contract)
│   │   ├── auth.py           Token schemas
│   │   ├── user.py           User request/response
│   │   ├── product.py        Product request/response
│   │   ├── cart.py           Cart request/response
│   │   ├── order.py          Order request/response
│   │   └── payment.py        Payment request/response
│   ├── services/         # Business logic
│   │   ├── auth_service.py   Registration + login logic
│   │   ├── product_service.py Product CRUD
│   │   ├── cart_service.py   Cart management
│   │   ├── order_service.py  Order creation from cart
│   │   └── payment_service.py Payment simulation
│   └── main.py           # FastAPI app entry point
├── tests/
│   ├── unit/                 Service tests (mocked DB)
│   └── integration/          Placeholder for DB-backed tests
├── docker-compose.yml        PostgreSQL + Redis + API
├── Dockerfile
├── .env.example
└── requirements.txt
```

---

## Key Concepts

### Layered Architecture

Each file has a single responsibility:

```
router (api/)      → "I handle HTTP requests and responses"
service (services/)  → "I contain business rules and logic"
model (db/)          → "I represent database tables"
schema (models/)     → "I validate data at the API boundary"
config (core/)       → "I hold environment settings"
```

### Dependency Injection

FastAPI automatically provides dependencies to route handlers:

```python
@router.get("/cart")
async def get_cart(
    current_user: User = Depends(get_current_user),  # Auth + user lookup
    db: AsyncSession = Depends(get_db),               # DB session
):
    service = CartService(db)
    return await service.get_cart(current_user.id)
```

Each `Depends()` calls a function. The results are passed to your handler — no manual wiring needed.

### Service Pattern

Services are plain classes instantiated per request:

```python
class CartService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_item(self, user_id, product_id, quantity):
        # Business logic here
        ...
```

Creating a new instance per request means no shared state, no threading issues, and easy testing with mocked dependencies.

### Role-Based Access

Two roles are enforced at the router level:

- **User** — can browse products, manage own cart/orders
- **Admin** — can create/update/delete products, view admin dashboard, update order status

```python
if current_user.role != UserRole.admin:
    raise HTTPException(status_code=403, detail="Admin access required")
```

---

## Running Tests

```bash
# Unit tests (mocked DB, no infrastructure needed)
pytest tests/unit/ -v
```

Integration tests require a running PostgreSQL database and are ready to be written in `tests/integration/`.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| FastAPI | Async web framework |
| PostgreSQL | Relational database |
| SQLAlchemy + asyncpg | Async ORM |
| Alembic | Database migrations |
| Python-JOSE | JWT tokens |
| Passlib (bcrypt) | Password hashing |
| Docker | Containerization |
| Pydantic | Data validation |
| pytest | Testing |
