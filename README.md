# 🏰 Luxury Real Estate Platform

A modern, full-stack luxury real estate platform with advanced features including 3D property previews, real-time bookings, and multi-payment integration (Stripe & bKash).

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema (ERD)](#database-schema-erd)
- [API Documentation](#api-documentation)
- [Payment Integration](#payment-integration)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Features](#features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 📌 Project Overview

**Luxury Real Estate Platform** is a comprehensive solution for managing luxury property listings, user bookings, and payment processing. The platform features:

- 🎨 **Modern UI/UX**: Glassmorphic cards, parallax scrolling, 3D property previews
- 💳 **Multi-Payment Support**: Stripe & bKash integration
- 🔐 **Secure Authentication**: JWT-based token authentication
- 📊 **Advanced Algorithms**: DFS for recommendations, concurrent booking management
- ⚡ **Real-time Caching**: Redis integration for performance optimization

---

## 🛠 Tech Stack

### **Backend**
| Technology | Purpose |
|-----------|---------|
| Django 4.2+ | Web Framework |
| Django REST Framework | API Development |
| PostgreSQL | Primary Database |
| Redis | Caching & Session Management |
| Celery (Optional) | Async Task Processing |
| Stripe API | Credit Card Payments |
| bKash API | Mobile Money Payments |

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| Next.js 14+ | React Framework |
| React 19+ | UI Library |
| Three.js | 3D Property Previews |
| TailwindCSS 4 | Styling |
| Framer Motion | Animations |
| Stripe.js | Payment UI |

### **DevOps & Deployment**
| Technology | Purpose |
|-----------|---------|
| Docker | Containerization |
| GitHub Actions | CI/CD |
| AWS/Railway/Vercel | Cloud Hosting |
| PostgreSQL Cloud | Database Hosting |

---

## 🏗 System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
│  (Next.js + React + Three.js + TailwindCSS)         │
│  - Properties Listing Page                          │
│  - Property Detail with 3D Preview                  │
│  - Booking Management                               │
│  - User Dashboard                                   │
│  - Admin Panel                                      │
└────────────────────┬────────────────────────────────┘
                     │ REST API (HTTPS)
                     │
┌────────────────────▼────────────────────────────────┐
│               API Gateway Layer                      │
│  - JWT Authentication                               │
│  - CORS Management                                  │
│  - Rate Limiting                                    │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           Backend Application Layer                  │
│        (Django REST Framework)                      │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Users     │  │ Properties  │  │  Bookings   │ │
│  │   Module    │  │   Module    │  │   Module    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐                   │
│  │  Payments   │  │   Services  │                   │
│  │   Module    │  │   (DFS, etc)│                   │
│  └─────────────┘  └─────────────┘                   │
└────────┬──────────────────────────────────┬─────────┘
         │                                  │
    ┌────▼────┐                        ┌────▼────┐
    │PostgreSQL│                        │  Redis  │
    │Database  │                        │ Cache   │
    └──────────┘                        └─────────┘
         │
    ┌────▼──────────────────────┐
    │   External Services       │
    │  ┌──────────┐ ┌────────┐  │
    │  │ Stripe   │ │ bKash  │  │
    │  └──────────┘ └────────┘  │
    └──────────────────────────┘
```

### Flow Diagram: Booking & Payment

```
User Selects Property
      ↓
Create Booking (Status: Pending)
      ↓
Choose Payment Provider (Stripe/bKash)
      ↓
Initiate Payment
      ├─→ Stripe: Create Payment Intent
      └─→ bKash: Checkout Create
      ↓
User Completes Payment
      ↓
Webhook Callback
      ├─→ Verify Payment
      └─→ Update Booking Status (Paid)
      ↓
Send Confirmation Email
      ↓
Display Success Page
```

---

## 📊 Database Schema (ERD)

### Entity Relationship Diagram

```
┌──────────────────────────┐
│         Users            │
├──────────────────────────┤
│ id (PK)                  │
│ username (Unique)        │
│ email (Unique)           │
│ password (Hashed)        │
│ phone                    │
│ address                  │
│ is_admin                 │
│ is_staff                 │
│ created_at               │
│ updated_at               │
└──────────┬───────────────┘
           │ 1:N
           │
┌──────────▼────────────────────────────┐
│         Bookings                       │
├────────────────────────────────────────┤
│ id (PK)                                │
│ user_id (FK → Users.id)                │
│ property_id (FK → Properties.id)       │
│ booking_date                           │
│ visit_date                             │
│ total_amount                           │
│ discount                               │
│ subtotal                               │
│ status (pending, confirmed, paid)      │
│ notes                                  │
│ created_at, updated_at                 │
└──────────┬───────────────┬─────────────┘
           │               │
           │               └─────────────────────────┐
           │                                         │
           │ 1:1          ┌──────────────────────────▼──────┐
           │              │      Payments                     │
           └──────────────┤──────────────────────────────────┤
                          │ id (PK)                          │
                          │ booking_id (FK → Bookings.id)    │
                          │ provider (stripe/bkash)          │
                          │ transaction_id (Unique)          │
                          │ amount                           │
                          │ currency                         │
                          │ status                           │
                          │ raw_response (JSON)              │
                          │ error_message                    │
                          │ created_at, updated_at           │
                          └──────────────────────────────────┘

┌──────────────────────────┐
│    Categories            │
├──────────────────────────┤
│ id (PK)                  │
│ name                     │
│ slug (Unique)            │
│ parent_id (FK → Self)    │ ◄─── Hierarchical Tree
│ description              │
│ created_at, updated_at   │
└──────────┬───────────────┘
           │ 1:N
           │
┌──────────▼────────────────────────────┐
│       Properties                       │
├────────────────────────────────────────┤
│ id (PK)                                │
│ name                                   │
│ slug (Unique)                          │
│ description                            │
│ location                               │
│ price                                  │
│ bedrooms                               │
│ bathrooms                              │
│ square_feet                            │
│ amenities (JSON Array)                 │
│ status (active/inactive/sold)          │
│ category_id (FK → Categories.id)       │
│ image (Media URL)                      │
│ featured (Boolean)                     │
│ created_at, updated_at                 │
└────────────────────────────────────────┘
           ▲
           │ 1:N
           │
    ┌──────┴──────────┐
    │   Bookings (1:N)│
    └─────────────────┘
```

### Table Indexes for Performance

```sql
-- Users Table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- Properties Table
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_category_id ON properties(category_id);

-- Bookings Table
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);

-- Payments Table
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Categories Table
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

---

## 🔌 API Documentation

### Base URL
```
http://127.0.0.1:8000/api
```

### Authentication
All endpoints (except public ones) require JWT token in header:
```
Authorization: Bearer <access_token>
```

### Endpoints Overview

#### **Users Module** (`/api/users/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register/` | Register new user | No |
| POST | `/login/` | Login user | No |
| POST | `/token/refresh/` | Refresh JWT token | No |
| GET | `/me/` | Get current user profile | Yes |
| GET | `/{id}/` | Get user by ID | Yes |
| GET | `/{id}/bookings/` | Get user's bookings | Yes |

#### **Properties Module** (`/api/properties/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all properties (paginated) | No |
| POST | `/` | Create property | Yes (Admin) |
| GET | `/{slug}/` | Get property details | No |
| PATCH | `/{slug}/` | Update property | Yes (Admin) |
| DELETE | `/{slug}/` | Delete property | Yes (Admin) |
| GET | `/{slug}/recommendations/` | Get DFS recommendations | No |
| GET | `/categories/` | List all categories | No |

#### **Bookings Module** (`/api/bookings/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List user's bookings | Yes |
| POST | `/` | Create booking | Yes |
| GET | `/{id}/` | Get booking details | Yes |
| PATCH | `/{id}/` | Update booking | Yes (Admin) |
| POST | `/{id}/cancel/` | Cancel booking | Yes |
| PATCH | `/{id}/update-status/` | Update status (Admin) | Yes (Admin) |

#### **Payments Module** (`/api/payments/`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/initiate/` | Initiate payment (Stripe/bKash) | Yes |
| POST | `/webhook/stripe/` | Stripe webhook callback | Webhook |
| POST | `/webhook/bkash/` | bKash webhook callback | Webhook |
| GET | `/success/` | Payment success page | No |
| GET | `/cancel/` | Payment cancel page | No |

### Example API Requests

**Register User**
```bash
POST /api/users/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password123",
  "phone": "+1234567890"
}
```

**Create Booking**
```bash
POST /api/bookings/
Authorization: Bearer <token>
Content-Type: application/json

{
  "property": 1,
  "visit_date": "2025-12-20",
  "discount": 10
}
```

**Initiate Payment**
```bash
POST /api/payments/initiate/
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 1,
  "provider": "stripe"
}
```

### API Documentation Tools

1. **Swagger UI**: `http://127.0.0.1:8000/swagger/`
2. **ReDoc**: `http://127.0.0.1:8000/redoc/`
3. **Postman Collection**: See `/docs/postman_collection.json`

---

## 💳 Payment Integration

### Stripe Integration

**Configuration (.env)**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Flow**
```
1. Frontend requests payment initiation
2. Backend creates PaymentIntent
3. Frontend uses client_secret to complete payment
4. Stripe sends webhook confirmation
5. Backend updates booking status to "paid"
```

**Test Cards**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future date & any CVC

### bKash Integration

**Configuration (.env)**
```env
BKASH_APP_KEY=xxx
BKASH_APP_SECRET=xxx
BKASH_USERNAME=sandboxTokenizedUser02
BKASH_PASSWORD=sandboxTokenizedUser02@12345
BKASH_BASE_URL=https://tokenized.sandbox.bkash.com/v1.2.0-beta
```

**Flow**
```
1. Frontend requests payment initiation
2. Backend creates checkout
3. User redirected to bKash portal
4. User completes payment via mobile
5. bKash callback confirms payment
6. Backend executes & updates booking
```

**Webhook Handlers**
- Located in: `backend/payments/webhooks.py`
- Handles both Stripe and bKash callbacks
- Updates payment status and booking status

### Payment Status Lifecycle

```
Pending → Processing → Completed ✓
              ↓
            Failed ✗
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+ (optional, for caching)
- Git

### Backend Setup

```bash
# 1. Clone repository
git clone https://github.com/Imam2719/luxury-real-estate-platform.git
cd luxury-real-estate-platform/backend

# 2. Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
source venv/bin/activate      # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
cp .env.example .env
# Edit .env with your database credentials

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Load sample data
python manage.py seed_data

# 8. Start server
python manage.py runserver
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd ../frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file
cp .env.example .env.local
# Add NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000

# 4. Start development server
npm run dev
```

### Access the Platform
- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000/api
- **Admin Panel**: http://127.0.0.1:8000/admin
- **Swagger Docs**: http://127.0.0.1:8000/swagger

---

## 📁 Project Structure

```
luxury-real-estate-platform/
│
├── backend/
│   ├── users/                    # User management app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── properties/               # Property management app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py
│   │
│   ├── bookings/                 # Booking management app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── payments/                 # Payment processing app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── payment_service.py    # Strategy Pattern Implementation
│   │   ├── webhooks.py
│   │   └── urls.py
│   │
│   ├── services/                 # Business logic services
│   │   ├── booking_service.py    # Booking calculations
│   │   ├── payment_service.py    # Payment strategies
│   │   ├── property_service.py   # DFS algorithm, availability
│   │   └── user_service.py
│   │
│   ├── core/                     # Core utilities
│   ├── luxury_real_estate/       # Main project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx
│   │   ├── properties/           # Properties listing & detail
│   │   ├── admin/                # Admin dashboard
│   │   ├── dashboard/            # User dashboard
│   │   ├── auth/                 # Login & register
│   │   └── payment/              # Payment page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.jsx
│   │   ├── property/
│   │   │   ├── PropertyFilter.jsx
│   │   │   ├── PropertyCard.jsx
│   │   │   └── ThreeDPreview.jsx
│   │   └── common/
│   │
│   ├── public/                   # Static assets
│   ├── styles/
│   ├── package.json
│   ├── next.config.ts
│   └── tailwind.config.ts
│
├── docs/
│   ├── API_Documentation.md
│   ├── System_Architecture.pdf
│   ├── ERD.png
│   ├── Payment_Flow.png
│   └── postman_collection.json
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## ✨ Features

### ✅ Implemented Features

#### User Management
- ✅ User registration & login
- ✅ JWT authentication
- ✅ User profile management
- ✅ Booking history
- ✅ Payment history
- ✅ Admin flag for property creation

#### Property Management
- ✅ CRUD operations (Admin only)
- ✅ Hierarchical categories with DFS traversal
- ✅ Property search & filtering
- ✅ Featured properties
- ✅ Pagination (12 items per page)
- ✅ Image upload support
- ✅ Amenities management

#### Booking System
- ✅ Create bookings with availability check
- ✅ Booking status management (pending, confirmed, paid, canceled)
- ✅ Discount support
- ✅ Booking calculations (subtotal, total)
- ✅ Concurrent booking management with database locking
- ✅ Visit date scheduling

#### Payment Integration
- ✅ Stripe payment support
- ✅ bKash payment support
- ✅ Webhook handlers for both providers
- ✅ Payment status tracking
- ✅ Transaction ID management
- ✅ Error handling & retry logic

#### Frontend UI/UX
- ✅ Glassmorphic card design
- ✅ 3D property previews (Three.js)
- ✅ Parallax scrolling animations
- ✅ Responsive design
- ✅ Dark theme with purple/pink gradient
- ✅ Real-time toast notifications

#### Advanced Features
- ✅ DFS algorithm for property recommendations
- ✅ Redis caching for performance
- ✅ Database indexing for fast queries
- ✅ Strategy pattern for payment providers
- ✅ Comprehensive error handling
- ✅ API rate limiting
- ✅ CORS management

### 🚧 Future Enhancements

- [ ] Favorites/Wishlist system
- [ ] Property reviews & ratings
- [ ] Agent management
- [ ] Virtual tour hosting
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Mobile app (React Native)
- [ ] GraphQL API
- [ ] Advanced analytics
- [ ] AI-powered property recommendations

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test users
python manage.py test properties
python manage.py test bookings
python manage.py test payments

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Test Files Location
```
backend/
├── users/tests.py
├── properties/tests.py
├── bookings/tests.py
└── payments/tests.py
```

### Example Test Case

```python
# Test booking calculation
def test_calculate_totals_with_discount():
    result = BookingService.calculate_totals(100000, discount=10)
    assert result['total'] == 90000
    assert result['discount_amount'] == 10000

# Test availability checking
def test_property_availability():
    is_available = PropertyService.check_availability(
        property_id=1,
        booking_date='2025-12-20'
    )
    assert is_available == True
```

### API Testing with cURL

```bash
# Register user
curl -X POST http://127.0.0.1:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "test123"
  }'

# Login
curl -X POST http://127.0.0.1:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "password": "test123"
  }'

# Create booking
curl -X POST http://127.0.0.1:8000/api/bookings/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "property": 1,
    "visit_date": "2025-12-20"
  }'
```



### Frontend Deployment (Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel via GitHub
# Visit https://vercel.com/new

# 3. Set environment variables
NEXT_PUBLIC_API_BASE=https://your-backend-api.com

# 4. Deploy automatically on push
```

### Database Backup

```bash
# PostgreSQL backup
pg_dump -U postgres -h localhost luxury_estate_db > backup.sql

# Restore
psql -U postgres -h localhost luxury_estate_db < backup.sql
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Follow PEP 8 for Python
- Follow Airbnb JavaScript style guide
- Write meaningful commit messages
- Add tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Imam** - Full Stack Developer
  - GitHub: [@Imam2719](https://github.com/Imam2719)


## 🙏 Acknowledgments

- Django & DRF community
- Next.js & React team
- Stripe & bKash for payment APIs
- Three.js for 3D visualization
- TailwindCSS for styling

---

## 📝 Changelog

### v1.0.0 (2025-01-30)
- ✅ Initial release
- ✅ User authentication system
- ✅ Property management
- ✅ Booking system
- ✅ Payment integration (Stripe & bKash)
- ✅ Admin dashboard
- ✅ User dashboard
- ✅ 3D property previews

---

**Last Updated**: 30 January 2025  
<img width="1920" height="1354" alt="image" src="https://github.com/user-attachments/assets/cb7c6fd2-b542-4738-a363-c8dfe5c7207c" />
