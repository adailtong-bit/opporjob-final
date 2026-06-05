import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Search,
  PlusCircle,
  LayoutDashboard,
  MessageSquare,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function BottomNav() {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const { t } = useLanguageStore()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center justify-center w-full h-full space-y-1',
            isActive('/') ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t('nav.home')}</span>
        </Link>

        <Link
          to="/find-jobs"
          className={cn(
            'flex flex-col items-center justify-center w-full h-full space-y-1',
            isActive('/find-jobs') ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-medium max-w-[64px] truncate text-center">
            {t('nav.find_jobs')}
          </span>
        </Link>

        <Link
          to="/post-job"
          className="flex flex-col items-center justify-center w-full h-full space-y-1 -mt-6"
        >
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors">
            <PlusCircle className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-medium">Publicar</span>
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to="/messages"
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive('/messages')
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-[10px] font-medium">Inbox</span>
            </Link>

            <Link
              to="/dashboard"
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive('/dashboard')
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-medium">Painel</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive('/login') ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <LogIn className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('nav.login')}</span>
            </Link>
            <Link
              to="/register"
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive('/register')
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <UserPlus className="h-5 w-5" />
              <span className="text-[10px] font-medium">Criar Conta</span>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
