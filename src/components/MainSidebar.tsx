import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronUp,
  User2,
  FolderOpen,
  PlusCircle,
  Search,
  Briefcase,
  Crown,
  Trophy,
  TestTube2,
  Users,
  Wallet,
  Tags,
  Megaphone,
  HardHat,
  Home,
  Wrench,
  LogIn,
  UserPlus,
  Mail,
  Truck,
  ShoppingCart,
  LayoutTemplate,
  PanelBottom,
  Database,
  DollarSign,
  ShieldCheck,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { PublishModal } from '@/components/PublishModal'
import logoImg from '@/assets/corepm-f1280.png'

interface SidebarSection {
  label: string
  className?: string
  items: { title: string; url: string; icon: any }[]
}

export function MainSidebar() {
  const { user, logout } = useAuthStore()
  const { t } = useLanguageStore()
  const location = useLocation()
  const { state, setOpenMobile } = useSidebar()
  const [isPublishOpen, setIsPublishOpen] = useState(false)

  // Automatically close mobile sidebar on any route change
  useEffect(() => {
    setOpenMobile(false)
  }, [location.pathname, location.search, setOpenMobile])

  const isAdmin = user?.role === 'admin' || user?.email.includes('admin')

  // Unified Navigation System supporting dual-role inherently
  let sections: SidebarSection[] = []

  if (!user) {
    sections.push({
      label: t('nav.visitor'),
      items: [
        { title: t('nav.home'), url: '/', icon: Home },
        { title: t('sidebar.services'), url: '/services', icon: Wrench },
        { title: t('sidebar.find_jobs'), url: '/find-jobs', icon: Search },
        { title: t('nav.login'), url: '/login', icon: LogIn },
        { title: t('nav.register'), url: '/register', icon: UserPlus },
      ],
    })
  } else {
    sections.push({
      label: t('sidebar.group.public'),
      items: [
        { title: t('nav.home'), url: '/', icon: Home },
        { title: t('nav.dashboard'), url: '/dashboard', icon: LayoutDashboard },
        { title: t('sidebar.find_jobs'), url: '/find-jobs', icon: Search },
        { title: t('sidebar.my_jobs'), url: '/my-jobs', icon: HardHat },
        { title: t('sidebar.messages'), url: '/messages', icon: Mail },
      ],
    })

    sections.push({
      label: t('nav.construction_mgmt'),
      className: 'text-orange-600 font-semibold',
      items: [
        {
          title: t('nav.my_projects'),
          url: '/construction/dashboard',
          icon: Briefcase,
        },
        {
          title: t('sidebar.equipment'),
          url: '/construction/equipment',
          icon: Truck,
        },
        {
          title: t('sidebar.materials'),
          url: '/construction/materials',
          icon: ShoppingCart,
        },
        {
          title: t('nav.partner_panel'),
          url: '/partner/dashboard',
          icon: Users,
        },
        { title: t('nav.corp_team'), url: '/team', icon: Users },
      ],
    })

    if (isAdmin) {
      sections.push({
        label: t('nav.admin'),
        className: 'text-destructive font-bold',
        items: [
          { title: t('sidebar.users'), url: '/admin/users', icon: Users },
          {
            title: t('nav.plan_mgmt'),
            url: '/admin/plans',
            icon: Crown,
          },
          {
            title: t('nav.const_plans'),
            url: '/admin/construction-plans',
            icon: HardHat,
          },
          { title: t('nav.categories'), url: '/admin/categories', icon: Tags },
          { title: t('nav.ads'), url: '/admin/ads', icon: Megaphone },
          {
            title: t('nav.marketing'),
            url: '/admin/marketing',
            icon: LayoutTemplate,
          },
          {
            title: t('nav.footer'),
            url: '/admin/footer',
            icon: PanelBottom,
          },
          {
            title: t('admin.integrations.page_title'),
            url: '/admin/integrations',
            icon: Database,
          },
          {
            title: 'Controle Financeiro',
            url: '/admin/finance',
            icon: DollarSign,
          },
        ],
      })
    }

    sections.push({
      label: t('nav.finance_utils'),
      items: [
        { title: t('nav.finance_panel'), url: '/finance', icon: Wallet },
        ...(user.role === 'executor' || user.role === 'partner' || isAdmin
          ? [{ title: t('nav.earnings'), url: '/earnings', icon: DollarSign }]
          : []),
        {
          title: t('nav.my_subscription'),
          url: '/my-subscription',
          icon: ShieldCheck,
        },
        { title: t('nav.sub_plans'), url: '/subscription', icon: Crown },
        { title: t('nav.ranking'), url: '/leaderboard', icon: Trophy },
        { title: t('nav.documents'), url: '/documents', icon: FolderOpen },
        { title: t('nav.settings'), url: '/settings', icon: Settings },
      ],
    })

    if (isAdmin) {
      sections.push({
        label: t('nav.test_tools'),
        items: [{ title: t('nav.test_hub'), url: '/testing', icon: TestTube2 }],
      })
    }
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader
          className={cn(
            'h-auto flex flex-col justify-start py-4 border-b border-sidebar-border/50 gap-4 transition-all duration-200',
            state === 'collapsed' ? 'px-2 items-center' : 'px-4',
          )}
        >
          <div
            className={cn(
              'flex items-center font-bold text-xl text-primary transition-all duration-200',
              state === 'collapsed'
                ? 'justify-center w-full'
                : 'gap-2 justify-start w-full overflow-hidden',
            )}
          >
            <div
              className={cn(
                'flex shrink-0 items-center justify-center transition-all duration-200',
                state === 'collapsed' ? 'w-8 h-8' : 'w-10 h-10',
              )}
            >
              <img
                src={logoImg}
                alt="Opporjob Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <span
              className={cn(
                'transition-all duration-200 truncate',
                state === 'collapsed' ? 'opacity-0 w-0 hidden' : 'opacity-100',
              )}
            >
              OPPORJOB
            </span>
          </div>

          {user && state !== 'collapsed' && (
            <Button
              onClick={() => {
                setIsPublishOpen(true)
                setOpenMobile(false)
              }}
              className="w-full justify-start shadow-md"
              size="lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> {t('publish.btn')}
            </Button>
          )}
          {user && state === 'collapsed' && (
            <Button
              onClick={() => {
                setIsPublishOpen(true)
                setOpenMobile(false)
              }}
              className="w-8 h-8 p-0 mx-auto"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          )}
        </SidebarHeader>
        <SidebarContent>
          {sections.map((section, idx) => (
            <SidebarGroup key={idx}>
              <SidebarGroupLabel className={section.className}>
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          location.pathname === item.url ||
                          (item.url !== '/' &&
                            location.pathname.startsWith(`${item.url}/`))
                        }
                        tooltip={item.title}
                      >
                        <Link
                          to={item.url}
                          className="flex-1 overflow-hidden flex items-center gap-2"
                        >
                          <item.icon className="shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        {user && (
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="h-12">
                      <User2 className="shrink-0" />
                      <div className="flex flex-col gap-0.5 text-left text-sm leading-none">
                        <span className="font-semibold truncate">
                          {user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate capitalize">
                          {user.role}{' '}
                          {user.entityType === 'pj' ? '(PJ)' : '(PF)'}
                        </span>
                      </div>
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]"
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        logout()
                        setOpenMobile(false)
                      }}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('sidebar.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        )}
      </Sidebar>

      <PublishModal open={isPublishOpen} onOpenChange={setIsPublishOpen} />
    </>
  )
}
