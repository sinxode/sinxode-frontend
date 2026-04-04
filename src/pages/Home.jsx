import { Link } from 'react-router-dom'
import TerminalHero from '../components/TerminalHero'
import TechStackTerminal from '../components/TechStackTerminal'
import TechRadar from '../components/TechRadar'
import ProjectGrid from '../components/ProjectGrid'

export default function Home() {
  return (
    <>
      <TerminalHero />
      <TechRadar />
      <section className="home-section">
        <div className="home-section__head">
          <h2 className="home-section__title">Signal</h2>
          <span className="home-section__hint">Live stack preview</span>
        </div>
        <TechStackTerminal />
      </section>
      <section className="home-section">
        <div className="home-section__head">
          <h2 className="home-section__title">Project matrix</h2>
          <Link to="/projects" className="home-section__hint home-section__hint--link">
            View all →
          </Link>
        </div>
        <ProjectGrid previewCount={2} />
      </section>
    </>
  )
}
