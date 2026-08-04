# 📄 Enterprise Invoice Generator & Ledger Engine
<img height="50" width="50" src="https://img.icons8.com/color/48/000000/java-coffee-cup-logo.png" />  <img height="50" width="50" src="https://img.icons8.com/color/48/000000/html-5.png" />
<img height="50" width="50" src="https://img.icons8.com/color/48/000000/css3.png" />  <img height="50" width="50" src="https://img.icons8.com/color/48/000000/react-native.png"/>  <img height="50" width="50" src="https://img.icons8.com/color/48/000000/bootstrap.png" />
  <img height="50" width="50" src="https://img.icons8.com/color/48/000000/mysql-logo.png"/>  <img height="50" width="50" src="https://img.icons8.com/color/48/000000/javascript.png"/>

An enterprise-grade, full-stack Invoice Processing and Ledger Application engineered with a **Spring Boot RESTful API** backend and a high-performance **React 19 (Vite + Bootstrap 5)** single-page frontend.

The system features **Stateless JWT Authentication**, **BCrypt Password Hashing**, **Role-Based Access Control (RBAC)** separating standard users from system administrators, and a real-time invoice lifecycle ledger system.

---

## 🛠️ Tech Stack & Infrastructure

| Layer | Technology | Version | Badge | Description |
| :--- | :--- | :--- | :---: | :--- |
| **Language** | Java | 25 | <img height="50" width="50" src="https://img.icons8.com/color/48/000000/java-coffee-cup-logo.png" />  | Core execution runtime |
| **Backend Framework** | Spring Boot | 4.1.0 | <img src="https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=flat&logo=springboot&logoColor=white"/> | Enterprise REST API Engine |
| **Security Layer** | Spring Security & JJWT | 6.x / 0.13.0 | <img src="https://img.shields.io/badge/Spring_Security-6.x-6DB33F?style=flat&logo=springsecurity&logoColor=white"/> | Stateless JWT authentication & RBAC filter chains |
| **Database & ORM** | MySQL & Spring Data JPA | 8.0 | <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white"/> | Relational persistent data storage |
| **Frontend Framework** | React | 19.2.8 | <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black"/> | Component-based UI rendering framework |
| **Build System** | Vite | 8.2.0 | <img src="https://img.shields.io/badge/Vite-8.2-646CFF?style=flat&logo=vite&logoColor=white"/> | Hot module replacement frontend bundler |
| **UI Library** | Bootstrap & Icons | 5.3.3 | <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat&logo=bootstrap&logoColor=white"/> | Responsive layout grid & component styling |

> Icon references and design inspirations linked to [Icons8](https://icons8.com/icons/set).

---

## 🌟 Key Features

### 🔐 Security & Identity Management
- **Stateless JWT Authentication**: Secure, token-based authorization via custom JJWT filter chains (`JwtAuthenticationFilter`).
- **BCrypt Hashing**: Raw user passwords are salted and hashed using `BCryptPasswordEncoder` before storage.
- **Role-Based Access Control (RBAC)**: Method-level authorization using `@PreAuthorize` separating `ROLE_USER` and `ROLE_ADMIN`.
- **CORS Integration**: Pre-configured cross-origin resource sharing allowing local Vite frontend integration (`http://localhost:5173`).

### 👤 Standard User Portal (`ROLE_USER`)
- **Self-Registration & Login**: Automated account onboarding and immediate bearer token distribution.
- **Invoice Submission**: Submit validated invoices with fields including Invoice Number, Vendor Name, and Amount.
- **Personal Ledger Dashboard**: Track real-time status of personal invoices (`PENDING`, `APPROVED`, `REJECTED`).

### 🛡️ System Administration Ledger (`ROLE_ADMIN`)
- **Global Enterprise Ledger**: System-wide view across all user-submitted invoices.
- **Status Approval Engine**: Review and transition invoice states (`APPROVED`, `REJECTED`, `PENDING`) with dynamic database persistence.
- **Audit Tracking**: Inspect submission user assignments, timestamps, vendors, and amounts.

---

## 📁 Directory Structure

```text
invoice-generator/
├── invoice_generator/                         # Spring Boot Backend
│   ├── src/main/java/com/dev/arj/invoice_generator/
│   │   ├── Config/                            # Security, JwtUtils, JwtAuthFilter
│   │   ├── controller/                        # AuthController, InvoiceController
│   │   ├── DTO/                               # Request & Response DTOs
│   │   ├── Entity/                            # User, Role, Invoice, Enums
│   │   ├── Exception/                         # GlobalExceptionHandler & Custom Errors
│   │   ├── repository/                        # UserRepository, InvoiceRepository, RoleRepository
│   │   └── service/                           # Auth & Invoice Services + Implementations
│   └── src/main/resources/
│       └── application.properties             # Database & JWT Configs
│
└── invoice-generatorFREND/                    # React Vite Frontend
    ├── src/
    │   ├── api/                               # authApi.js, invoiceApi.js, fetchClient.js
    │   ├── components/                        # Navbar, ProtectedRoute, StatusBadge
    │   ├── context/                           # AuthContext.jsx
    │   ├── pages/                             # Login, Register, UserDashboard, AdminLedger
    │   ├── App.jsx                            # App Routes & Auth Wrapper
    │   └── main.jsx                           # Vite Entry Point
    └── package.json
