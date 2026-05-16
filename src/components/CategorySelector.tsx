import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface CategorySelectorProps {
  value?: string
  onChange: (value: string) => void
  onClose?: () => void
}

export function CategorySelector({
  value,
  onChange,
  onClose,
}: CategorySelectorProps) {
  const { categories } = useCategoryStore()
  const [search, setSearch] = useState('')

  const allSubCategories = useMemo(() => {
    const list: { id: string; name: string }[] = []
    categories.forEach((cat) => {
      cat.subCategories.forEach((sub) => {
        list.push({ id: sub.id, name: sub.name })
      })
    })
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [categories])

  const filtered = useMemo(() => {
    if (!search.trim()) return allSubCategories
    const lower = search.toLowerCase()
    return allSubCategories.filter((item) =>
      item.name.toLowerCase().includes(lower),
    )
  }, [allSubCategories, search])

  return (
    <div className="flex flex-col h-full bg-background rounded-lg shadow-sm border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Choose a category</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/20 border"
            placeholder="Search..."
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 max-h-[60vh]">
        <div className="p-4">
          <RadioGroup
            value={value}
            onValueChange={onChange}
            className="space-y-4"
          >
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-md transition-colors"
              >
                <RadioGroupItem
                  value={item.name}
                  id={item.id}
                  className="h-5 w-5"
                />
                <Label
                  htmlFor={item.id}
                  className="text-base font-normal flex-1 cursor-pointer"
                >
                  {item.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No categories found for "{search}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
