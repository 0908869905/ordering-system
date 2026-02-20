import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Language } from '@/types'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Generate a unique ID with an optional prefix (e.g., "cart", "order"). */
export function generateId(prefix: string = ''): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  return prefix ? `${prefix}-${id}` : id
}

/** Return the localized name for an entity with optional English name. */
export function localized(
  language: Language,
  name: string,
  nameEn?: string
): string {
  return language === 'en' && nameEn ? nameEn : name
}
