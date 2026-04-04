import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ProjectStackIcon } from '../lib/projectStackIcon'
import { API_HEADERS, buildApiUrl } from '../utils/api'
import ProjectModal from './ProjectModal'

function statusClass(status) {
  return String(status || 'STABLE')
    .toLowerCase()
    .replace(/_/g, '-')
}

export default function ProjectGrid({ projects, previewCount = null, emptyHint }) {
  const [active, setActive] = useState(null)
  const [resolvedProjects, setResolvedProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const shouldFetchProjects = !Array.isArray(projects)

  useEffect(() => {
    if (!shouldFetchProjects) return undefined

    const ac = new AbortController()
    setLoading(true)

    fetch(buildApiUrl('/api/projects/'), {
      signal: ac.signal,
      mode: 'cors',
      headers: API_HEADERS,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`status_${r.status}`))))
      .then((raw) => {
        if (ac.signal.aborted) return
        const arr = Array.isArray(raw) ? raw : raw?.results ?? []
        setResolvedProjects(arr)
        setLoadError(false)
      })
      .catch(() => {
        if (ac.signal.aborted) return
        setResolvedProjects([])
        setLoadError(true)
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })

    return () => ac.abort()
  }, [shouldFetchProjects])

  const sourceProjects = shouldFetchProjects ? resolvedProjects : projects || []

  const sorted = useMemo(() => {
    const list = [...sourceProjects]
    list.sort((a, b) => (a.matrix_order ?? 0) - (b.matrix_order ?? 0))
    if (previewCount != null && previewCount > 0) return list.slice(0, previewCount)
    return list
  }, [sourceProjects, previewCount])

  if (!sorted.length) {
    if (loading) {
      return <p className="project-matrix__empty">Loading project matrix...</p>
    }
    if (loadError) {
      return <p className="project-matrix__empty">Unable to load projects from API.</p>
    }
    return (
      <p className="project-matrix__empty">
        {emptyHint || 'No projects in matrix. Run: python manage.py seed_project_matrix'}
      </p>
    )
  }

  return (
    <>
      <div className={`project-matrix${previewCount ? ' project-matrix--preview' : ''}`}>
        {sorted.map((p) => {
          const featured = p.grid_size === 'FEATURED'
          const st = statusClass(p.status)
          return (
            <motion.article
              key={p.id ?? p.matrix_order}
              layout
              className={`project-matrix__cell project-matrix__cell--${featured ? 'featured' : 'medium'}`}
            >
              <div
                className={`project-matrix__card project-matrix__card--status-${st}`}
                role="button"
                tabIndex={0}
                onClick={() => setActive(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActive(p)
                  }
                }}
              >
                <div className="project-matrix__glow" aria-hidden />
                <div className="project-matrix__card-inner">
                  <div className="project-matrix__top">
                    <span className="project-matrix__order">{String(p.matrix_order ?? 0).padStart(2, '0')}</span>
                    <span className="project-matrix__tag">{p.matrix_tag}</span>
                    <span className={`project-matrix__status project-matrix__status--${st}`}>{p.status}</span>
                  </div>
                  <h2 className="project-matrix__title">{p.title}</h2>
                  <p className="project-matrix__excerpt">{p.description}</p>
                  <div className="project-matrix__icons" aria-hidden>
                    {(p.stack_icons || []).slice(0, 6).map((name) => (
                      <ProjectStackIcon key={name} name={name} size={20} className="project-matrix__icon" />
                    ))}
                  </div>
                  {p.show_wip_badge ? (
                    <div className="project-matrix__wip">[ WORK_IN_PROGRESS ]</div>
                  ) : null}
                  <div className="project-matrix__actions">
                    {p.live_url ? (
                      <a
                        className="project-matrix__live"
                        href={p.live_url.startsWith('http') ? p.live_url : `https://${p.live_url}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        [ EXECUTE_LIVE_URL ]
                      </a>
                    ) : null}
                    <span className="project-matrix__open-hint">OPEN_BRIEF →</span>
                  </div>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
      <ProjectModal project={active} onClose={() => setActive(null)} />
    </>
  )
}
