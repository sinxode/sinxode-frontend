import ProjectGrid from '../components/ProjectGrid'

export default function ProjectsPage() {
  return (
    <div className="projects-page">
      <header className="projects-page__head">
        <h1 className="projects-page__title">Project matrix</h1>
        <p className="projects-page__sub">
          Canonical build queue · status-coded neon · glass system windows. Tap a module for the full brief.
        </p>
      </header>
      <ProjectGrid />
    </div>
  )
}
