<img width="1920" height="1354" alt="image" src="https://github.com/user-attachments/assets/ed782d92-4978-4d19-b5a9-9493a203923f" />

# Luxury Real Estate Platform  
**Full-Stack Take-Home Assignment (2025)**  

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit-brightgreen?style=for-the-badge&logo=vercel)](https://luxury-estate-frontend.vercel.app)  
[![Backend API](https://img.shields.io/badge/Backend_API-Railway-blue?style=for-the-badge&logo=railway)](https://luxury-real-estate-backend.up.railway.app)  
[![Admin Panel](https://img.shields.io/badge/Django_Admin-Open-orange?style=for-the-badge&logo=django)](https://luxury-real-estate-backend.up.railway.app/admin)

---

## Features Implemented (100% Coverage)

| Requirement                            | Status | Implementation |
|----------------------------------------|--------|----------------|
| User Registration & JWT Login          | Done   | Custom User + DRF + SimpleJWT |
| Hierarchical Categories (Tree)         | Done   | **django-mptt** + MPTTModel |
| Property CRUD + Image Upload           | Done   | Admin + DRF + Cloudinary/Media |
| Concurrency-Safe Booking               | Done   | `select_for_update()` + `@atomic` |
| DFS Recommendations                    | Done   | Category tree traversal + Redis cache |
| Payment: Stripe + bKash (Strategy Pattern) | Done   | Full Checkout Session + Sandbox |
| Auto Webhook/Callback Confirmation    | Done   | Booking → Paid on success |
| Redis Caching (List, Detail, Recs)     | Done   | `django-redis` + 15min TTL |
| 3D Property Preview                    | Done   | React Three Fiber + Real GLB Model |
| Glassmorphism UI + Mobile Responsive   | Done   | Next.js 14 + Tailwind + Framer Motion |
| Admin Dashboard + Booking Control      | Done   | Custom Next.js Admin Panel |

---

## Live Links

- **Frontend**: https://luxury-estate-frontend.vercel.app  
- **Backend API**: https://luxury-real-estate-backend.up.railway.app/api/  
- **Django Admin**: https://luxury-real-estate-backend.up.railway.app/admin  
  - Username: `admin`  
  - Password: `admin123`

---

## Tech Stack

**Frontend**  
Next.js 14 (App Router) • React • Tailwind CSS • Framer Motion • React Three Fiber • Lucide Icons • react-hot-toast

**Backend**  
Django 5 • Django REST Framework • PostgreSQL • Redis • django-mptt • django-redis • Strategy Pattern

**Payments**  
- Stripe Checkout Session (Test + Live ready)  
- bKash Sandbox (Full create + execute + callback)

**Deployment**  
- Frontend → Vercel  
- Backend + PostgreSQL + Redis → Railway

---

## Architecture & Diagrams

![Architecture Diagram](https://i.ibb.co/0jK2n9m/architecture.png)  
![ERD](https://i.ibb.co/8XvP7Zk/erd-luxury-real-estate.png)  
![3D Preview](https://i.ibb.co/4pN7dLp/3d-preview.jpg)

---

## Key API Endpoints

| Method | Endpoint                                | Description |
|--------|-----------------------------------------|-----------|
| POST   | `/api/users/`                           | Register |
| POST   | `/api/users/login/`                     | Login (JWT) |
| GET    | `/api/properties/`                      | List (cached) |
| GET    | `/api/properties/{slug}/`               | Detail (cached) |
| GET    | `/api/properties/{slug}/recommendations/` | DFS + Redis |
| POST   | `/api/bookings/`                        | Create (race-condition safe) |
| POST   | `/api/payments/initiate/`               | Redirect to Stripe/bKash |
| PATCH  | `/api/bookings/{id}/update-status/`     | Admin: confirm/cancel |

---

## Payment Testing

**Stripe Test Card**  
`4242 4242 4242 4242` → Any future date → Any CVC  

**bKash Sandbox**  
- Phone: `01733704334`  
- PIN: `11111`  
- OTP: `123456`

---

## Local Setup

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
