export const MIN_PASSWORD_LENGTH = 4

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password: string, salt: string = ''): Promise<string> {
  const data = new TextEncoder().encode(salt + password)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return toHex(new Uint8Array(buffer))
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}
