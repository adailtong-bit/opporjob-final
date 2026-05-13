import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { SearchHeader } from '@/components/SearchHeader'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { MainSidebar } from '@/components/MainSidebar'
import { Footer } from '@/components/Footer'

export default function Layout() {
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(
    location.pathname,
  )

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-start font-sans antialiased">
        <Outlet />
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <MainSidebar />
      <SidebarInset className="flex flex-col justify-start min-h-screen bg-background font-sans antialiased transition-all duration-300 ease-in-out relative">
        <SearchHeader />
        <div className="flex-1 pb-20 md:pb-0 relative w-full overflow-x-hidden flex flex-col justify-start min-h-screen">
          <div className="flex-1 flex flex-col">
            <Outlet />
          </div>
          <Footer />
        </div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
