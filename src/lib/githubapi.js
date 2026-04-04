/**
 * GitHub activity feed for Sinxode ticker.
 * - Dev: uses Vite proxy `/gh-api` (optional VITE_GITHUB_TOKEN attached server-side by Vite).
 * - Prod: prefers Django API URL from env/fallback (use GITHUB_TOKEN on the server).
 * - Fallback: direct `https://api.github.com` with VITE_GITHUB_TOKEN (often blocked by CORS in browser).
 */
import { API_HEADERS, buildApiUrl } from '../utils/api'

const USER = 'sinanneyy46'

function pickPushPayload(events) {
  if (!Array.isArray(events)) return null
  const push = events.find((e) => e.type === 'PushEvent' && e.payload?.commits?.length)
  if (!push) return null
  const commits = push.payload.commits
  const last = commits[commits.length - 1] || commits[0]
  const repoFull = push.repo?.name || ''
  const repoName = repoFull.includes('/') ? repoFull.split('/')[1] : repoFull
  return {
    commit_message: (last?.message || 'commit').split('\n')[0].trim(),
    repository_name: repoName || 'repository',
    commit_timestamp: push.created_at,
  }
}

export async function fetchLatestGitHubSignal() {
  const dev = import.meta.env.DEV
  const viteToken = import.meta.env.VITE_GITHUB_TOKEN

  const tryDjango = async () => {
    const r = await fetch(buildApiUrl('/api/github/feed/'), {
      mode: 'cors',
      headers: API_HEADERS,
    })
    if (!r.ok) throw new Error('django_feed')
    return r.json()
  }

  const tryProxy = async () => {
    const r = await fetch(`/gh-api/users/${USER}/events/public?per_page=30`, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(viteToken ? { Authorization: `Bearer ${viteToken}` } : {}),
      },
    })
    if (!r.ok) throw new Error('proxy_feed')
    const events = await r.json()
    const parsed = pickPushPayload(events)
    if (!parsed) throw new Error('no_push')
    return parsed
  }

  const tryDirect = async () => {
    if (!viteToken) throw new Error('no_token')
    const r = await fetch(`https://api.github.com/users/${USER}/events/public?per_page=30`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${viteToken}`,
      },
    })
    if (!r.ok) throw new Error('direct_feed')
    const events = await r.json()
    const parsed = pickPushPayload(events)
    if (!parsed) throw new Error('no_push')
    return parsed
  }

  if (!dev) {
    try {
      return await tryDjango()
    } catch {
      try {
        return await tryDirect()
      } catch {
        return null
      }
    }
  }

  try {
    return await tryDjango()
  } catch {
    try {
      return await tryProxy()
    } catch {
      try {
        return await tryDirect()
      } catch {
        return null
      }
    }
  }
}
