import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function LanguageSelector() {
  const { currentLanguage, setLanguage, t } = useLanguageStore()

  const getCurrentLabel = () => {
    if (currentLanguage === 'pt') return 'Português'
    if (currentLanguage === 'en') return 'English'
    if (currentLanguage === 'es') return 'Español'
    return 'English'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-block">{getCurrentLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('pt')}>
          <span className={currentLanguage === 'pt' ? 'font-bold' : ''}>
            {t('language.pt')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('en')}>
          <span className={currentLanguage === 'en' ? 'font-bold' : ''}>
            {t('language.en')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('es')}>
          <span className={currentLanguage === 'es' ? 'font-bold' : ''}>
            {t('language.es')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
