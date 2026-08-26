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

type MapPosition = { lat: number; lng: number }

type ResultsMapInstance = {
  panTo(position: MapPosition): void
}

type ResultsMapMarker = {
  attractionId: string
  marker: {
    map: unknown
    zIndex?: number | null
  }
  pin: {
    scale?: number | null
  }
}

const DEFAULT_PIN_SCALE = 0.8
const SELECTED_PIN_SCALE = 1.3

export function RomeResultsMap({
  places,
  apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  selectedAttractionId,
}: RomeResultsMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<ResultsMapInstance | null>(null)
  const mapMarkersRef = useRef<ResultsMapMarker[]>([])
  const [mapState, setMapState] = useState<MapState>('loading')
  const visibleMapState: MapState =
    places.length === 0 ? 'empty' : apiKey ? mapState : 'missing-key'
  const selectedPlaces = places.filter(
    (place) => place.attractionId === selectedAttractionId,
  )

  useEffect(() => {
    if (places.length === 0 || !apiKey || !mapElementRef.current) return

    let isActive = true
    const markers: ResultsMapMarker[] = []
    const previousAuthenticationFailure = window.gm_authFailure
    const handleAuthenticationFailure = () => {
      if (isActive) setMapState('failed')
    }

    window.gm_authFailure = handleAuthenticationFailure

    loadGoogleMaps(apiKey)
      .then(({ maps, marker: markerLibrary }) => {
        if (!isActive || !mapElementRef.current) return

        const center = places.reduce(
          (position, place) => ({
            lat: position.lat + place.location.latitude / places.length,
            lng: position.lng + place.location.longitude / places.length,
          }),
          { lat: 0, lng: 0 },
        )
        const map = new maps.Map(mapElementRef.current, {
          center,
          zoom: 13,
          mapId: 'DEMO_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })
        mapInstanceRef.current = map

        places.forEach((place) => {
          const pin = new markerLibrary.PinElement({
            scale: DEFAULT_PIN_SCALE,
          })
          const marker = new markerLibrary.AdvancedMarkerElement({
            map,
            position: {
              lat: place.location.latitude,
              lng: place.location.longitude,
            },
            title: place.name,
            content: pin,
          })

          markers.push({
            attractionId: place.attractionId,
            marker,
            pin,
          })
        })

        mapMarkersRef.current = markers
        setMapState('ready')
      })
      .catch(() => {
        if (isActive) setMapState('failed')
      })

    return () => {
      isActive = false
      mapInstanceRef.current = null
      mapMarkersRef.current = []
      markers.forEach(({ marker }) => {
        marker.map = null
      })
      if (window.gm_authFailure === handleAuthenticationFailure) {
        window.gm_authFailure = previousAuthenticationFailure
      }
    }
  }, [apiKey, places])

  useEffect(() => {
    if (mapState !== 'ready') return

    mapMarkersRef.current.forEach(({ attractionId, marker, pin }) => {
      const isSelected = attractionId === selectedAttractionId
      pin.scale = isSelected ? SELECTED_PIN_SCALE : DEFAULT_PIN_SCALE
      marker.zIndex = isSelected ? 10 : 1
    })
  }, [mapState, selectedAttractionId])

  useEffect(() => {
    if (
      mapState !== 'ready' ||
      !selectedAttractionId ||
      !mapInstanceRef.current
    ) {
      return
    }

    const placesToFocus = places.filter(
      (place) => place.attractionId === selectedAttractionId,
    )
    if (placesToFocus.length === 0) return

    const center = placesToFocus.reduce(
      (position, place) => ({
        lat: position.lat + place.location.latitude / placesToFocus.length,
        lng: position.lng + place.location.longitude / placesToFocus.length,
      }),
      { lat: 0, lng: 0 },
    )

    mapInstanceRef.current.panTo(center)
  }, [mapState, places, selectedAttractionId])

  return (
    <aside className="results-map-panel" aria-label="Rome location map">
      <div className="results-map-frame">
        {selectedPlaces.length > 0 ? (
          <p
            aria-label="Selected map location"
            className="results-map-selection"
          >
            {selectedPlaces.map((place) => place.name).join(' · ')}
          </p>
        ) : null}
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
