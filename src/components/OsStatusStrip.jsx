import { useEffect, useState } from 'react'
import { API_HEADERS, buildApiUrl } from '../utils/api'

const fallback = {
  uptime: '—',
  local_time_kerala: '',
  current_status: 'Ready for Projects',
  availability_status: 'ONLINE',
}

export default function OsStatusStrip() {
  const [data, setData] = useState(fallback)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let cancelled = false

    const pull = () => {
      fetch(buildApiUrl('/api/system/status/'), {
        mode: 'cors',
        headers: API_HEADERS,
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((json) => {
          if (cancelled) return
          setData({
            uptime: json.uptime ?? fallback.uptime,
            local_time_kerala: json.local_time_kerala ?? json.local_time ?? '',
            current_status: json.current_status ?? json.availability_status ?? fallback.current_status,
            availability_status: json.availability_status ?? fallback.availability_status,
          })
          setErr(false)
        })
        .catch(() => {
          if (!cancelled) setErr(true)
        })
    }

    pull()
    const id = window.setInterval(pull, 30000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const keralaLabel = (() => {
    if (!data.local_time_kerala) return '—'
    try {
      return new Date(data.local_time_kerala).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
      })
    } catch {
      return data.local_time_kerala
    }
  })()

  return (
    <div className="os-status-strip" role="status">
      <div className="os-status-strip__row">
        <span className="os-status-strip__k">Sys</span>
        <span className={`os-status-strip__v${err ? ' os-status-strip__v--dim' : ''}`}>
          {err ? 'NO_HANDSHAKE' : data.availability_status}
        </span>
      </div>
      <div className="os-status-strip__row">
        <span className="os-status-strip__k">Uptime</span>
        <span className="os-status-strip__v">{data.uptime}</span>
      </div>
      <div className="os-status-strip__row">
        <span className="os-status-strip__k">Kerala</span>
        <span className="os-status-strip__v">{keralaLabel}</span>
      </div>
      <div className="os-status-strip__row">
        <span className="os-status-strip__k">State</span>
        <span className="os-status-strip__v">{data.current_status}</span>
      </div>
    </div>
  )
}
