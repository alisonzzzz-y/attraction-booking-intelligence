import { useEffect, useRef, useState } from 'react'
import type { RomePlace } from '../../shared/api/romePlaces'
import { loadGoogleMaps } from '../../shared/googleMaps/loadGoogleMaps'

declare global {
  interface Window {
    gm_authFailure?: () => void
  }
}

type MapState = 'loading' | 'ready' | 'missing-key' | 'failed' | 'empty'

type RomeResultsMapProps = {
  places: RomePlace[]
  apiKey?: string
  selectedAttractionId?: string
}

export function RomeResultsMap({
  places,
  apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  selectedAttractionId,
}: RomeResultsMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const [mapState, setMapState] = useState<MapState>('loading')
  const visibleMapState: MapState =
    places.length === 0 ? 'empty' : apiKey ? mapState : 'missing-key'
  const selectedPlaces = places.filter(
    (place) => place.attractionId === selectedAttractionId,
  )

  useEffect(() => {
    if (places.length === 0 || !apiKey || !mapElementRef.current) return

    let isActive = true
    const markers: Array<{ map: unknown }> = []
    const previousAuthenticationFailure = window.gm_authFailure
    const handleAuthenticationFailure = () => {
      if (isActive) setMapState('failed')
    }

    window.gm_authFailure = handleAuthenticationFailure

    loadGoogleMaps(apiKey)
      .then(({ maps, marker: markerLibrary }) => {
        if (!isActive || !mapElementRef.current) return

        const placesToFocus = places.filter(
          (place) => place.attractionId === selectedAttractionId,
        )
        const focusedPlaces = placesToFocus.length > 0 ? placesToFocus : places
        const center = focusedPlaces.reduce(
          (position, place) => ({
            lat: position.lat + place.location.latitude / focusedPlaces.length,
            lng: position.lng + place.location.longitude / focusedPlaces.length,
          }),
          { lat: 0, lng: 0 },
        )
        const map = new maps.Map(mapElementRef.current, {
          center,
          zoom:
            placesToFocus.length > 1
              ? 15
              : placesToFocus.length === 1
                ? 16
                : 13,
          mapId: 'DEMO_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        places.forEach((place) => {
          markers.push(
            new markerLibrary.AdvancedMarkerElement({
              map,
              position: {
                lat: place.location.latitude,
                lng: place.location.longitude,
              },
              title: place.name,
            }),
          )
        })

        setMapState('ready')
      })
      .catch(() => {
        if (isActive) setMapState('failed')
      })

    return () => {
      isActive = false
      markers.forEach((marker) => {
        marker.map = null
      })
      if (window.gm_authFailure === handleAuthenticationFailure) {
        window.gm_authFailure = previousAuthenticationFailure
      }
    }
  }, [apiKey, places, selectedAttractionId])

  return (
    <aside className="results-map-panel" aria-label="Rome location map">
      <div className="results-map-heading">
        <h2>Map</h2>
        <p>
          Markers come from Google Places. The list remains available if the map
          cannot load.
        </p>
        {selectedPlaces.length > 0 ? (
          <p className="results-map-selection">
            {selectedPlaces.length === 1
              ? 'Focused location: '
              : 'Focused group: '}
            <strong>
              {selectedPlaces.map((place) => place.name).join(', ')}
            </strong>
          </p>
        ) : null}
      </div>

      <div className="results-map-frame">
        <div
          aria-label="Map showing verified Rome attraction locations"
          className="results-map-canvas"
          ref={mapElementRef}
        />
        {visibleMapState === 'ready' ? null : (
          <div className="map-fallback results-map-fallback" role="status">
            {visibleMapState === 'loading' ? (
              <p>Loading verified locations...</p>
            ) : null}
            {visibleMapState === 'missing-key' ? (
              <div>
                <strong>Map view is not configured here.</strong>
                <p>The verified location facts remain available in the list.</p>
              </div>
            ) : null}
            {visibleMapState === 'failed' ? (
              <div>
                <strong>The map could not be loaded.</strong>
                <p>The verified location facts remain available in the list.</p>
              </div>
            ) : null}
            {visibleMapState === 'empty' ? (
              <div>
                <strong>No verified marker is available.</strong>
                <p>No location conclusion is inferred from this state.</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  )
}
