import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp, useHasActiveSubscription, useHasPetsitterVip } from '@/contexts/AppContext'
import { ShopCartProvider } from '@/lib/shop/cart'

import HomePage from '@/pages/public/HomePage'
import HowItWorksPage from '@/pages/public/HowItWorksPage'
import PricingPage from '@/pages/public/PricingPage'
import FAQPage from '@/pages/public/FAQPage'
import ContactPage from '@/pages/public/ContactPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import RescuePage from '@/pages/public/RescuePage'
import OwnerFamilyRescuePage from '@/pages/public/OwnerFamilyRescuePage'
import EmergencyConfirmPage from '@/pages/public/EmergencyConfirmPage'
import DeveloppeurPage from '@/pages/public/DeveloppeurPage'
import ShopPage from '@/pages/shop/ShopPage'
import ShopProductPage from '@/pages/shop/ShopProductPage'
import ShopCartPage from '@/pages/shop/ShopCartPage'
import ShopSuccessPage from '@/pages/shop/ShopSuccessPage'
import { CGUPage, PrivacyPage, RGPDPage, MentionsLegalesPage, CookiesPage } from '@/pages/public/LegalPages'
import PrivacyDataPage from '@/pages/owner/PrivacyDataPage'
import OwnerProfilePage from '@/pages/owner/OwnerProfilePage'
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
import OwnerMissionsPage from '@/pages/owner/OwnerMissionsPage'
import SubscriptionPage from '@/pages/owner/SubscriptionPage'
import SubscriptionSuccessPage from '@/pages/owner/SubscriptionSuccessPage'

import PetSitterDashboard from '@/pages/petsitter/PetSitterDashboard'
import MissionsPage from '@/pages/petsitter/MissionsPage'
import AvailabilityPage from '@/pages/petsitter/AvailabilityPage'
import PetSitterProfilePage from '@/pages/petsitter/PetSitterProfilePage'
import PetSitterRegisterPage from '@/pages/petsitter/PetSitterRegisterPage'
import PetSitterLoginPage from '@/pages/petsitter/PetSitterLoginPage'
import PetSitterSubscriptionPage from '@/pages/petsitter/PetSitterSubscriptionPage'
import PetSitterSubscriptionSuccessPage from '@/pages/petsitter/PetSitterSubscriptionSuccessPage'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminSiteContentPage from '@/pages/admin/AdminSiteContentPage'
import AdminShopPage from '@/pages/admin/AdminShopPage'
import {
  AdminUsersPage, AdminPetsPage, AdminReferentsPage, AdminPetSittersPage,
  AdminDocumentsPage, AdminMissionsPage, AdminSubscriptionsPage, AdminStatsPage,
} from '@/pages/admin/AdminPages'

function OwnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/connexion" replace />
  if (currentUser.role === 'petsitter') return <Navigate to="/pet-sitter" replace />
  if (currentUser.role !== 'owner') return <Navigate to="/" replace />
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
    <OwnerProtectedRoute>
      {requireSubscription ? <OwnerSubscribedRoute>{children}</OwnerSubscribedRoute> : children}
    </OwnerProtectedRoute>
  )
}

function PetSitterIdentityRoute({ children, requireVip = true }: { children: React.ReactNode; requireVip?: boolean }) {
  const { currentUser, petSitterProfile, authLoading } = useApp()
  if (authLoading) return null
  if (!currentUser) return <Navigate to="/pet-sitter/connexion" replace />
  if (currentUser.role !== 'petsitter') {
    if (currentUser.role === 'owner') return <Navigate to="/app" replace />
    return <Navigate to="/" replace />
  }
  if (!petSitterProfile?.idDocument) {
    return <Navigate to="/pet-sitter/inscription" replace />
  }
  if (requireVip) {
    return <PetSitterVipRoute>{children}</PetSitterVipRoute>
  }
  return <>{children}</>
}

function PetSitterVipRoute({ children }: { children: React.ReactNode }) {
  const hasVip = useHasPetsitterVip()
  if (!hasVip) return <Navigate to="/pet-sitter/abonnement" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/fonctionnement" element={<HowItWorksPage />} />
      <Route path="/tarifs" element={<PricingPage />} />
      <Route path="/boutique" element={<ShopPage />} />
      <Route path="/boutique/panier" element={<ShopCartPage />} />
      <Route path="/boutique/succes" element={<ShopSuccessPage />} />
      <Route path="/boutique/:slug" element={<ShopProductPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route path="/secours/:token" element={<RescuePage />} />
      <Route path="/famille/:token" element={<OwnerFamilyRescuePage />} />
      <Route path="/urgence/confirmer/:token" element={<EmergencyConfirmPage />} />
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
      <Route path="/app/missions" element={<OwnerRoute><OwnerMissionsPage /></OwnerRoute>} />
      <Route path="/app/abonnement" element={<OwnerRoute requireSubscription={false}><SubscriptionPage /></OwnerRoute>} />
      <Route path="/app/abonnement/succes" element={<OwnerRoute requireSubscription={false}><SubscriptionSuccessPage /></OwnerRoute>} />
      <Route path="/app/donnees-personnelles" element={<OwnerRoute requireSubscription={false}><PrivacyDataPage /></OwnerRoute>} />
      <Route path="/app/profil" element={<OwnerRoute requireSubscription={false}><OwnerProfilePage /></OwnerRoute>} />

      {/* Pet-Sitter — espace séparé */}
      <Route path="/pet-sitter/connexion" element={<PetSitterLoginPage />} />
      <Route path="/pet-sitter/inscription" element={<PetSitterRegisterPage />} />
      <Route path="/pet-sitter/abonnement" element={<PetSitterIdentityRoute requireVip={false}><PetSitterSubscriptionPage /></PetSitterIdentityRoute>} />
      <Route path="/pet-sitter/abonnement/succes" element={<PetSitterIdentityRoute requireVip={false}><PetSitterSubscriptionSuccessPage /></PetSitterIdentityRoute>} />
      <Route path="/pet-sitter" element={<PetSitterIdentityRoute><PetSitterDashboard /></PetSitterIdentityRoute>} />
      <Route path="/pet-sitter/missions" element={<PetSitterIdentityRoute><MissionsPage /></PetSitterIdentityRoute>} />
      <Route path="/pet-sitter/disponibilites" element={<PetSitterIdentityRoute><AvailabilityPage /></PetSitterIdentityRoute>} />
      <Route path="/pet-sitter/profil" element={<PetSitterIdentityRoute><PetSitterProfilePage /></PetSitterIdentityRoute>} />

      {/* Admin */}
      <Route path="/admin/connexion" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/admin/contenu-site" element={<AdminProtectedRoute><AdminSiteContentPage /></AdminProtectedRoute>} />
      <Route path="/admin/boutique" element={<AdminProtectedRoute><AdminShopPage /></AdminProtectedRoute>} />
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
      <ShopCartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <PawDecorations />
          <AppRoutes />
          <CookieBanner />
        </BrowserRouter>
      </ShopCartProvider>
    </AppProvider>
  )
}
