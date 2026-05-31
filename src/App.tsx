import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from '@/contexts/AppContext'

import HomePage from '@/pages/public/HomePage'
import HowItWorksPage from '@/pages/public/HowItWorksPage'
import PricingPage from '@/pages/public/PricingPage'
import FAQPage from '@/pages/public/FAQPage'
import ContactPage from '@/pages/public/ContactPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import RescuePage from '@/pages/public/RescuePage'
import { CGUPage, PrivacyPage, RGPDPage, MentionsLegalesPage, CookiesPage } from '@/pages/public/LegalPages'
import PrivacyDataPage from '@/pages/owner/PrivacyDataPage'
import { CookieBanner } from '@/components/legal/CookieBanner'

import OwnerDashboard from '@/pages/owner/OwnerDashboard'
import PetsPage from '@/pages/owner/PetsPage'
import PetDetailPage from '@/pages/owner/PetDetailPage'
import ReferentsPage from '@/pages/owner/ReferentsPage'
import DocumentsPage from '@/pages/owner/DocumentsPage'
import QRCodePage from '@/pages/owner/QRCodePage'
import EmergencyCardPage from '@/pages/owner/EmergencyCardPage'
import EmergencyPage from '@/pages/owner/EmergencyPage'
import SubscriptionPage from '@/pages/owner/SubscriptionPage'
import SubscriptionSuccessPage from '@/pages/owner/SubscriptionSuccessPage'

import PetSitterDashboard from '@/pages/petsitter/PetSitterDashboard'
import MissionsPage from '@/pages/petsitter/MissionsPage'
import AvailabilityPage from '@/pages/petsitter/AvailabilityPage'
import PetSitterProfilePage from '@/pages/petsitter/PetSitterProfilePage'
import PetSitterRegisterPage from '@/pages/petsitter/PetSitterRegisterPage'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminSiteContentPage from '@/pages/admin/AdminSiteContentPage'
import {
  AdminUsersPage, AdminPetsPage, AdminReferentsPage, AdminPetSittersPage,
  AdminDocumentsPage, AdminMissionsPage, AdminSubscriptionsPage, AdminStatsPage,
} from '@/pages/admin/AdminPages'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/connexion" replace />
  if (roles && !roles.includes(currentUser.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/admin/connexion" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/fonctionnement" element={<HowItWorksPage />} />
      <Route path="/tarifs" element={<PricingPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route path="/secours/:token" element={<RescuePage />} />
      <Route path="/cgu" element={<CGUPage />} />
      <Route path="/confidentialite" element={<PrivacyPage />} />
      <Route path="/rgpd" element={<RGPDPage />} />
      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="/cookies" element={<CookiesPage />} />

      {/* Owner */}
      <Route path="/app" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/app/animaux" element={<ProtectedRoute roles={['owner']}><PetsPage /></ProtectedRoute>} />
      <Route path="/app/animaux/:id" element={<ProtectedRoute roles={['owner']}><PetDetailPage /></ProtectedRoute>} />
      <Route path="/app/referents" element={<ProtectedRoute roles={['owner']}><ReferentsPage /></ProtectedRoute>} />
      <Route path="/app/documents" element={<ProtectedRoute roles={['owner']}><DocumentsPage /></ProtectedRoute>} />
      <Route path="/app/qr-code" element={<ProtectedRoute roles={['owner']}><QRCodePage /></ProtectedRoute>} />
      <Route path="/app/carte-urgence" element={<ProtectedRoute roles={['owner']}><EmergencyCardPage /></ProtectedRoute>} />
      <Route path="/app/urgence" element={<ProtectedRoute roles={['owner']}><EmergencyPage /></ProtectedRoute>} />
      <Route path="/app/abonnement" element={<ProtectedRoute roles={['owner']}><SubscriptionPage /></ProtectedRoute>} />
      <Route path="/app/abonnement/succes" element={<ProtectedRoute roles={['owner']}><SubscriptionSuccessPage /></ProtectedRoute>} />
      <Route path="/app/donnees-personnelles" element={<ProtectedRoute roles={['owner']}><PrivacyDataPage /></ProtectedRoute>} />

      {/* Pet-Sitter */}
      <Route path="/pet-sitter/inscription" element={<PetSitterRegisterPage />} />
      <Route path="/pet-sitter" element={<ProtectedRoute roles={['petsitter']}><PetSitterDashboard /></ProtectedRoute>} />
      <Route path="/pet-sitter/missions" element={<ProtectedRoute roles={['petsitter']}><MissionsPage /></ProtectedRoute>} />
      <Route path="/pet-sitter/disponibilites" element={<ProtectedRoute roles={['petsitter']}><AvailabilityPage /></ProtectedRoute>} />
      <Route path="/pet-sitter/profil" element={<ProtectedRoute roles={['petsitter']}><PetSitterProfilePage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/connexion" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/admin/contenu-site" element={<AdminProtectedRoute><AdminSiteContentPage /></AdminProtectedRoute>} />
      <Route path="/admin/utilisateurs" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />
      <Route path="/admin/animaux" element={<AdminProtectedRoute><AdminPetsPage /></AdminProtectedRoute>} />
      <Route path="/admin/referents" element={<AdminProtectedRoute><AdminReferentsPage /></AdminProtectedRoute>} />
      <Route path="/admin/pet-sitters" element={<AdminProtectedRoute><AdminPetSittersPage /></AdminProtectedRoute>} />
      <Route path="/admin/documents" element={<AdminProtectedRoute><AdminDocumentsPage /></AdminProtectedRoute>} />
      <Route path="/admin/missions" element={<AdminProtectedRoute><AdminMissionsPage /></AdminProtectedRoute>} />
      <Route path="/admin/abonnements" element={<AdminProtectedRoute><AdminSubscriptionsPage /></AdminProtectedRoute>} />
      <Route path="/admin/statistiques" element={<AdminProtectedRoute><AdminStatsPage /></AdminProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <CookieBanner />
      </BrowserRouter>
    </AppProvider>
  )
}
