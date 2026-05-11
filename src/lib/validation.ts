import { z } from 'zod'

export type CountryCode = 'BR' | 'US'

export const commonValidation = {
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
}

export function getCountryValidation(country: CountryCode | string) {
  if (country === 'US' || country === 'United States') {
    return {
      phone: z.string().min(14, 'Invalid phone number').max(14),
      zip: z.string().min(5, 'Invalid ZIP code').max(10),
      taxId: z.string().min(9, 'Invalid Tax ID').max(11),
    }
  }

  // Default to BR format if not US
  return {
    phone: z.string().min(14, 'Invalid phone number').max(15),
    zip: z.string().min(9, 'Invalid ZIP code').max(9),
    taxId: z.string().min(14, 'Invalid document').max(18),
  }
}

export const formatPhone = (val: string, country: string) => {
  const digits = val.replace(/\D/g, '')
  if (country === 'BR' || country === 'Brazil') {
    const limited = digits.slice(0, 11)
    if (limited.length === 0) return ''
    if (limited.length <= 2) return `(${limited}`
    if (limited.length <= 6)
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
    if (limited.length <= 10)
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`
  }

  // Default US
  const limited = digits.slice(0, 10)
  if (limited.length === 0) return ''
  if (limited.length <= 3) return `(${limited}`
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6, 10)}`
}

export const formatZip = (val: string, country: string) => {
  const digits = val.replace(/\D/g, '')
  if (country === 'BR' || country === 'Brazil') {
    const limited = digits.slice(0, 8)
    if (limited.length <= 5) return limited
    return `${limited.slice(0, 5)}-${limited.slice(5, 8)}`
  }

  // Default US
  const limited = digits.slice(0, 9)
  if (limited.length <= 5) return limited
  return `${limited.slice(0, 5)}-${limited.slice(5, 9)}`
}
