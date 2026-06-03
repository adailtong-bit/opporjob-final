import { useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/components/DashboardLayout'
import Index from '@/pages/Index'
import Services from '@/pages/Services'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Dashboard from '@/pages/dashboard/Dashboard'
import PlansList from '@/pages/plans/PlansList'
import PlanDetail from '@/pages/plans/PlanDetail'
import Documents from '@/pages/documents/Documents'
import Reports from '@/pages/reports/Reports'
import Team from '@/pages/team/Team'
import Settings from '@/pages/settings/Settings'
import NotFound from '@/pages/NotFound'
import PostJob from '@/pages/jobs/PostJob'
import FindJobs from '@/pages/jobs/FindJobs'
import MyJobs from '@/pages/jobs/MyJobs'
import JobDetail from '@/pages/jobs/JobDetail'
import Dispute from '@/pages/jobs/Dispute'
import PaymentCheckout from '@/pages/jobs/PaymentCheckout'
import ServiceCheckout from '@/pages/jobs/ServiceCheckout'
import PaymentSuccess from '@/pages/jobs/PaymentSuccess'
import SubscriptionPlans from '@/pages/subscription/SubscriptionPlans'
import CreditsStore from '@/pages/billing/CreditsStore'
import LoyaltyProgram from '@/pages/loyalty/LoyaltyProgram'
import TestingHub from '@/pages/testing/TestingHub'
import FinanceDashboard from '@/pages/finance/FinanceDashboard'
import AccountingExport from '@/pages/finance/AccountingExport'
import ManageCategories from '@/pages/admin/ManageCategories'
import ManageCategoryDetail from '@/pages/admin/ManageCategoryDetail'
import ManageAds from '@/pages/admin/ManageAds'
import ManageMarketing from '@/pages/admin/ManageMarketing'
import ManageFooter from '@/pages/admin/ManageFooter'
import ManageConstructionPlans from '@/pages/admin/ManageConstructionPlans'
import ConstructionDashboard from '@/pages/construction/ConstructionDashboard'
import ProjectDetail from '@/pages/construction/ProjectDetail'
import ProjectList from '@/pages/construction/ProjectList'
import MaterialsMarketplace from '@/pages/construction/MaterialsMarketplace'
import EquipmentManager from '@/pages/construction/EquipmentManager'
import Logistics from '@/pages/construction/Logistics'
import InventoryManager from '@/pages/construction/InventoryManager'
import Leaderboard from '@/pages/gamification/Leaderboard'
import TrainingCenter from '@/pages/training/TrainingCenter'
import NewProject from '@/pages/construction/NewProject'
import PartnerDashboard from '@/pages/partner/PartnerDashboard'
import Resources from '@/pages/construction/Resources'
import TeamInvoicing from '@/pages/construction/TeamInvoicing'
import ConstructionDocuments from '@/pages/construction/ConstructionDocuments'
import ConstructionPlans from '@/pages/construction/ConstructionPlans'
import ConstructionCheckout from '@/pages/construction/ConstructionCheckout'
import FieldEntry from '@/pages/construction/FieldEntry'
import Messages from '@/pages/messages/Messages'
import UserProfile from '@/pages/UserProfile'
import ApprovalDashboard from '@/pages/approvals/ApprovalDashboard'
import ManageUsers from '@/pages/admin/ManageUsers'
import AuditLogs from '@/pages/admin/AuditLogs'
import PushNotifications from '@/pages/admin/PushNotifications'
import ManageIntegrations from '@/pages/admin/ManageIntegrations'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { supabase } from '@/lib/supabase/client'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { EvaluationModal } from '@/components/EvaluationModal'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { usePWA } from '@/hooks/use-pwa'
import logoImg from '@/assets/corepm-f1280.png'
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

const NotificationBadgeSync = () => {
  const { user } = useAuth()
  const { setBadge, clearBadge } = usePWA()
  const notifications = useNotificationStore((state) => state.notifications)

  useEffect(() => {
    if (!user) return
    const unreadCount = notifications.filter(
      (n) => n.userId === user.id && !n.read,
    ).length
    if (unreadCount > 0) {
      setBadge(unreadCount)
    } else {
      clearBadge()
    }
  }, [user, notifications, setBadge, clearBadge])

  return null
}

const CategorySync = () => {
  useEffect(() => {
    useCategoryStore.getState().fetchCategories()
  }, [])
  return null
}

import { useJobStore } from '@/stores/useJobStore'
const JobSync = () => {
  useEffect(() => {
    useJobStore.getState().fetchJobs()
  }, [])
  return null
}

const AuthSync = () => {
  const { user, loading } = useAuth()
  const { setDomainUser } = useAuthStore()
  const { subscribeToPushNotifications } = usePWA()
  const setCurrency = useLanguageStore((state) => state.setCurrency)

  useEffect(() => {
    if (!loading) {
      if (user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            const isAdmin =
              data?.is_admin ||
              user.email === 'adailtong@gmail.com' ||
              user.email?.includes('admin')

            setDomainUser({
              id: user.id,
              name: data?.name || user.user_metadata?.name || 'User',
              email: user.email!,
              role:
                (data?.role as any) ||
                user.user_metadata?.role ||
                (isAdmin ? 'admin' : 'contractor'),
              entityType:
                (data?.entity_type as any) ||
                user.user_metadata?.entityType ||
                'individual',
              companyName: data?.company_name || undefined,
              phone: data?.phone || undefined,
              taxId: data?.tax_id || undefined,
              address: {
                country: data?.country || 'US',
                street: data?.street || '',
                number: data?.number || '',
                complement: data?.complement || '',
                neighborhood: data?.neighborhood || '',
                city: data?.city || '',
                state: data?.state || '',
                zipCode: data?.zip_code || '',
              },
              location:
                data?.city && data?.state
                  ? `${data.city} - ${data.state}`
                  : undefined,
              isPremium: isAdmin,
              subscriptionTier: isAdmin ? 'business' : 'free',
              planName: isAdmin ? 'Enterprise' : 'Basic',
            })

            if (data?.country) {
              setCurrency(data.country === 'BR' ? 'BRL' : 'USD')
            }

            if (window.Notification && Notification.permission === 'granted') {
              subscribeToPushNotifications(user.id)
            }
          })
      } else {
        setDomainUser(null)
      }
    }
  }, [user, loading, setDomainUser])

  return null
}

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth()
  const { user: domainUser } = useAuthStore()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      {domainUser?.pendingEvaluation && <EvaluationModal open={true} />}
      {children}
    </>
  )
}

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  const isAdmin =
    user?.email === 'adailtong@gmail.com' || user?.email?.includes('admin')

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const App = () => {
  const { t } = useLanguageStore()

  useEffect(() => {
    document.title = t('app.title') + ' - Plataforma Completa'

    // Hide Skip badge globally
    const style = document.createElement('style')
    style.id = 'hide-skip-badge'
    style.innerHTML = `
      #skip-badge,
      .skip-badge,
      [data-skip-badge],
      a[href*="goskip.app"],
      a[href*="goskip.dev"],
      a[href*="skip.build"] {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: -9999 !important;
      }
    `
    if (!document.getElementById('hide-skip-badge')) {
      document.head.appendChild(style)
    }

    const getAbsoluteUrl = (path: string) => {
      // Prevent double origin if the bundler already returned a data URI or absolute URL
      if (path.startsWith('http') || path.startsWith('data:')) return path
      return window.location.origin + (path.startsWith('/') ? '' : '/') + path
    }
    const absoluteLogoUrl = getAbsoluteUrl(logoImg)

    // --- PWA Enhancements (Offline, Badging, Splash Screen, Native Icons) ---
    // Remove any Skip-injected favicons
    document
      .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
      .forEach((el) => {
        const href = el.getAttribute('href')
        if (
          href &&
          (href.includes('goskip') ||
            href.includes('skip') ||
            href === '/vite.svg' ||
            href === '/favicon.ico')
        ) {
          el.remove()
        }
      })

    // Register Service Worker for Offline Mode
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker Registered!', reg)
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err)
        })
    }

    // Request Notification permission for Badging / Push later
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const setupIcons = async () => {
      const createIcon = (
        url: string,
        bg: string,
        padding: number = 0,
      ): Promise<string> => {
        return new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = 512
            canvas.height = 512
            const ctx = canvas.getContext('2d')
            if (ctx) {
              if (bg !== 'transparent') {
                ctx.fillStyle = bg
                ctx.fillRect(0, 0, canvas.width, canvas.height)
              } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
              }
              const availWidth = canvas.width - padding * 2
              const availHeight = canvas.height - padding * 2
              const scale = Math.min(
                availWidth / img.width,
                availHeight / img.height,
              )
              const x = canvas.width / 2 - (img.width / 2) * scale
              const y = canvas.height / 2 - (img.height / 2) * scale
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
              resolve(canvas.toDataURL('image/png'))
            } else {
              resolve(url)
            }
          }
          img.onerror = () => resolve(url)
          img.src = url
        })
      }

      try {
        // Create a solid white background icon for Apple Touch and maskable to prevent black squares
        const [solidIcon, transparentIcon] = await Promise.all([
          createIcon(absoluteLogoUrl, '#ffffff', 40),
          createIcon(absoluteLogoUrl, 'transparent', 0),
        ])

        const manifest = {
          name: 'OPPORJOB',
          short_name: 'OPPORJOB',
          description: 'Plataforma completa para projetos e especialistas.',
          start_url: '/?source=pwa',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#2563EB',
          orientation: 'portrait-primary',
          scope: '/',
          icons: [
            {
              src: transparentIcon,
              type: 'image/png',
              sizes: '512x512',
              purpose: 'any',
            },
            {
              src: solidIcon,
              type: 'image/png',
              sizes: '512x512',
              purpose: 'maskable',
            },
          ],
        }
        const stringManifest = JSON.stringify(manifest)
        const manifestBase64 = btoa(
          unescape(encodeURIComponent(stringManifest)),
        )
        const manifestURL = `data:application/manifest+json;base64,${manifestBase64}`

        let link = document.querySelector('link[rel="manifest"]')
        if (!link) {
          link = document.createElement('link')
          link.setAttribute('rel', 'manifest')
          document.head.appendChild(link)
        }
        link.setAttribute('href', manifestURL)

        // Update dynamic Apple Touch Icon
        let appleIcon = document.querySelector('link[rel="apple-touch-icon"]')
        if (!appleIcon) {
          appleIcon = document.createElement('link')
          appleIcon.setAttribute('rel', 'apple-touch-icon')
          document.head.appendChild(appleIcon)
        }
        appleIcon.setAttribute('href', solidIcon)

        // Fallback standard icon
        let stdIcon = document.querySelector('link[rel="icon"]')
        if (!stdIcon) {
          stdIcon = document.createElement('link')
          stdIcon.setAttribute('rel', 'icon')
          stdIcon.setAttribute('type', 'image/png')
          document.head.appendChild(stdIcon)
        }
        stdIcon.setAttribute('href', transparentIcon)

        // Apple Splash Screen (Basic fallback)
        let appleSplash = document.querySelector(
          'link[rel="apple-touch-startup-image"]',
        )
        if (!appleSplash) {
          appleSplash = document.createElement('link')
          appleSplash.setAttribute('rel', 'apple-touch-startup-image')
          document.head.appendChild(appleSplash)
        }
        appleSplash.setAttribute('href', solidIcon)
      } catch (e) {
        console.error('Error setting up icons', e)
      }
    }

    setupIcons()

    // Meta tags for theme, Apple Mobile Web App capability and Splash Screens
    const addOrUpdateMeta = (
      name: string,
      content: string,
      isProperty = false,
    ) => {
      const selector = isProperty
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`
      let meta = document.querySelector(selector)
      if (!meta) {
        meta = document.createElement('meta')
        if (isProperty) meta.setAttribute('property', name)
        else meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    addOrUpdateMeta('theme-color', '#2563EB')
    addOrUpdateMeta('apple-mobile-web-app-capable', 'yes')
    addOrUpdateMeta('apple-mobile-web-app-status-bar-style', 'default')
    addOrUpdateMeta('apple-mobile-web-app-title', 'OPPORJOB')

    // Ensure OG Image has absolute URL for crawlers that support JS execution
    addOrUpdateMeta('og:image', absoluteLogoUrl, true)
    addOrUpdateMeta('og:url', window.location.href, true)
    addOrUpdateMeta('og:title', t('app.title') + ' - Plataforma Completa', true)
    addOrUpdateMeta(
      'og:description',
      'OPPORJOB é a plataforma ideal para conectar especialistas e oportunidades de projetos.',
      true,
    )
    addOrUpdateMeta('twitter:image', absoluteLogoUrl, true)
    addOrUpdateMeta(
      'twitter:title',
      t('app.title') + ' - Plataforma Completa',
      true,
    )
    addOrUpdateMeta(
      'twitter:description',
      'OPPORJOB é a plataforma ideal para conectar especialistas e oportunidades de projetos.',
      true,
    )

    // Clean up dummy data from local storage to ensure production is clean
    try {
      const isProd =
        import.meta.env.PROD || window.location.hostname !== 'localhost'
      if (isProd) {
        const storesToClean = ['job-store', 'ad-store', 'bound-store']
        storesToClean.forEach((storeKey) => {
          const storeStr = localStorage.getItem(storeKey)
          if (storeStr) {
            const store = JSON.parse(storeStr)
            let modified = false

            // Clean jobs
            if (store?.state?.jobs && Array.isArray(store.state.jobs)) {
              const originalLength = store.state.jobs.length
              store.state.jobs = store.state.jobs.filter((j: any) => {
                if (j.is_published !== true) return false
                const title = (j.title || '').toLowerCase()
                const desc = (j.description || '').toLowerCase()
                return !(
                  title.includes('test') ||
                  title.includes('demo') ||
                  title.includes('fictício') ||
                  title.includes('ficticio') ||
                  title.includes('mock') ||
                  title.includes('lorem') ||
                  desc.includes('lorem')
                )
              })
              if (store.state.jobs.length !== originalLength) modified = true
            }

            // Clean ads
            if (store?.state?.ads && Array.isArray(store.state.ads)) {
              const originalLength = store.state.ads.length
              store.state.ads = store.state.ads.filter((a: any) => {
                if (a.is_published !== true) return false
                const title = (a.title || '').toLowerCase()
                return !(
                  title.includes('test') ||
                  title.includes('demo') ||
                  title.includes('fictício') ||
                  title.includes('ficticio') ||
                  title.includes('mock') ||
                  title.includes('lorem')
                )
              })
              if (store.state.ads.length !== originalLength) modified = true
            }

            if (modified) {
              localStorage.setItem(storeKey, JSON.stringify(store))
            }
          }
        })
      }
    } catch (e) {
      console.error('Error cleaning dummy data', e)
    }
  }, [t])

  return (
    <AuthProvider>
      <BrowserRouter
        future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
      >
        <AuthSync />
        <CategorySync />
        <JobSync />
        <NotificationBadgeSync />
        <ScrollToTop />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PushNotificationPrompt />
          <Routes>
            <Route element={<Layout />}>
              {/* Public/App-Like Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/find-jobs" element={<FindJobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />

              {/* Public Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Protected Dashboard Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/partner/dashboard"
                  element={<PartnerDashboard />}
                />
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route path="/my-jobs" element={<MyJobs />} />
                {/* Admin Routes strictly protected */}
                <Route
                  path="/admin/marketing"
                  element={
                    <AdminRoute>
                      <ManageMarketing />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/plans"
                  element={
                    <AdminRoute>
                      <Navigate to="/admin/construction-plans" replace />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/construction-plans"
                  element={
                    <AdminRoute>
                      <ManageConstructionPlans />
                    </AdminRoute>
                  }
                />{' '}
                <Route
                  path="/admin/categories"
                  element={
                    <AdminRoute>
                      <ManageCategories />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/categories/:id"
                  element={
                    <AdminRoute>
                      <ManageCategoryDetail />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/ads"
                  element={
                    <AdminRoute>
                      <ManageAds />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/marketing"
                  element={
                    <AdminRoute>
                      <ManageMarketing />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/footer"
                  element={
                    <AdminRoute>
                      <ManageFooter />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <ManageUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/push"
                  element={
                    <AdminRoute>
                      <PushNotifications />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/integrations"
                  element={
                    <AdminRoute>
                      <ManageIntegrations />
                    </AdminRoute>
                  }
                />
                <Route path="/plans" element={<PlansList />} />
                <Route path="/plans/:id" element={<PlanDetail />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/disputes/new/:id" element={<Dispute />} />
                {/* Approvals Workflow */}
                <Route path="/approvals" element={<ApprovalDashboard />} />
                {/* Construction Management Routes */}
                <Route
                  path="/construction/dashboard"
                  element={<ConstructionDashboard />}
                />
                <Route
                  path="/construction/projects/new"
                  element={<NewProject />}
                />
                <Route
                  path="/construction/projects"
                  element={<ProjectList />}
                />
                <Route
                  path="/construction/projects/:id"
                  element={<ProjectDetail />}
                />
                <Route
                  path="/construction/field-entry"
                  element={<FieldEntry />}
                />
                <Route
                  path="/construction/materials"
                  element={<MaterialsMarketplace />}
                />
                <Route
                  path="/construction/equipment"
                  element={<EquipmentManager />}
                />
                <Route path="/construction/logistics" element={<Logistics />} />
                <Route
                  path="/construction/inventory"
                  element={<InventoryManager />}
                />
                <Route path="/construction/resources" element={<Resources />} />
                <Route
                  path="/construction/invoicing"
                  element={<TeamInvoicing />}
                />
                <Route
                  path="/construction/documents"
                  element={<ConstructionDocuments />}
                />
                <Route
                  path="/construction/plans"
                  element={<ConstructionPlans />}
                />
                <Route
                  path="/construction/checkout/:planId"
                  element={<ConstructionCheckout />}
                />
                {/* Training & Gamification Routes */}
                <Route path="/training" element={<TrainingCenter />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                {/* Payment Routes */}
                <Route
                  path="/payment/checkout/:jobId/:bidId"
                  element={<PaymentCheckout />}
                />
                <Route
                  path="/payment/service/:providerId"
                  element={<ServiceCheckout />}
                />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                {/* Finance Routes */}
                <Route path="/subscription" element={<SubscriptionPlans />} />
                <Route path="/credits" element={<CreditsStore />} />
                <Route path="/loyalty" element={<LoyaltyProgram />} />
                <Route path="/finance" element={<FinanceDashboard />} />
                <Route
                  path="/finance/accounting"
                  element={<AccountingExport />}
                />
                {/* Common Routes */}
                <Route path="/documents" element={<Documents />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/team" element={<Team />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/testing" element={<TestingHub />} />
                <Route path="/messages" element={<Messages />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
