import { formatINR } from '../engine/format'
import { LOCATIONS } from '../data'
import {
  INTERESTS,
  PLANNER_BUDGET_MAX,
  PLANNER_BUDGET_MIN,
  PLANNER_HOURS_MAX,
  PLANNER_HOURS_MIN,
} from '../state/planner'
import type { PlannerAction, PlannerState } from '../state/planner'
import { photoForDestination } from './destinationPhotos'

interface PlannerFormProps {
  planner: PlannerState
  dispatchPlanner: (action: PlannerAction) => void
  onHome: () => void
  onExplore: () => void
  /** Fired after "Find my trips" stores the request — the shell swaps to the results view. */
  onSubmitted: () => void
}

const BUDGET_PRESETS = [500, 1000, 1500, 2000, 3000]
const HOUR_PRESETS = [6, 8, 12, 18, 24]

export function PlannerForm({
  planner,
  dispatchPlanner,
  onHome,
  onExplore,
  onSubmitted,
}: PlannerFormProps) {
  const { draft } = planner
  const currentOrigin = LOCATIONS.find((l) => l.id === draft.originId) ?? LOCATIONS[0]

  // Filter spots in neighboring regions to display as inspirational preview
  const nearbyDestinations = LOCATIONS.filter((l) => l.id !== draft.originId).slice(0, 4)

  return (
    <div className="light-page planner">
      {/* Decorative Human-Feel Background Elements */}
      <div className="travel-bg-decoration" aria-hidden="true">
        <div className="bg-contour-pattern" />
        <div className="bg-stamp-badge subtle">
          <div className="stamp-circle">
            <span className="stamp-arc">PARAMETRIC ROUTE FINDER</span>
            <span className="stamp-center">STATION BOUND</span>
          </div>
        </div>
      </div>

      <header className="planner-head">
        <button type="button" className="cta-quiet" onClick={onHome}>
          ← Home
        </button>
        <div className="planner-head-actions">
          <button type="button" className="cta-quiet" onClick={onExplore}>
            🗺️ Route & Transit Map
          </button>
        </div>
      </header>

      <div className="planner-hero-intro">
        <span className="planner-kicker">CUSTOM DAY TRIP ENGINE</span>
        <h1 className="planner-title">Plan your perfect day out</h1>
        <p className="planner-sub">
          Set your origin, budget, and free hours. EVERYWHERE computes feasible round trips
          guaranteeing at least 90 minutes on the ground and an on-time return home.
        </p>
      </div>

      <div className="planner-two-col">
        {/* Left Column: The Form */}
        <form
          className="planner-form"
          onSubmit={(e) => {
            e.preventDefault()
            dispatchPlanner({ type: 'submit' })
            onSubmitted()
          }}
        >
          {/* Starting Station */}
          <div className="planner-card">
            <div className="card-header-row">
              <label className="planner-label" htmlFor="planner-origin">
                📍 Starting Location
              </label>
              <span className="card-hint-badge">{currentOrigin.region}</span>
            </div>
            <select
              id="planner-origin"
              className="planner-select"
              value={draft.originId}
              onChange={(e) => dispatchPlanner({ type: 'setOrigin', id: e.target.value })}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} — {loc.region}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div className="planner-card">
            <div className="card-header-row">
              <label className="planner-label" htmlFor="planner-budget">
                💰 Maximum Budget
              </label>
              <span className="planner-value">
                {formatINR(draft.budgetINR)}
                <span className="unit">per person</span>
              </span>
            </div>
            <input
              id="planner-budget"
              type="range"
              min={PLANNER_BUDGET_MIN}
              max={PLANNER_BUDGET_MAX}
              step={50}
              value={draft.budgetINR}
              onChange={(e) => dispatchPlanner({ type: 'setBudget', inr: Number(e.target.value) })}
            />
            <div className="planner-extents">
              <span>{formatINR(PLANNER_BUDGET_MIN)}</span>
              <span>{formatINR(PLANNER_BUDGET_MAX)}</span>
            </div>
            <div className="planner-presets-row">
              {BUDGET_PRESETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`preset-pill ${draft.budgetINR === b ? 'active' : ''}`}
                  onClick={() => dispatchPlanner({ type: 'setBudget', inr: b })}
                >
                  {formatINR(b)}
                </button>
              ))}
            </div>
          </div>

          {/* Available Hours */}
          <div className="planner-card">
            <div className="card-header-row">
              <label className="planner-label" htmlFor="planner-hours">
                ⏱️ Available Window
              </label>
              <span className="planner-value">
                {draft.availableHours}
                <span className="unit">hours total</span>
              </span>
            </div>
            <input
              id="planner-hours"
              type="range"
              min={PLANNER_HOURS_MIN}
              max={PLANNER_HOURS_MAX}
              step={1}
              value={draft.availableHours}
              onChange={(e) => dispatchPlanner({ type: 'setHours', hours: Number(e.target.value) })}
            />
            <div className="planner-extents">
              <span>{PLANNER_HOURS_MIN} h</span>
              <span>{PLANNER_HOURS_MAX} h</span>
            </div>
            <div className="planner-presets-row">
              {HOUR_PRESETS.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={`preset-pill ${draft.availableHours === h ? 'active' : ''}`}
                  onClick={() => dispatchPlanner({ type: 'setHours', hours: h })}
                >
                  {h} hours
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <fieldset className="planner-card planner-interests">
            <div className="card-header-row">
              <legend className="planner-label">🎯 Trip Interests</legend>
              <span className="card-hint-badge">Ranked in order picked</span>
            </div>
            <div className="chip-row" role="group">
              {INTERESTS.map(({ id, label }) => {
                const priority = draft.interests.indexOf(id)
                const selected = priority !== -1
                return (
                  <button
                    key={id}
                    type="button"
                    className={`chip${selected ? ' selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => dispatchPlanner({ type: 'toggleInterest', interest: id })}
                  >
                    {selected && <span className="chip-priority">#{priority + 1}</span>}
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button type="submit" className="cta-loud planner-submit">
            Find My Trips →
          </button>
        </form>

        {/* Right Column: Insights & Preview */}
        <aside className="planner-insights-side">
          <div className="planner-summary-card">
            <h3 className="insights-title">Trip Guarantee</h3>
            <ul className="insights-checklist">
              <li>
                <span className="check-icon">✓</span>
                <div>
                  <strong>No Rush Guarantee</strong>
                  <p>Every itinerary includes a minimum 90-minute stay at the destination.</p>
                </div>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <div>
                  <strong>Budget Accountability</strong>
                  <p>Covers both travel legs, sightseeing fees, and delicious local food.</p>
                </div>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <div>
                  <strong>Reliable Return</strong>
                  <p>Guaranteed to beat your {draft.availableHours}-hour deadline with transfer safety buffer.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="planner-nearby-preview">
            <h4 className="preview-heading">Popular Escapes From {currentOrigin.name}</h4>
            <div className="preview-mini-grid">
              {nearbyDestinations.map((loc) => {
                const photo = photoForDestination(loc.id)
                return (
                  <div key={loc.id} className="preview-mini-card">
                    {photo ? (
                      <img src={photo} alt={loc.name} className="preview-mini-img" loading="lazy" />
                    ) : (
                      <div className="preview-mini-monogram">{loc.name.charAt(0)}</div>
                    )}
                    <div className="preview-mini-info">
                      <span className="preview-mini-name">{loc.name}</span>
                      <span className="preview-mini-region">{loc.region}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
