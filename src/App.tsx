import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp, useHasActiveSubscription, useHasPetsitterVip } from '@/contexts/AppContext'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { ShopCartProvider } from '@/lib/shop/cart'

import { RootHome } from '@/pages/mobile/RootHome'
import MobileLegalHubPage from '@/pages/mobile/MobileLegalHubPage'
import HowItWorksPage from '@/pages/public/HowItWorksPage'
import PricingPage from '@/pages/public/PricingPage'
import FAQPage from '@/pages/public/FAQPage'
import ContactPage from '@/pages/public/ContactPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/public/ResetPasswordPage'
import RescuePage from '@/pages/public/RescuePage'
import OwnerFamilyRescuePage from '@/pages/public/OwnerFamilyRescuePage'
import EmergencyConfirmPage from '@/pages/public/EmergencyConfirmPage'
import DeveloppeurPage from '@/pages/public/DeveloppeurPage'
import ShopPage from '@/pages/shop/ShopPage'
import ShopProductPage from '@/pages/shop/ShopProductPage'
import ShopCartPage from '@/pages/shop/ShopCartPage'
import ShopSuccessPage from '@/pages/shop/ShopSuccessPage'
import ShopDigitalDownloadPage from '@/pages/shop/ShopDigitalDownloadPage'
import { CGUPage, PrivacyPage, RGPDPage, MentionsLegalesPage, CookiesPage } from '@/pages/public/LegalPages'
import PrivacyDataPage from '@/pages/owner/PrivacyDataPage'
import OwnerProfilePage from '@/pages/owner/OwnerProfilePage'
import DirectivesAnticipeesPage from '@/pages/owner/DirectivesAnticipeesPage'
import OwnerMessagesPage from '@/pages/owner/MessagesPage'
import FindPetsitterPage from '@/pages/owner/FindPetsitterPage'
import { CookieBanner } from '@/components/legal/CookieBanner'
import { ScrollToTop } from '@/components/ScrollToTop'
import { PawDecorations } from '@/components/decor/PawDecorations'
import { MustChangePasswordGate } from '@/components/auth/MustChangePasswordGate'
import { AuthHashHandler } from '@/components/auth/AuthHashHandler'
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
import PetSitterMessagesPage from '@/pages/petsitter/MessagesPage'
import {
  AidantRegisterPage, AidantLoginPage, AidantDashboard, AidantProfilePage, AidantAvailabilityPage,
} from '@/pages/caregiver'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminSiteContentPage from '@/pages/admin/AdminSiteContentPage'
import AdminShopPage from '@/pages/admin/AdminShopPage'
import AdminActuPage from '@/pages/admin/AdminActuPage'
import AdminPartnersPage from '@/pages/admin/AdminPartnersPage'
import AdminMessagesPage from '@/pages/admin/AdminMessagesPage'
import IdentityPendingPage from '@/pages/shared/IdentityPendingPage'
import ActuPage from '@/pages/actu/ActuPage'
import ActuArticlePage from '@/pages/actu/ActuArticlePage'
import PartnersPage from '@/pages/public/PartnersPage'
import {
  AdminUsersPage, AdminPetsPage, AdminReferentsPage, AdminPetSittersPage, AdminCaregiversPage,
  AdminDocumentsPage, AdminMissionsPage, AdminSubscriptionsPage, AdminStatsPage,
} from '@/pages/admin/AdminPages'

function CaregiverProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, caregiverProfile, authLoading } = useApp()
  if (authLoading) return null
  if (!currentUser) return <Navigate to="/aidant/connexion" replace />
  if (currentUser.role !== 'foster_family' && currentUser.role !== 'volunteer') {
    if (currentUser.role === 'owner') return <Navigate to="/app" replace />
    if (currentUser.role === 'petsitter') return <Navigate to="/pet-sitter" replace />
    return <Navigate to="/" replace />
  }
  const hasId = Boolean(caregiverProfile?.idDocument)
  const hasAddress = Boolean(caregiverProfile?.proofOfAddress)
  const verified = Boolean(caregiverProfile?.verified)
  // Profil autorisé pour déposer / consulter les docs
  const onProfil = typeof window !== 'undefined' && window.location.pathname.endsWith('/profil')
  if ((!hasId || !hasAddress || !verified) && !onProfil) {
    return (
      <IdentityPendingPage
        variant={currentUser.role === 'volunteer' ? 'volunteer' : 'foster'}
        hasId={hasId}
        hasAddress={hasAddress}
        profilePath="/aidant/profil"
      />
    )
  }
  return <>{children}</>
}

function OwnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/connexion" replace />
  if (currentUser.role === 'petsitter') return <Navigate to="/pet-sitter" replace />
  if (currentUser.role === 'foster_family' || currentUser.role === 'volunteer') return <Navigate to="/aidant" replace />
  if (currentUser.role !== 'owner') return <Navigate to="/" replace />
  return <>{children}</>
}

function OwnerIdentityRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, authLoading } = useApp()
  if (authLoading) return null
  if (!currentUser || currentUser.role !== 'owner') return <>{children}</>
  const hasId = Boolean(currentUser.idDocument)
  const hasAddress = Boolean(currentUser.proofOfAddress)
  const verified = Boolean(currentUser.identityVerified)
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const allowed = path.startsWith('/app/profil') || path.startsWith('/app/abonnement') || path.startsWith('/app/donnees')
  if ((!hasId || !hasAddress || !verified) && !allowed) {
    return (
      <IdentityPendingPage
        variant="owner"
        hasId={hasId}
        hasAddress={hasAddress}
        profilePath="/app/profil"
      />
    )
  }
  return <>{children}</>
}

function OwnerSubscribedRoute({ children }: { children: React.ReactNode }) {
  const hasSubscription = useHasActiveSubscription()
  if (!hasSubscription) return <Navigate to="/app/abonnement" replace />
  return <>{children}</>
}

function OwnerRoute({ children, requireSubscription = true }: { children: React.ReactNode; requireSubscription?: boolean }) {
  return (
    <OwnerProtectedRoute>
      <OwnerIdentityRoute>
        {requireSubscription ? <OwnerSubscribedRoute>{children}</OwnerSubscribedRoute> : children}
      </OwnerIdentityRoute>
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
  const hasId = Boolean(petSitterProfile.idDocument)
  const hasAddress = Boolean(petSitterProfile.proofOfAddress)
  const verified = Boolean(petSitterProfile.verified)
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const allowed = path.startsWith('/pet-sitter/profil') || path.startsWith('/pet-sitter/inscription') || path.startsWith('/pet-sitter/abonnement')
  if ((!hasId || !hasAddress || !verified) && !allowed) {
    return (
      <IdentityPendingPage
        variant="petsitter"
        hasId={hasId}
        hasAddress={hasAddress}
        profilePath="/pet-sitter/profil"
      />
    )
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
      <Route path="/" element={<RootHome />} />
      <Route path="/fonctionnement" element={<HowItWorksPage />} />
      <Route path="/tarifs" element={<PricingPage />} />
      <Route path="/boutique" element={<ShopPage />} />
      <Route path="/boutique/panier" element={<ShopCartPage />} />
      <Route path="/boutique/succes" element={<ShopSuccessPage />} />
      <Route path="/boutique/telecharger/:token" element={<ShopDigitalDownloadPage />} />
      <Route path="/boutique/:slug" element={<ShopProductPage />} />
      <Route path="/actu" element={<ActuPage />} />
      <Route path="/actu/:slug" element={<ActuArticlePage />} />
      <Route path="/partenaires" element={<PartnersPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
      <Route path="/secours/:token" element={<RescuePage />} />
      <Route path="/famille/:token" element={<OwnerFamilyRescuePage />} />
      <Route path="/urgence/confirmer/:token" element={<EmergencyConfirmPage />} />
      <Route path="/informations-legales" element={<MobileLegalHubPage />} />
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
      <Route path="/app/directives" element={<OwnerRoute><DirectivesAnticipeesPage /></OwnerRoute>} />
      <Route path="/app/messages" element={<OwnerRoute requireSubscription={false}><OwnerMessagesPage /></OwnerRoute>} />
      <Route path="/app/pet-sitters" element={<OwnerRoute><FindPetsitterPage /></OwnerRoute>} />
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
      <Route path="/pet-sitter/messages" element={<PetSitterIdentityRoute requireVip={false}><PetSitterMessagesPage /></PetSitterIdentityRoute>} />
      <Route path="/pet-sitter/profil" element={<PetSitterIdentityRoute><PetSitterProfilePage /></PetSitterIdentityRoute>} />

      {/* Aidant unifié (bénévole / famille d'accueil) */}
      <Route path="/aidant/connexion" element={<AidantLoginPage />} />
      <Route path="/aidant/inscription" element={<AidantRegisterPage />} />
      <Route path="/aidant" element={<CaregiverProtectedRoute><AidantDashboard /></CaregiverProtectedRoute>} />
      <Route path="/aidant/disponibilites" element={<CaregiverProtectedRoute><AidantAvailabilityPage /></CaregiverProtectedRoute>} />
      <Route path="/aidant/profil" element={<CaregiverProtectedRoute><AidantProfilePage /></CaregiverProtectedRoute>} />

      {/* Anciennes URLs → redirection */}
      <Route path="/famille-accueil/inscription" element={<Navigate to="/aidant/inscription" replace />} />
      <Route path="/famille-accueil/connexion" element={<Navigate to="/aidant/connexion" replace />} />
      <Route path="/famille-accueil/*" element={<Navigate to="/aidant" replace />} />
      <Route path="/famille-accueil" element={<Navigate to="/aidant" replace />} />
      <Route path="/benevole/inscription" element={<Navigate to="/aidant/inscription" replace />} />
      <Route path="/benevole/connexion" element={<Navigate to="/aidant/connexion" replace />} />
      <Route path="/benevole/*" element={<Navigate to="/aidant" replace />} />
      <Route path="/benevole" element={<Navigate to="/aidant" replace />} />

      {/* Admin */}
      <Route path="/admin/connexion" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/admin/messages" element={<AdminProtectedRoute><AdminMessagesPage /></AdminProtectedRoute>} />
      <Route path="/admin/contenu-site" element={<AdminProtectedRoute><AdminSiteContentPage /></AdminProtectedRoute>} />
      <Route path="/admin/boutique" element={<AdminProtectedRoute><AdminShopPage /></AdminProtectedRoute>} />
      <Route path="/admin/actu" element={<AdminProtectedRoute><AdminActuPage /></AdminProtectedRoute>} />
      <Route path="/admin/partenaires" element={<AdminProtectedRoute><AdminPartnersPage /></AdminProtectedRoute>} />
      <Route path="/admin/utilisateurs" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />
      <Route path="/admin/animaux" element={<AdminProtectedRoute><AdminPetsPage /></AdminProtectedRoute>} />
      <Route path="/admin/referents" element={<AdminProtectedRoute><AdminReferentsPage /></AdminProtectedRoute>} />
      <Route path="/admin/pet-sitters" element={<AdminProtectedRoute><AdminPetSittersPage /></AdminProtectedRoute>} />
      <Route path="/admin/aidants" element={<AdminProtectedRoute><AdminCaregiversPage /></AdminProtectedRoute>} />
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
    <LanguageProvider>
      <AppProvider>
        <ShopCartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AuthHashHandler />
            <PawDecorations />
            <MustChangePasswordGate>
              <AppRoutes />
            </MustChangePasswordGate>
            <CookieBanner />
          </BrowserRouter>
        </ShopCartProvider>
      </AppProvider>
    </LanguageProvider>
  )
}
