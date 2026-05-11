import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskPhone(value: string, region: string = 'US') {
  let v = value.replace(/\D/g, '')
  if (region === 'BR') {
    if (v.length > 11) v = v.substring(0, 11)
    if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    return v
  }

  if (v.length > 10) v = v.substring(0, 10)
  if (v.length > 6) return v.replace(/^(\d{3})(\d{3})(\d{0,4})/, '($1) $2-$3')
  if (v.length > 3) return v.replace(/^(\d{3})(\d{0,3})/, '($1) $2')
  return v
}

export function maskZip(value: string, region: string = 'US') {
  let v = value.replace(/\D/g, '')
  if (region === 'BR') {
    if (v.length > 8) v = v.substring(0, 8)
    if (v.length > 5) return v.replace(/^(\d{5})(\d{0,3})/, '$1-$2')
    return v
  }

  if (v.length > 9) v = v.substring(0, 9)
  if (v.length > 5) return v.replace(/^(\d{5})(\d{0,4})/, '$1-$2')
  return v
}

export function maskTaxId(value: string, region: string = 'US') {
  let v = value.replace(/\D/g, '')
  if (region === 'BR') {
    if (v.length > 14) v = v.substring(0, 14)
    if (v.length > 11) {
      // CNPJ
      v = v.replace(/^(\d{2})(\d)/, '$1.$2')
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
      v = v.replace(/(\d{4})(\d)/, '$1-$2')
      return v
    }
    // CPF
    v = v.replace(/^(\d{3})(\d)/, '$1.$2')
    v = v.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    v = v.replace(/\.(\d{3})(\d)/, '.$1-$2')
    return v
  }

  // Default US SSN/EIN
  if (v.length > 9) v = v.substring(0, 9)
  if (v.length > 5) return v.replace(/^(\d{3})(\d{2})(\d{0,4})/, '$1-$2-$3')
  if (v.length > 3) return v.replace(/^(\d{3})(\d{0,2})/, '$1-$2')
  return v
}
