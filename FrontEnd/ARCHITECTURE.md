# FrontEnd Architecture & Component Hierarchy

## Framework & Tooling
- **Library**: React 19 SPA
- **Language**: TypeScript / JavaScript (TSX/JSX)
- **CSS Engine**: Tailwind CSS v4
- **Build Tool**: Vite
- **Icons**: `lucide-react`
- **Charts**: `recharts`
- **Animation**: `motion`

## Folder Mapping
The frontend application code is located in `FrontEnd/src/`:
- `src/components/`:
  - `public/`: Public website components (HeroSection, ServicesSection, FeaturedProperties, PublicHeader, PublicFooter, EnterpriseStatsBar, MethodologySection, LatestInsightsSection, CTASection).
  - `layout/`: Admin/Dashboard shell (Navbar, Sidebar, DashboardLayout, PageHeader).
  - `ui/`: Design system UI elements (Button, Modal, Input, Badge, Card, Avatar, Toast).
  - `common/`: BrandLogo, ThemeToggle, LanguageSelector.
- `src/pages/`:
  - `public/`: Public multi-page views (LandingPageContainer, RealEstatePage, ServicesPage, HealthPage, AgenciesPage, OurStoryPage, ContactPage).
  - `dashboard/`: Internal administration portal (DashboardPage).
  - `properties/`: PropertiesListPage, PropertyFormModal.
  - `services/`: ServicesListPage, ServiceFormModal.
  - `blogs/`: BlogsListPage, BlogFormPage.
  - `agencies/`: AgenciesAdminPage.
  - `users/`: UsersListPage, UserFormModal.
  - `profile/`: ProfilePage.
  - `auth/`: LoginPage, SignUpPage.
- `src/context/`:
  - `AuthContext.tsx`: User session, login, registration, and role management.
  - `LanguageContext.tsx`: Multi-language translations (English, Somali, Turkish, French, Arabic).
  - `ThemeContext.tsx`: Dark mode / Light mode switching.
- `src/services/`:
  - `api.ts`: Fetch client for communicating with the `BackEnd` Express REST API.
