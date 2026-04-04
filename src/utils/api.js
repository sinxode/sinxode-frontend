const FALLBACK_API_URL = 'https://sinxode-backend.onrender.com'

const viteApiUrl = typeof import.meta !== 'undefined' ? import.meta?.env?.VITE_API_URL : ''
const craApiUrl = typeof process !== 'undefined' ? process?.env?.REACT_APP_API_URL : ''
const rawBaseUrl = viteApiUrl || craApiUrl || FALLBACK_API_URL

export const BASE_URL = String(rawBaseUrl).replace(/\/+$/, '')

export const API_HEADERS = Object.freeze({
  Accept: 'application/json',
})

export function buildApiUrl(path) {
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path || ''}`
  return `${BASE_URL}${normalizedPath}`
}
