# SmileCraft Dental Clinic — Full-Stack Web Application

> **Client Assignment:** iCoded Automation Pvt. Ltd.  
> **Brand Name:** SmileCraft Dental Clinic  
> **Tagline:** Healthy Smiles, Brighter Lives — Precision Dentistry, Compassionate Care  
> **Tech Stack:** React (Vite) + Node.js (Express) + MongoDB (Atlas / In-Memory Fallback) + Vanilla Design System

---

## 1. Project Overview & Architecture

SmileCraft Dental Clinic is a production-oriented, responsive healthcare web application connecting public patients with clinic specialists and providing an authorized administration portal for dynamic content and appointment workflow management.

```
dental-clinic/
├── backend/
│   ├── config/             # DB connection with MongoDB Atlas & In-Memory fallback
│   ├── controllers/        # Auth, Services, Doctors, Appointments, Inquiries, Settings
│   ├── middleware/         # JWT protection, role verification, file upload, error handler
│   ├── models/             # Mongoose schemas (User, Service, Doctor, Appointment, etc.)
│   ├── routes/             # RESTful route definitions
│   ├── services/           # Concurrency-safe slot calculation & appointment engine
│   ├── utils/              # Pagination, async wrappers, response formatters
│   ├── seeder.js           # Comprehensive demo data seeder
│   ├── server.js           # Express app, Helmet, CORS, Rate-Limiting
│   └── package.json
├── frontend/
│   ├── public/             # SVG logo, favicon, sitemap.xml, robots.txt
│   ├── src/
│   │   ├── components/     # Logo (5 brand variants), Navbar, Footer, UI components
│   │   ├── context/        # AuthContext (JWT session), SettingsContext
│   │   ├── layouts/        # PublicLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/     # Home, About, Services, ServiceDetail, Doctors, Gallery,
│   │   │   │               # Testimonials, Contact, BookAppointment, PrivacyPolicy,
│   │   │   │               # TermsAndConditions, NotFound (404)
│   │   │   └── admin/      # Dashboard, Appointments, Services, Doctors, Gallery,
│   │   │                   # Testimonials, Content (CMS), Inquiries, Settings, Profile
│   │   ├── services/       # Centralized Axios API service with JWT interceptors
│   │   ├── App.jsx         # Complete client-side routing
│   │   └── index.css       # Design system, CSS variables & responsive utilities
│   └── package.json
└── README.md
```

---

## 2. Branding & Color System

Designed according to the official SmileCraft Brand Concept Board:

| Role | Color Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary** | Brand Teal | `#0EA5A0` | Logo, primary buttons, active links, accents |
| **Secondary** | Deep Slate | `#1E293B` | Headings, navbar, footer, admin sidebar |
| **Accent** | Mint Teal | `#7DD3C7` | Subtle highlights, icons, secondary flourishes |
| **Background** | Clean White | `#F8FAFC` | Page backgrounds, form cards, surfaces |
| **Text** | Charcoal | `#0F172A` | High-contrast body typography |

### Brand Logo Variants (in `frontend/src/components/Logo.jsx`)
- **Horizontal Logo:** Brand Teal contoured tooth, swooping smile wrap-around curve, 4-point sparkle, with dark slate & teal text.
- **Vertical / Stacked Logo:** Centered tooth symbol above clinic name and tagline.
- **Monochrome Logo:** Solid dark slate `#1E293B` for black-and-white print and neutral headers.
- **Dark / Reversed Logo:** White tooth outline, mint smile swoop & sparkle, white headings for dark backgrounds.
- **Favicon / App Icon:** Rounded `#0EA5A0` square tile with white tooth and sparkle.

---

## 3. Features Implemented

### Patient-Facing Public Website
- **Home Page:** Hero section, dynamic service cards, specialist doctors, Why Choose Us trust pillars (*Modern Treatment*, *Safe & Sterile*, *Expert Care*, *Long Lasting Results*), approved patient testimonials, and appointment CTA.
- **About Us:** Mission, vision, core clinical values, and team introductions.
- **Services & Treatments:** Dynamic service catalogue with slugs, detail procedure descriptions, and pricing indicators.
- **Doctor Profiles:** Doctor qualifications, specializations, clinical experience, and working schedules.
- **Photo Gallery:** Categorized clinic facility, operatory suites, and equipment photos with lightbox preview.
- **Patient Reviews:** Star-rated patient testimonials with moderation workflow.
- **Contact Us:** Address, phone, interactive Google Maps embed, operating hours, contact form, and direct WhatsApp click-to-chat action.
- **Online Booking System:**
  - Real-time time slot availability calculation based on working hours and doctor schedule.
  - Concurrency-safe backend validation preventing double booking.
  - Required consent checkbox linking to Privacy Policy and Terms.
  - Automatic unique reference code generation (`SC-XXXXX-XXXX`).
- **Utility Pages:**
  - Dedicated **Privacy Policy** (`/privacy-policy`)
  - **Terms & Conditions** (`/terms-and-conditions`)
  - Custom branded **404 Not Found** page (`/404`)

### Dynamic Admin Management Panel
- **Dashboard:** Real-time KPIs for total appointments, pending, confirmed, completed, and cancelled visits.
- **Appointment Management:** Search by patient name or reference code, filter by status, change status (confirm, complete, cancel), and **reschedule appointments** with automatic slot availability validation.
- **Services CRUD:** Add, update, hide, or delete clinic treatments.
- **Doctor Management:** Update physician bio, qualifications, and active state.
- **Gallery Management:** Upload and manage clinic photos.
- **Reviews & Testimonials:** Moderate and publish patient feedback.
- **Patient Inquiries:** Review message submissions and track reply statuses.
- **Clinic Settings:** Manage clinic phone, email, address, slot duration, and booking parameters.
- **Security & Profile:** Admin profile updates, password hashing (bcrypt), and JWT authentication.

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URI or local MongoDB (an automatic in-memory MongoDB fallback is built-in if no external database is available)

### 1. Backend Setup
```bash
cd backend
npm install
```

Configure your `backend/.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smilecraft?retryWrites=true&w=majority
JWT_SECRET=smilecraft_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@smilecraft.demo
ADMIN_PASSWORD=Admin@12345
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174
```

Seed initial demo data (optional):
```bash
node seeder.js
```

Start the backend server:
```bash
npm run dev
```
Backend will be active at: `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be active at: `http://localhost:5173` (or `http://localhost:5174`)

---

## 5. Default Credentials

- **Admin Portal URL:** `http://localhost:5173/admin/login`
- **Username / Email:** `admin@smilecraft.demo`
- **Password:** `Admin@12345`

---

## 6. Testing & Quality Checklist

- [x] All public pages load without broken links or console errors.
- [x] Appointment booking prevents past dates, double bookings, and requires privacy consent.
- [x] Admin login, token issuance, and protected API routes function correctly.
- [x] All CRUD operations (services, doctors, appointments, inquiries) persist in MongoDB.
- [x] Rescheduling an appointment re-checks doctor slot availability and updates status history.
- [x] CORS middleware dynamically accepts local dev ports (`5173`, `5174`, etc.).
- [x] Mobile-first responsiveness verified across desktop and mobile screen sizes.
- [x] SEO deliverables (`robots.txt`, `sitemap.xml`, and schema markup) present.
