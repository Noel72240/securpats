import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp, useHasActiveSubscription } from '@/contexts/AppContext'

import HomePage from '@/pages/public/HomePage'
import HowItWorksPage from '@/pages/public/HowItWorksPage'
import PricingPage from '@/pages/public/PricingPage'
import FAQPage from '@/pages/public/FAQPage'
import ContactPage from '@/pages/public/ContactPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import RescuePage from '@/pages/public/RescuePage'
import DeveloppeurPage from '@/pages/public/DeveloppeurPage'
import { CGUPage, PrivacyPage, RGPDPage, MentionsLegalesPage, CookiesPage } from '@/pages/public/LegalPages'
import PrivacyDataPage from '@/pages/owner/PrivacyDataPage'
import { CookieBanner } from '@/components/legal/CookieBanner'
import { ScrollToTop } from '@/components/ScrollToTop'
import { PawDecorations } from '@/components/decor/PawDecorations'
import { SeoPageView } from '@/pages/public/SeoLandingPage'
import { SEO_PAGES } from '@/lib/seo/content'

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

/** Espace propriétaire réservé aux abonnés actifs (Stripe payé). */
function OwnerSubscribedRoute({ children }: { children: React.ReactNode }) {
  const hasSubscription = useHasActiveSubscription()
  if (!hasSubscription) return <Navigate to="/app/abonnement" replace />
  return <>{children}</>
}

function OwnerRoute({ children, requireSubscription = true }: { children: React.ReactNode; requireSubscription?: boolean }) {
  return (
    <ProtectedRoute roles={['owner']}>
      {requireSubscription ? <OwnerSubscribedRoute>{children}</OwnerSubscribedRoute> : children}
    </ProtectedRoute>
  )
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
      <Route path="/developpeur" element={<DeveloppeurPage />} />

      {/* Pages SEO — hospitalisation & urgence animale */}
      {SEO_PAGES.map(page => (
        <Route key={page.path} path={page.path} element={<SeoPageView path={page.path} />} />
      ))}

      {/* Owner — abonnement actif requis (sauf pages abonnement / RGPD) */}
      <Route path="/app" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
      <Route path="/app/animaux" element={<OwnerRoute><PetsPage /></OwnerRoute>} />
      <Route path="/app/animaux/:id" element={<OwnerRoute><PetDetailPage /></OwnerRoute>} />
      <Route path="/app/referents" element={<OwnerRoute><ReferentsPage /></OwnerRoute>} />
      <Route path="/app/documents" element={<OwnerRoute><DocumentsPage /></OwnerRoute>} />
      <Route path="/app/qr-code" element={<OwnerRoute><QRCodePage /></OwnerRoute>} />
      <Route path="/app/carte-urgence" element={<OwnerRoute><EmergencyCardPage /></OwnerRoute>} />
      <Route path="/app/urgence" element={<OwnerRoute><EmergencyPage /></OwnerRoute>} />
      <Route path="/app/abonnement" element={<OwnerRoute requireSubscription={false}><SubscriptionPage /></OwnerRoute>} />
      <Route path="/app/abonnement/succes" element={<OwnerRoute requireSubscription={false}><SubscriptionSuccessPage /></OwnerRoute>} />
      <Route path="/app/donnees-personnelles" element={<OwnerRoute requireSubscription={false}><PrivacyDataPage /></OwnerRoute>} />

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
        <ScrollToTop />
        <PawDecorations />
        <AppRoutes />
        <CookieBanner />
      </BrowserRouter>
    </AppProvider>
  )
}
