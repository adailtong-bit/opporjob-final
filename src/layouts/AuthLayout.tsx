import { Outlet, Link } from 'react-router-dom'
import logoImg from '@/assets/corepm-f1280.png'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CheckCircle2, Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export default function AuthLayout() {
  const { t, currentLanguage, setLanguage } = useLanguageStore()
  const [content, setContent] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('marketing_content')
      .select('*')
      .eq('key', 'login_page')
      .single()
      .then(({ data }) => {
        if (data) setContent(data)
      })
  }, [])

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 bg-background/50 backdrop-blur-sm"
            >
              <Globe className="h-4 w-4" />
              {currentLanguage === 'pt'
                ? 'Português'
                : currentLanguage === 'es'
                  ? 'Español'
                  : 'English'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('pt')}>
              Português
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('es')}>
              Español
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col bg-primary text-primary-foreground p-12 justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto w-full">
          <Link
            to="/"
            className="flex items-center gap-3 mb-12 hover:opacity-90 transition-opacity"
          >
            <div className="bg-white p-2 rounded-xl flex items-center justify-center">
              <img
                src={logoImg}
                alt="OPPORJOB Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">
              OPPORJOB
            </span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            {content?.title || t('layout.hero.title')}
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-12">
            {content?.subtitle || t('layout.hero.subtitle')}
          </p>

          <div className="space-y-6">
            {(content?.features || []).map((feature: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-start">
                <CheckCircle2 className="h-6 w-6 text-primary-foreground/60 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-primary-foreground/70 text-sm mt-1">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img
                className="w-10 h-10 rounded-full border-2 border-primary"
                src="https://img.usecurling.com/ppl/thumbnail?seed=1"
                alt="User"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-primary"
                src="https://img.usecurling.com/ppl/thumbnail?seed=2"
                alt="User"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-primary"
                src="https://img.usecurling.com/ppl/thumbnail?seed=3"
                alt="User"
              />
            </div>
            <span className="text-sm font-medium">
              {t('layout.hero.user_count')}
            </span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col p-6 lg:p-12 overflow-y-auto bg-background relative z-10">
        <div className="w-full max-w-[400px] mx-auto my-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
