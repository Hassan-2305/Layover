import { useState } from 'react'
import { LOCATIONS } from '../data'
import { photoForDestination } from './destinationPhotos'
import { formatINR } from '../engine/format'

interface HomeProps {
  onPlanDay: () => void
  onExplore: () => void
  onQuickPlan?: (originId: string, budgetINR: number, availableHours: number) => void
  onSelectDestination?: (destId: string) => void
}

const BUDGET_PRESETS = [500, 1000, 1500, 2000, 3000]
const HOUR_PRESETS = [6, 8, 12, 18, 24]

const SAMPLE_STORIES = [
  {
    origin: 'Kozhikode',
    destination: 'Wayanad (Kalpetta)',
    destId: 'wayanad',
    headline: 'Misty Ghats & Tea Plantation Trail',
    travelTime: '2h 30m',
    fare: '₹145',
    summary:
      'Scenic climb through Thamarassery Churam, visit sprawling mountain tea gardens, and enjoy an authentic tribal bamboo-rice meal.',
    tags: ['Hills', 'Nature', 'Tea'],
  },
  {
    origin: 'Kozhikode',
    destination: 'Thalassery',
    destId: 'thalassery',
    headline: 'Coastal Forts & Heritage Cuisine',
    travelTime: '1h 10m',
    fare: '₹45',
    summary:
      'Explore the 18th-century sea-facing English Fort, taste legendary Tellicherry Dum Biryani, and walk along Muzhappilangad drive-in beach.',
    tags: ['History', 'Food', 'Coast'],
  },
  {
    origin: 'Kozhikode',
    destination: 'Ooty',
    destId: 'ooty',
    headline: 'Nilgiri Mountain Railway & Pines',
    travelTime: '5h 15m',
    fare: '₹220',
    summary:
      'Ascend into cool pine forests, ride the heritage mountain railway, visit the botanical gardens, and bring home handcrafted chocolates.',
    tags: ['Hills', 'Tea', 'Heritage'],
  },
]

export function Home({ onPlanDay, onExplore, onQuickPlan, onSelectDestination }: HomeProps) {
  const [selectedOrigin, setSelectedOrigin] = useState('kozhikode')
  const [selectedBudget, setSelectedBudget] = useState(1500)
  const [selectedHours, setSelectedHours] = useState(12)
  const [regionFilter, setRegionFilter] = useState<'All' | 'Kerala' | 'Karnataka' | 'Tamil Nadu'>('All')

  const filteredLocations = LOCATIONS.filter(
    (loc) => regionFilter === 'All' || loc.region === regionFilter,
  )

  const handleLaunchPlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (onQuickPlan) {
      onQuickPlan(selectedOrigin, selectedBudget, selectedHours)
    } else {
      onPlanDay()
    }
  }

  return (
    <div className="light-page home">
      {/* Top Navigation */}
      <header className="home-top-nav">
        <div className="home-brand">
          <div className="brand-logo-icon">🧭</div>
          <div>
            <span className="brand-title">EVERYWHERE</span>
            <span className="brand-tag">Day-Trip Intelligence</span>
          </div>
        </div>
        <nav className="home-nav-links">
          <button type="button" className="nav-link-btn" onClick={onExplore}>
            🗺️ Live Transit Map
          </button>
          <button type="button" className="cta-loud home-nav-cta" onClick={onPlanDay}>
            Plan My Day →
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="home-hero-card">
        <div className="hero-content">
          <div className="hero-kicker">
            <span className="kicker-pill">⚡ Multimodal Day Trips</span>
            <span className="kicker-text">South India Layover & Weekend Planner</span>
          </div>
          <h1 className="home-title">Plan the whole day, not just the ride.</h1>
          <p className="home-sub">
            Pick your budget and free hours. EVERYWHERE searches train, bus, and ferry timetables to
            design guaranteed round-trip journeys — outbound travel, must-see sights, authentic local
            food, and an assured return before your deadline.
          </p>

          {/* Integrated Interactive Quick Trip Finder */}
          <form className="hero-finder-widget" onSubmit={handleLaunchPlan}>
            <div className="finder-grid">
              {/* Origin */}
              <div className="finder-field">
                <label htmlFor="hero-origin" className="finder-label">
                  Starting From
                </label>
                <select
                  id="hero-origin"
                  className="finder-select"
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div className="finder-field">
                <label className="finder-label">
                  Max Budget: <strong>{formatINR(selectedBudget)}</strong>
                </label>
                <div className="preset-chips">
                  {BUDGET_PRESETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`preset-chip ${selectedBudget === b ? 'active' : ''}`}
                      onClick={() => setSelectedBudget(b)}
                    >
                      {formatINR(b)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="finder-field">
                <label className="finder-label">
                  Available Window: <strong>{selectedHours} Hours</strong>
                </label>
                <div className="preset-chips">
                  {HOUR_PRESETS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={`preset-chip ${selectedHours === h ? 'active' : ''}`}
                      onClick={() => setSelectedHours(h)}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="finder-footer">
              <span className="finder-guarantee">
                🛡️ Guaranteed return deadline with multi-leg transfer protection
              </span>
              <button type="submit" className="cta-loud finder-submit-btn">
                Find My Day Trips →
              </button>
            </div>
          </form>
        </div>

        {/* Hero Highlights / Metrics Ribbon */}
        <div className="hero-metrics-ribbon">
          <div className="metric-box">
            <span className="metric-number">18</span>
            <span className="metric-title">Curated Destinations</span>
            <span className="metric-sub">Kerala, Karnataka & TN</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">90+ min</span>
            <span className="metric-title">Guaranteed Stay</span>
            <span className="metric-sub">No rush, real sightseeing</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">100%</span>
            <span className="metric-title">On-Time Return</span>
            <span className="metric-sub">Calculated with safety buffer</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">₹0</span>
            <span className="metric-title">Zero Hidden Costs</span>
            <span className="metric-sub">Fares, food & entry fees</span>
          </div>
        </div>
      </section>

      {/* Featured Destinations Showcase */}
      <section className="home-showcase-section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Explore Reachable Destinations</h2>
            <p className="section-desc">
              From tranquil backwaters to misty tea plantations and historic forts — all reachable within a day.
            </p>
          </div>
          <div className="region-filter-tabs">
            {(['All', 'Kerala', 'Karnataka', 'Tamil Nadu'] as const).map((r) => (
              <button
                key={r}
                type="button"
                className={`region-tab ${regionFilter === r ? 'active' : ''}`}
                onClick={() => setRegionFilter(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="showcase-grid">
          {filteredLocations.map((loc) => {
            const photo = photoForDestination(loc.id)
            return (
              <article
                key={loc.id}
                className="showcase-card"
                onClick={() => {
                  if (onSelectDestination) {
                    onSelectDestination(loc.id)
                  } else {
                    onExplore()
                  }
                }}
              >
                <div className="showcase-card-img-box">
                  {photo ? (
                    <img src={photo} alt={loc.name} className="showcase-card-img" loading="lazy" />
                  ) : (
                    <div className="showcase-monogram">{loc.name.charAt(0)}</div>
                  )}
                  <span className="showcase-region-tag">{loc.region}</span>
                </div>
                <div className="showcase-card-body">
                  <h3 className="showcase-card-name">{loc.name}</h3>
                  <div className="showcase-tags">
                    {loc.tags.map((tag) => (
                      <span key={tag} className="showcase-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="showcase-card-footer">
                    <span className="showcase-action-link">View Trips →</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Curated Itinerary Spotlight */}
      <section className="home-itinerary-section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Popular Day Itineraries</h2>
            <p className="section-desc">
              Hand-crafted day trips optimized for scenery, culture, and stress-free transit.
            </p>
          </div>
          <button type="button" className="cta-quiet" onClick={onPlanDay}>
            Custom Plan Your Day
          </button>
        </div>

        <div className="itinerary-cards-grid">
          {SAMPLE_STORIES.map((story) => (
            <div key={story.destination} className="itinerary-card">
              <div className="itinerary-card-header">
                <span className="itinerary-route">
                  {story.origin} ➔ {story.destination}
                </span>
                <span className="itinerary-meta">
                  ⏱️ {story.travelTime} · 💰 from {story.fare}
                </span>
              </div>
              <h3 className="itinerary-headline">{story.headline}</h3>
              <p className="itinerary-summary">{story.summary}</p>
              <div className="itinerary-tags">
                {story.tags.map((t) => (
                  <span key={t} className="itinerary-tag">
                    {t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="cta-loud itinerary-plan-btn"
                onClick={() => {
                  if (onSelectDestination) {
                    onSelectDestination(story.destId)
                  } else {
                    onPlanDay()
                  }
                }}
              >
                Inspect This Route
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="home-how-section">
        <h2 className="section-title text-center">How EVERYWHERE Works</h2>
        <p className="section-desc text-center">
          Zero guesswork. Transparent schedules. Complete peace of mind.
        </p>

        <div className="how-steps-grid">
          <div className="how-step-card">
            <div className="step-badge">1</div>
            <h3>Set Constraints</h3>
            <p>
              Tell us your starting station, exact budget in rupees, and the hour you must be back home.
            </p>
          </div>
          <div className="how-step-card">
            <div className="step-badge">2</div>
            <h3>Live Timetable Engine</h3>
            <p>
              Our engine checks every bus, train, and transfer connection, weeding out impossible or stranded trips.
            </p>
          </div>
          <div className="how-step-card">
            <div className="step-badge">3</div>
            <h3>Guaranteed Itinerary</h3>
            <p>
              Receive a step-by-step day itinerary with at least 90 minutes on the ground, famous sights, and local dining.
            </p>
          </div>
        </div>
      </section>

      {/* Footer & Data Disclosure */}
      <footer className="home-footer">
        <div className="footer-links">
          <span>EVERYWHERE © 2026</span>
          <button type="button" className="footer-text-btn" onClick={onExplore}>
            Explore Route Map
          </button>
          <button type="button" className="footer-text-btn" onClick={onPlanDay}>
            Day Trip Planner
          </button>
        </div>
        <p className="home-disclosure">
          Timetables, fares, and activity ideas are author-verified demo estimates for reference day.
          Everything runs offline except route map tiles (OpenStreetMap). No accounts, zero trackers,
          complete privacy.
        </p>
      </footer>
    </div>
  )
}
