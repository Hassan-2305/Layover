import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DEMO_DATA } from '../data'
import type { DestinationResult } from '../engine/types'
import { formatDuration } from '../viz/format'
import { formatINR } from '../engine/format'
import { photoForDestination } from './destinationPhotos'
import { FieldCanvas } from './FieldCanvas'

interface GeoRouteMapProps {
  results: DestinationResult[]
  originId: string
  originName: string
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export type ViewMode = 'map' | 'cards' | 'network'

function getFastestMin(r: DestinationResult): number | null {
  if (!r.reachable || r.journeys.length === 0) return null
  let min = Infinity
  for (const j of r.journeys) {
    const dur = (j.arriveAt - j.departAt) / 60_000
    if (dur < min) min = dur
  }
  return min === Infinity ? null : min
}

function getCheapestINR(r: DestinationResult): number | null {
  if (!r.reachable || !r.best) return null
  return r.best.costINR
}

export function GeoRouteMap({
  results,
  originId,
  originName,
  selectedId,
  onSelect,
}: GeoRouteMapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)

  const origin = DEMO_DATA.locationById.get(originId)
  const reachableCount = useMemo(() => results.filter((r) => r.reachable).length, [results])

  // Initialize or update Leaflet map
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current || !origin) return

    // If map does not exist yet, initialize it
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [origin.lat, origin.lon],
        zoom: 8,
        scrollWheelZoom: true,
        attributionControl: false,
      })

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map)

      markersLayerRef.current = L.layerGroup().addTo(map)
      routeLayerRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current
    const markersLayer = markersLayerRef.current
    const routeLayer = routeLayerRef.current

    if (!markersLayer || !routeLayer) return

    markersLayer.clearLayers()
    routeLayer.clearLayers()

    // 1. Add Origin Marker
    const originIcon = L.divIcon({
      className: 'geo-map-origin-pin',
      html: `
        <div class="geo-pin-inner origin-inner">
          <span class="geo-pin-core origin-core"></span>
          <span class="geo-pin-pulse"></span>
          <span class="geo-pin-tag origin-tag">📍 ${originName} (Origin)</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })

    L.marker([origin.lat, origin.lon], { icon: originIcon, zIndexOffset: 1000 })
      .bindPopup(`<strong>${originName}</strong><br/>Your starting location`)
      .addTo(markersLayer)

    // 2. Add Destination Markers
    const allLatLngs: [number, number][] = [[origin.lat, origin.lon]]

    for (const r of results) {
      const loc = DEMO_DATA.locationById.get(r.location.id)
      if (!loc || loc.id === originId) continue

      allLatLngs.push([loc.lat, loc.lon])
      const isSelected = selectedId === loc.id
      const reachable = r.reachable
      const fastest = getFastestMin(r)
      const cheapest = getCheapestINR(r)

      const durationStr = fastest ? formatDuration(fastest) : ''
      const costStr = cheapest ? formatINR(cheapest) : ''

      const pinClass = `geo-pin-inner dest-inner ${
        reachable ? 'is-reachable' : 'is-unreachable'
      } ${isSelected ? 'is-selected' : ''}`

      const destIcon = L.divIcon({
        className: 'geo-map-dest-pin',
        html: `
          <div class="${pinClass}">
            <span class="geo-pin-marker"></span>
            <div class="geo-pin-card">
              <span class="geo-city-name">${loc.name}</span>
              ${
                reachable
                  ? `<span class="geo-city-meta">${durationStr} · ${costStr}</span>`
                  : `<span class="geo-city-meta unreach">Beyond limits</span>`
              }
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([loc.lat, loc.lon], {
        icon: destIcon,
        zIndexOffset: isSelected ? 900 : reachable ? 500 : 100,
      })

      marker.on('click', () => {
        onSelect(isSelected ? null : loc.id)
      })

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px;">
          <strong>${loc.name} (${loc.region})</strong><br/>
          ${
            reachable
              ? `Fastest: <b>${durationStr}</b><br/>Fares from: <b>${costStr}</b><br/>${
                  r.roundTrip ? '✅ Full day-trip feasible' : '⚠️ One-way only'
                }`
              : `Status: <span style="color: #ff6d7e;">${r.reason || 'Beyond current limits'}</span>`
          }
        </div>
      `)

      marker.addTo(markersLayer)

      // Draw polyline if selected
      if (isSelected && reachable) {
        const polyline = L.polyline(
          [
            [origin.lat, origin.lon],
            [loc.lat, loc.lon],
          ],
          {
            color: '#38bdf8',
            weight: 4,
            opacity: 0.9,
            dashArray: '6, 8',
          },
        )
        polyline.addTo(routeLayer)
      }
    }

    // Adjust bounds if appropriate
    if (selectedId) {
      const selectedLoc = DEMO_DATA.locationById.get(selectedId)
      if (selectedLoc) {
        map.panTo([selectedLoc.lat, selectedLoc.lon], { animate: true })
      }
    } else {
      map.fitBounds(L.latLngBounds(allLatLngs).pad(0.12))
    }
  }, [viewMode, origin, originId, originName, results, selectedId, onSelect])

  // Clean up Leaflet on unmount or mode switch away from map
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersLayerRef.current = null
        routeLayerRef.current = null
      }
    }
  }, [viewMode])

  return (
    <div className="geo-route-container">
      {/* Top Map Toolbar */}
      <div className="geo-route-toolbar">
        <div className="geo-toolbar-stats">
          <span className="geo-pill">
            <span className="geo-pill-dot"></span>
            <strong>{reachableCount}</strong> of {results.length} reachable
          </span>
          <span className="geo-origin-badge">From {originName}</span>
        </div>

        <div className="geo-view-toggle" role="group" aria-label="Map view mode">
          <button
            type="button"
            className={`geo-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            🗺️ Route Map
          </button>
          <button
            type="button"
            className={`geo-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            📋 Destination Cards
          </button>
          <button
            type="button"
            className={`geo-toggle-btn ${viewMode === 'network' ? 'active' : ''}`}
            onClick={() => setViewMode('network')}
          >
            ✨ Network Field
          </button>
        </div>
      </div>

      {/* Main View Display */}
      <div className="geo-route-viewport">
        {viewMode === 'map' && (
          <div className="geo-leaflet-wrapper">
            <div ref={mapContainerRef} className="geo-leaflet-map" />
            <div className="geo-map-legend">
              <span className="legend-item"><span className="legend-dot green"></span> Reachable</span>
              <span className="legend-item"><span className="legend-dot blue"></span> Selected</span>
              <span className="legend-item"><span className="legend-dot grey"></span> Beyond Limits</span>
            </div>
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="geo-cards-grid">
            {results.map((r) => {
              const loc = DEMO_DATA.locationById.get(r.location.id)
              if (!loc) return null
              const isSelected = selectedId === loc.id
              const photo = photoForDestination(loc.id)
              const fastest = getFastestMin(r)
              const cheapest = getCheapestINR(r)

              return (
                <div
                  key={loc.id}
                  className={`geo-dest-card ${r.reachable ? 'is-reachable' : 'is-unreachable'} ${
                    isSelected ? 'selected' : ''
                  }`}
                  onClick={() => onSelect(isSelected ? null : loc.id)}
                >
                  <div className="geo-card-img-wrap">
                    {photo ? (
                      <img src={photo} alt={loc.name} className="geo-card-img" loading="lazy" />
                    ) : (
                      <div className="geo-card-img-fallback">{loc.name.charAt(0)}</div>
                    )}
                    <span className="geo-region-badge">{loc.region}</span>
                    {r.roundTrip && <span className="geo-roundtrip-badge">Day Trip</span>}
                  </div>
                  <div className="geo-card-body">
                    <h4 className="geo-card-title">{loc.name}</h4>
                    <div className="geo-card-tags">
                      {loc.tags.map((tag) => (
                        <span key={tag} className="geo-tag-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {r.reachable ? (
                      <div className="geo-card-metrics">
                        {fastest && <span className="metric-time">⏱️ {formatDuration(fastest)}</span>}
                        {cheapest && <span className="metric-fare">💰 from {formatINR(cheapest)}</span>}
                      </div>
                    ) : (
                      <div className="geo-card-metrics unreachable">
                        <span>{r.reason || 'Beyond current limits'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {viewMode === 'network' && (
          <FieldCanvas
            results={results}
            originId={originId}
            originName={originName}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        )}
      </div>
    </div>
  )
}
