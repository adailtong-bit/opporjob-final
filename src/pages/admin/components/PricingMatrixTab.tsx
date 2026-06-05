import { useEffect, useState } from 'react'
import { usePricingMatrixStore } from '@/stores/usePricingMatrixStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'

export function PricingMatrixTab() {
  const { rules, fetchRules, updateRules, isLoading } = usePricingMatrixStore()
  const { categories, fetchCategories } = useCategoryStore()
  const [localRules, setLocalRules] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRules()
    fetchCategories()
  }, [fetchRules, fetchCategories])

  useEffect(() => {
    if (rules && categories) {
      const dynamicCats: Record<string, number> = {}
      categories.forEach((c) => {
        dynamicCats[c.name] = rules.categories?.[c.name] ?? 1.0
      })

      setLocalRules({
        tiers: rules.tiers || {},
        regions: rules.regions || {},
        categories: dynamicCats,
      })
    }
  }, [rules, categories])

  if (isLoading || !localRules) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateRules(localRules)
      toast({
        title: 'Success',
        description: 'Pricing matrix updated successfully.',
      })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleTierChange = (key: string, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setLocalRules({
        ...localRules,
        tiers: { ...localRules.tiers, [key]: num },
      })
    }
  }

  const handleCategoryChange = (key: string, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setLocalRules({
        ...localRules,
        categories: { ...localRules.categories, [key]: num },
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Pricing Matrix Configurations</h3>
          <p className="text-sm text-muted-foreground">
            Adjust base prices for tiers and multipliers for categories.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Matrix
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-semibold border-b pb-2">
            Base Prices (per Tier) in USD
          </h4>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier Name</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Base Price
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(localRules.tiers).map((tier) => (
                  <TableRow key={tier}>
                    <TableCell className="font-medium">{tier}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="text-right h-8"
                        value={localRules.tiers[tier]}
                        onChange={(e) => handleTierChange(tier, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold border-b pb-2">Category Multipliers</h4>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Multiplier
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(localRules.categories).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.keys(localRules.categories).map((cat) => (
                    <TableRow key={cat}>
                      <TableCell className="font-medium">{cat}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          className="text-right h-8"
                          value={localRules.categories[cat]}
                          onChange={(e) =>
                            handleCategoryChange(cat, e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Categories are synchronized dynamically from your platform
            categories. A multiplier of 1.0 means no price increase.
          </p>
        </div>
      </div>
    </div>
  )
}
