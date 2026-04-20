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
import ManagePlans from '@/pages/admin/ManagePlans'
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
import { useAuthStore } from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { EvaluationModal } from '@/components/EvaluationModal'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

const AuthSync = () => {
  const { user, loading } = useAuth()
  const { setDomainUser } = useAuthStore()

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
              role: (data?.role as any) || (isAdmin ? 'admin' : 'contractor'),
              entityType: (data?.entity_type as any) || 'pf',
              companyName: data?.company_name || undefined,
              phone: data?.phone || undefined,
              taxId: data?.tax_id || undefined,
              address: {
                country: data?.country || 'BR',
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
    document.title = t('app.title') + ' - Marketplace'
  }, [t])

  return (
    <AuthProvider>
      <BrowserRouter
        future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
      >
        <AuthSync />
        <ScrollToTop />
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <ManageUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/audit"
                  element={
                    <AdminRoute>
                      <AuditLogs />
                    </AdminRoute>
                  }
                />
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
                  path="/admin/plans"
                  element={
                    <AdminRoute>
                      <ManagePlans />
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
