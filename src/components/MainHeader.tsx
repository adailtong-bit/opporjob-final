import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import logoImg from '@/assets/corepm-f1280.png'
import { Menu, LogOut, PlusCircle } from 'lucide-react'

export function MainHeader() {
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
              Post a Job
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
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
