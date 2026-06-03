import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import logoImg from '@/assets/corepm-f1280.png'
import { Menu, PlusCircle, Bell } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function MainHeader() {
  const { t } = useLanguageStore()
  const { user } = useAuthStore()
  const { notifications, getUnreadCount, markAsRead } = useNotificationStore()
  const navigate = useNavigate()

  const unreadCount = user ? getUnreadCount(user.id) : 0
  const userNotifications = user
    ? notifications.filter((n) => n.userId === user.id).slice(0, 5)
    : []

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src={logoImg}
            alt="Opporjob Logo"
            className="h-9 md:h-11 w-auto object-contain transition-transform hover:scale-105"
          />
          <span className="font-bold text-xl tracking-tight text-foreground hidden sm:inline-block">
            Opporjob
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
            <Link
              to="/post-job"
              className="flex items-center gap-2 transition-colors hover:text-primary text-foreground/80 font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              {t('sidebar.post_job')}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-foreground/80" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-2">
                  <div className="mb-2 font-semibold px-2">
                    {t('header.notifications', {
                      defaultValue: 'Notifications',
                    })}
                  </div>
                  {userNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t('header.notifications.empty', {
                        defaultValue: 'No notifications.',
                      })}
                    </div>
                  ) : (
                    userNotifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className="flex flex-col items-start p-3 cursor-pointer rounded-md mb-1"
                        onClick={() => {
                          markAsRead(n.id)
                          if (n.link) navigate(n.link)
                        }}
                      >
                        <div className="font-semibold text-sm flex items-center justify-between w-full">
                          <span>{n.title}</span>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {n.message}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">{t('nav.start')}</Link>
                </Button>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
