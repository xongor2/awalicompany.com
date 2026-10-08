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
import { BlogsListPage } from './pages/blogs/BlogsListPage';
import { UsersListPage } from './pages/users/UsersListPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AgenciesAdminPage } from './pages/agencies/AgenciesAdminPage';
import { RolesPage } from './pages/roles/RolesPage';
import { HealthPage } from './pages/health/HealthPage';
import { ConsultingPage } from './pages/consulting/ConsultingPage';
import { EducationPage } from './pages/education/EducationPage';
import { Property, User } from './types';
import { BrandLogo } from './components/common/BrandLogo';
import { LandingPageContainer } from './pages/public/LandingPageContainer';

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
            setActiveSection('blogs');
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
    setSelectedProperty(null);
    setActiveSection('property-form');
  };

  const handleOpenAddService = () => {
    setActiveSection('services');
    setIsAddServiceModalOpen(true);
  };

  const handleOpenAddUser = () => {
    setActiveSection('users');
    setIsAddUserModalOpen(true);
  };

  const handleViewPropertyFromDashboard = (prop: Property) => {
    setSelectedProperty(prop);
    setActiveSection('properties');
  };

  const handleEditPropertyFromDashboard = (prop: Property) => {
    setSelectedProperty(prop);
    setActiveSection('property-form');
  };

  const handleViewUserFromDashboard = (u: User) => {
    setSelectedUser(u);
    setActiveSection('users');
  };

  const handleEditUserFromDashboard = (u: User) => {
    setSelectedUser(u);
    setIsAddUserModalOpen(true);
    setActiveSection('users');
  };

  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term);
    // If on dashboard, default search jumps to properties
    if (activeSection === 'dashboard' && term.trim()) {
      setActiveSection('properties');
    }
  };

  return (
    <DashboardLayout
      currentSection={activeSection}
      onNavigate={(sec) => {
        setActiveSection(sec);
        setSelectedProperty(null);
        setSelectedUser(null);
      }}
      onOpenAddProperty={handleOpenAddProperty}
      onSearch={handleGlobalSearch}
      onGoToWebsite={() => setViewMode('public')}
    >
      {activeSection === 'dashboard' && (
        <DashboardPage
          onNavigate={(sec) => {
            setActiveSection(sec);
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

      {activeSection === 'consulting' && <ConsultingPage />}

      {activeSection === 'health' && <HealthPage />}

      {activeSection === 'education' && <EducationPage />}

      {activeSection === 'properties' && (
        <PropertiesListPage
          initialSearch={globalSearchTerm}
          onOpenPropertyForm={(property) => {
            setSelectedProperty(property || null);
            setActiveSection('property-form');
          }}
          selectedProperty={selectedProperty}
          onClearSelectedProperty={() => setSelectedProperty(null)}
        />
      )}

      {activeSection === 'property-form' && (
        <PropertyFormPage
          propertyToEdit={selectedProperty}
          onClose={() => {
            setSelectedProperty(null);
            setActiveSection('properties');
          }}
          onSuccess={() => {
            setSelectedProperty(null);
            setActiveSection('properties');
          }}
        />
      )}

      {activeSection === 'countries' && <LocationCategoriesPage kind="Country" />}

      {activeSection === 'cities' && <LocationCategoriesPage kind="City" />}

      {activeSection === 'services' && (
        <ServicesListPage
          initialSearch={globalSearchTerm}
          isAddModalOpen={isAddServiceModalOpen}
          onCloseAddModal={() => setIsAddServiceModalOpen(false)}
        />
      )}

      {activeSection === 'agencies' && <AgenciesAdminPage />}

      {activeSection === 'blogs' && (
        <BlogsListPage
          initialSearch={globalSearchTerm}
        />
      )}

      {activeSection === 'users' && (
        <UsersListPage
          initialSearch={globalSearchTerm}
          isAddModalOpen={isAddUserModalOpen}
          onCloseAddModal={() => setIsAddUserModalOpen(false)}
          selectedUser={selectedUser}
          onClearSelectedUser={() => setSelectedUser(null)}
        />
      )}

      {activeSection === 'roles' && <RolesPage />}

      {activeSection === 'profile' && <ProfilePage />}
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
