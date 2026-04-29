import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface CurrencyInputProps extends Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value'
> {
  value: number
  onChange: (value: number) => void
}

export function CurrencyInput({
  value,
  onChange,
  className,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')
  const { currentLanguage, currentCurrency } = useLanguageStore()

  React.useEffect(() => {
    // Force USD to maintain the requested English/USD standard globally
    const resolvedCurrency = 'USD'
    const locale = 'en-US'

    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: resolvedCurrency,
    }).format(value)

    setDisplayValue(formatted)
  }, [value, currentLanguage, currentCurrency])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Remove everything that is not a digit
    const numericValue = inputValue.replace(/[^0-9]/g, '')

    // Convert to number (dividing by 100 to handle cents)
    const floatValue = Number(numericValue) / 100

    onChange(floatValue)
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={cn('font-mono', className)}
    />
  )
}
