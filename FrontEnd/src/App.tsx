import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { NavSection } from './components/layout/Sidebar';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PropertiesListPage } from './pages/properties/PropertiesListPage';
import { LocationCategoriesPage } from './pages/properties/LocationCategoriesPage';
import { PropertyFormPage } from './pages/properties/PropertyFormModal';
import { ServicesListPage } from './pages/services/ServicesListPage';
import { QuotationsPage } from './pages/quotations/QuotationsPage';
import { BlogsListPage } from './pages/blogs/BlogsListPage';
import { UsersListPage } from './pages/users/UsersListPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AgenciesAdminPage } from './pages/agencies/AgenciesAdminPage';
import { PaymentsPage } from './pages/agencies/PaymentsPage';
import { CustomersPage } from './pages/agencies/CustomersPage';
import { CommissionsPage } from './pages/agencies/CommissionsPage';
import { InvoicesPage } from './pages/agencies/InvoicesPage';
import { RolesPage } from './pages/roles/RolesPage';
import { HealthPage } from './pages/health/HealthPage';
import { EducationPage } from './pages/education/EducationPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { QuickPopupPage } from './pages/settings/QuickPopupPage';
import { Property, User } from './types';
import { BrandLogo } from './components/common/BrandLogo';
import { LandingPageContainer } from './pages/public/LandingPageContainer';
import { canAccessSection, firstAccessibleSection } from './utils/pageAccess';

const MainApplication: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<'public' | 'dashboard' | 'auth'>('public');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');

  // Deep linking and quick action navigation states
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const pageAccess = user?.pageAccess ?? [];
  const currentSection = canAccessSection(pageAccess, activeSection)
    ? activeSection
    : firstAccessibleSection(pageAccess);

  const navigateToSection = (section: NavSection): boolean => {
    if (!canAccessSection(pageAccess, section)) return false;
    setActiveSection(section);
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white transition-colors">
        <div className="p-4 bg-[#151A46] rounded-2xl shadow-xl mb-4 animate-pulse">
          <BrandLogo />
        </div>
        <p className="text-xs font-semibold text-[#8A90A2] tracking-wider uppercase">
          Loading AW Ali Company...
        </p>
      </div>
    );
  }

  // Primary Landing Page View
  if (viewMode === 'public') {
    return (
      <LandingPageContainer
        onOpenPortal={() => {
          if (user) {
            setViewMode('dashboard');
          } else {
            setViewMode('auth');
          }
        }}
        onNavigateCMSBlog={() => {
          if (user) {
            navigateToSection('blogs');
            setViewMode('dashboard');
          } else {
            setViewMode('auth');
          }
        }}
      />
    );
  }

  // Auth Mode: Login or Sign Up
  if (viewMode === 'auth') {
    if (user) {
      setViewMode('dashboard');
    } else {
      if (authView === 'signup') {
        return (
          <SignUpPage
            onSwitchToLogin={() => setAuthView('login')}
            onBackToWebsite={() => setViewMode('public')}
          />
        );
      }
      return (
        <LoginPage
          onSwitchToSignUp={() => setAuthView('signup')}
          onBackToWebsite={() => setViewMode('public')}
        />
      );
    }
  }

  // Handlers for cross-page interactions
  const handleOpenAddProperty = () => {
    if (!navigateToSection('property-form')) return;
    setSelectedProperty(null);
  };

  const handleOpenAddService = () => {
    if (!navigateToSection('services')) return;
    setIsAddServiceModalOpen(true);
  };

  const handleOpenAddUser = () => {
    if (!navigateToSection('users')) return;
    setIsAddUserModalOpen(true);
  };

  const handleViewPropertyFromDashboard = (prop: Property) => {
    if (!navigateToSection('properties')) return;
    setSelectedProperty(prop);
  };

  const handleEditPropertyFromDashboard = (prop: Property) => {
    if (!navigateToSection('property-form')) return;
    setSelectedProperty(prop);
  };

  const handleViewUserFromDashboard = (u: User) => {
    if (!navigateToSection('users')) return;
    setSelectedUser(u);
  };

  const handleEditUserFromDashboard = (u: User) => {
    if (!navigateToSection('users')) return;
    setSelectedUser(u);
    setIsAddUserModalOpen(true);
  };

  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term);
    // If on dashboard, default search jumps to properties
    if (currentSection === 'dashboard' && term.trim()) {
      navigateToSection('properties');
    }
  };

  return (
    <DashboardLayout
      currentSection={currentSection}
      onNavigate={(sec) => {
        if (!navigateToSection(sec)) return;
        setSelectedProperty(null);
        setSelectedUser(null);
      }}
      onOpenAddProperty={handleOpenAddProperty}
      onSearch={handleGlobalSearch}
      onGoToWebsite={() => setViewMode('public')}
    >
      {currentSection === 'dashboard' && (
        <DashboardPage
          onNavigate={(sec) => {
            if (!navigateToSection(sec)) return;
            setSelectedProperty(null);
            setSelectedUser(null);
          }}
          onOpenAddProperty={handleOpenAddProperty}
          onOpenAddService={handleOpenAddService}
          onOpenAddUser={handleOpenAddUser}
          onViewProperty={handleViewPropertyFromDashboard}
          onEditProperty={handleEditPropertyFromDashboard}
          onViewUser={handleViewUserFromDashboard}
          onEditUser={handleEditUserFromDashboard}
        />
      )}

      {currentSection === 'health' && <HealthPage />}

      {currentSection === 'education' && <EducationPage />}

      {currentSection === 'properties' && (
        <PropertiesListPage
          initialSearch={globalSearchTerm}
          onOpenPropertyForm={(property) => {
            if (!navigateToSection('property-form')) return;
            setSelectedProperty(property || null);
          }}
          selectedProperty={selectedProperty}
          onClearSelectedProperty={() => setSelectedProperty(null)}
        />
      )}

      {currentSection === 'property-form' && (
        <PropertyFormPage
          propertyToEdit={selectedProperty}
          onClose={() => {
            setSelectedProperty(null);
            navigateToSection('properties');
          }}
          onSuccess={() => {
            setSelectedProperty(null);
            navigateToSection('properties');
          }}
        />
      )}

      {currentSection === 'countries' && <LocationCategoriesPage kind="Country" />}

      {currentSection === 'cities' && <LocationCategoriesPage kind="City" />}

      {currentSection === 'services' && (
        <ServicesListPage
          initialSearch={globalSearchTerm}
          isAddModalOpen={isAddServiceModalOpen}
          onCloseAddModal={() => setIsAddServiceModalOpen(false)}
        />
      )}

      {currentSection === 'quotations' && <QuotationsPage />}

      {currentSection === 'agencies' && <AgenciesAdminPage />}

      {currentSection === 'payments' && <PaymentsPage />}

      {currentSection === 'customers' && <CustomersPage />}

      {currentSection === 'commissions' && <CommissionsPage />}

      {currentSection === 'invoices' && <InvoicesPage />}

      {currentSection === 'settings' && <SettingsPage />}

      {currentSection === 'quick-popup' && <QuickPopupPage />}

      {currentSection === 'blogs' && (
        <BlogsListPage
          initialSearch={globalSearchTerm}
        />
      )}

      {currentSection === 'users' && (
        <UsersListPage
          initialSearch={globalSearchTerm}
          isAddModalOpen={isAddUserModalOpen}
          onCloseAddModal={() => setIsAddUserModalOpen(false)}
          selectedUser={selectedUser}
          onClearSelectedUser={() => setSelectedUser(null)}
        />
      )}

      {currentSection === 'roles' && <RolesPage />}

      {currentSection === 'profile' && <ProfilePage />}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <MainApplication />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
