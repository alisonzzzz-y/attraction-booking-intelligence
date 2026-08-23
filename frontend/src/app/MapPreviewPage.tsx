import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '../shared/googleMaps/loadGoogleMaps'

declare global {
  interface Window {
    gm_authFailure?: () => void
  }
}

const colosseumPosition = {
  lat: 41.890_210_2,
  lng: 12.492_230_9,
}

type MapState = 'loading' | 'ready' | 'missing-key' | 'failed'

type MapPreviewPageProps = {
  apiKey?: string
}

export function MapPreviewPage({
  apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
}: MapPreviewPageProps = {}) {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const [mapState, setMapState] = useState<MapState>(
    apiKey ? 'loading' : 'missing-key',
  )

  useEffect(() => {
    if (!apiKey || !mapElementRef.current) {
      return
    }

    let isActive = true
    let detachMarker: (() => void) | undefined
    const previousAuthenticationFailure = window.gm_authFailure
    const handleAuthenticationFailure = () => {
      if (isActive) {
        setMapState('failed')
      }
    }

    window.gm_authFailure = handleAuthenticationFailure

    loadGoogleMaps(apiKey)
      .then(({ maps, marker: markerLibrary }) => {
        if (!isActive || !mapElementRef.current) {
          return
        }

        const map = new maps.Map(mapElementRef.current, {
          center: colosseumPosition,
          zoom: 15,
          mapId: 'DEMO_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        const marker = new markerLibrary.AdvancedMarkerElement({
          map,
          position: colosseumPosition,
          title: 'Colosseum',
        })
        detachMarker = () => {
          marker.map = null
        }

        setMapState('ready')
      })
      .catch(() => {
        if (isActive) {
          setMapState('failed')
        }
      })

    return () => {
      isActive = false
      detachMarker?.()
      if (window.gm_authFailure === handleAuthenticationFailure) {
        window.gm_authFailure = previousAuthenticationFailure
      }
    }
  }, [apiKey])

  return (
    <section
      className="page-section map-preview-section"
      aria-labelledby="map-preview-title"
    >
      <div className="section-heading compact-heading">
        <p className="eyebrow">Google Maps connection preview</p>
        <h1 id="map-preview-title">A first map, centred on the Colosseum.</h1>
        <p className="intro">
          This page verifies the browser API key and the approved website
          origins. The location is a fixed test coordinate, not a live
          attraction result.
        </p>
      </div>

      <div className="map-preview-layout">
        <div className="map-frame">
          <div
            aria-label="Map centred on the Colosseum"
            className="map-canvas"
            ref={mapElementRef}
          />
          {mapState !== 'ready' && (
            <div className="map-fallback" role="status">
              {mapState === 'loading' && <p>Loading Google Maps...</p>}
              {mapState === 'missing-key' && (
                <div>
                  <strong>Browser key not found.</strong>
                  <p>
                    Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env.local and
                    restart the Vite server.
                  </p>
                </div>
              )}
              {mapState === 'failed' && (
                <div>
                  <strong>The map could not be loaded.</strong>
                  <p>
                    The rest of the page remains available. Check the browser
                    key restrictions and the developer console.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="map-test-card" aria-label="Map test details">
          <span className={`map-test-status map-test-status-${mapState}`}>
            {mapState === 'ready' ? 'Connection verified' : 'Connection check'}
          </span>
          <h2>What this test proves</h2>
          <ul>
            <li>The Maps JavaScript API can load from this website origin.</li>
            <li>The map and marker libraries initialise in the React app.</li>
            <li>A map failure does not remove the surrounding page content.</li>
          </ul>
          <p>
            It does not prove that ticket, availability, or opening-hour data is
            live.
          </p>
        </aside>
      </div>
    </section>
  )
}
