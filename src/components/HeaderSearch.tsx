import { useState, useRef, useEffect } from 'react'
import { Search, Briefcase, Wrench, Building } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { cn } from '@/lib/utils'

interface HeaderSearchProps {
  className?: string
  inputClassName?: string
  autoFocus?: boolean
}

export function HeaderSearch({
  className,
  inputClassName,
  autoFocus,
}: HeaderSearchProps) {
  const { t } = useLanguageStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoFocus])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const currentQuery = searchParams.get('q') || ''
    setQuery(currentQuery)
  }, [location.search])

  useEffect(() => {
    // Ensure dropdown closes automatically upon any navigation
    setIsOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      inputRef.current?.blur()
      navigate(`/find-jobs?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSelect = (suggestion: string) => {
    setQuery(suggestion)
    setIsOpen(false)
    inputRef.current?.blur()
    navigate(`/find-jobs?q=${encodeURIComponent(suggestion)}`)
  }

  const suggestions = [
    { icon: Wrench, label: 'Encanador', category: 'Serviços' },
    {
      icon: Briefcase,
      label: 'Desenvolvedor React',
      category: 'Oportunidades',
    },
    { icon: Building, label: 'Reforma de Fachada', category: 'Construção' },
  ]

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.label.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase()),
  )

  const displaySuggestions = query.trim() ? filteredSuggestions : suggestions

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSearch} className="relative z-50">
        <button
          type="submit"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('search.placeholder')}
          className={cn(
            'w-full pl-9 transition-shadow focus-visible:ring-2',
            inputClassName,
          )}
          autoComplete="off"
        />
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground border rounded-md shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          <div className="p-2">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
              Sugestões
            </div>
            {displaySuggestions.length > 0 ? (
              displaySuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(item.label)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.category}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-2 py-3 text-sm text-center text-muted-foreground">
                Nenhum resultado encontrado para "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
