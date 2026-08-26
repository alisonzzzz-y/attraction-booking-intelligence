import type { RomePlace } from '../../shared/api/romePlaces'

// These stable map references were verified against Google Places on the dates
// stored below. They are only used for map positioning when live place evidence
// is incomplete. They must not be treated as live business-status evidence.
const ROME_MAP_REFERENCES: RomePlace[] = [
  {
    attractionId: 'pantheon',
    componentId: 'pantheon',
    placeId: 'ChIJqUCGZ09gLxMRLM42IPpl0co',
    name: 'Pantheon',
    formattedAddress: 'Piazza della Rotonda, 00186 Roma RM, Italy',
    location: { latitude: 41.8986108, longitude: 12.4768729 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Pantheon%2C%20Rome&query_place_id=ChIJqUCGZ09gLxMRLM42IPpl0co',
    businessStatus: null,
    retrievedAt: '2026-08-19T08:01:00Z',
  },
  {
    attractionId: 'borghese-gallery',
    componentId: 'borghese-gallery',
    placeId: 'ChIJq-bXVgRhLxMRv3vgOXaktBs',
    name: 'Galleria Borghese',
    formattedAddress: 'Piazzale Scipione Borghese, 5, 00197 Roma RM, Italy',
    location: { latitude: 41.914231, longitude: 12.492143 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Galleria%20Borghese%2C%20Rome&query_place_id=ChIJq-bXVgRhLxMRv3vgOXaktBs',
    businessStatus: null,
    retrievedAt: '2026-08-19T08:01:00Z',
  },
  {
    attractionId: 'colosseum-archaeological-park',
    componentId: 'colosseum',
    placeId: 'ChIJrRMgU7ZhLxMRxAOFkC7I8Sg',
    name: 'Colosseum',
    formattedAddress: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy',
    location: { latitude: 41.8902102, longitude: 12.4922309 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Colosseum%2C%20Rome&query_place_id=ChIJrRMgU7ZhLxMRxAOFkC7I8Sg',
    businessStatus: null,
    retrievedAt: '2026-08-19T08:01:00Z',
  },
  {
    attractionId: 'colosseum-archaeological-park',
    componentId: 'roman-forum',
    placeId: 'ChIJ782pg7NhLxMR5n3swAdAkfo',
    name: 'Roman Forum',
    formattedAddress: 'Via della Salara Vecchia, 5/6, 00186 Roma RM, Italy',
    location: { latitude: 41.8924623, longitude: 12.485325 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Roman%20Forum%2C%20Rome&query_place_id=ChIJ782pg7NhLxMR5n3swAdAkfo',
    businessStatus: null,
    retrievedAt: '2026-08-19T08:01:00Z',
  },
  {
    attractionId: 'colosseum-archaeological-park',
    componentId: 'palatine-hill',
    placeId: 'ChIJowJff7VhLxMRLmHQKoSniFE',
    name: 'Palatine Hill',
    formattedAddress: '00186 Rome, Metropolitan City of Rome Capital, Italy',
    location: { latitude: 41.889423, longitude: 12.487466 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Palatine%20Hill%2C%20Rome&query_place_id=ChIJowJff7VhLxMRLmHQKoSniFE',
    businessStatus: null,
    retrievedAt: '2026-08-19T08:01:00Z',
  },
  {
    attractionId: 'vatican-museums-sistine-chapel',
    componentId: 'vatican-museums',
    placeId: 'ChIJKcGbg2NgLxMRthZkUqDs4M8',
    name: 'Vatican Museums',
    formattedAddress: '00120, Vatican City',
    location: { latitude: 41.9064878, longitude: 12.4536413 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Vatican%20Museums&query_place_id=ChIJKcGbg2NgLxMRthZkUqDs4M8',
    businessStatus: null,
    retrievedAt: '2026-08-20T08:01:00Z',
  },
  {
    attractionId: 'vatican-museums-sistine-chapel',
    componentId: 'sistine-chapel',
    placeId: 'ChIJ268jxWVgLxMRIj61f4fIFqs',
    name: 'Sistine Chapel',
    formattedAddress: '00120, Vatican City',
    location: { latitude: 41.9029468, longitude: 12.4544835 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Sistine%20Chapel&query_place_id=ChIJ268jxWVgLxMRIj61f4fIFqs',
    businessStatus: null,
    retrievedAt: '2026-08-20T08:01:00Z',
  },
  {
    attractionId: 'baths-of-caracalla',
    componentId: 'baths-of-caracalla',
    placeId: 'ChIJ1YU-M85hLxMR3Jhb6gZAK2o',
    name: 'Baths of Caracalla',
    formattedAddress: 'Viale delle Terme di Caracalla, 00153 Roma RM, Italy',
    location: { latitude: 41.8790382, longitude: 12.4924394 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Baths%20of%20Caracalla%2C%20Rome&query_place_id=ChIJ1YU-M85hLxMR3Jhb6gZAK2o',
    businessStatus: null,
    retrievedAt: '2026-08-21T08:01:00Z',
  },
  {
    attractionId: 'capitoline-museums',
    componentId: 'capitoline-museums',
    placeId: 'ChIJ8-wGeU9gLxMR--zJtnpGod4',
    name: 'Capitoline Museums',
    formattedAddress: 'Piazza del Campidoglio, 1, 00186 Roma RM, Italy',
    location: { latitude: 41.8929428, longitude: 12.4825577 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Capitoline%20Museums%2C%20Rome&query_place_id=ChIJ8-wGeU9gLxMR--zJtnpGod4',
    businessStatus: null,
    retrievedAt: '2026-08-21T08:31:00Z',
  },
  {
    attractionId: 'st-peters-basilica',
    componentId: 'st-peters-basilica',
    placeId: 'ChIJWZsUt2FgLxMRg1KHzXfwS3I',
    name: "Saint Peter's Basilica",
    formattedAddress: 'Piazza San Pietro, 00120 Citta del Vaticano',
    location: { latitude: 41.9021667, longitude: 12.4539367 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Saint%20Peters%20Basilica&query_place_id=ChIJWZsUt2FgLxMRg1KHzXfwS3I',
    businessStatus: null,
    retrievedAt: '2026-08-21T08:31:00Z',
  },
  {
    attractionId: 'castel-sant-angelo',
    componentId: 'castel-sant-angelo',
    placeId: 'ChIJ0aTnEYeKJRMRiUF95xwRbDY',
    name: "Castel Sant'Angelo",
    formattedAddress: 'Lungotevere Castello, 50, 00193 Roma RM, Italy',
    location: { latitude: 41.9030632, longitude: 12.466276 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Castel%20Sant%20Angelo%2C%20Rome&query_place_id=ChIJ0aTnEYeKJRMRiUF95xwRbDY',
    businessStatus: null,
    retrievedAt: '2026-08-21T08:31:00Z',
  },
  {
    attractionId: 'domus-aurea',
    componentId: 'domus-aurea',
    placeId: 'ChIJp-3oaLdhLxMRS_bYIp1GB8w',
    name: 'Domus Aurea',
    formattedAddress: 'Via della Domus Aurea, 1, 00184 Roma RM, Italy',
    location: { latitude: 41.891076, longitude: 12.495715 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Domus%20Aurea%2C%20Rome&query_place_id=ChIJp-3oaLdhLxMRS_bYIp1GB8w',
    businessStatus: null,
    retrievedAt: '2026-08-21T08:31:00Z',
  },
  {
    attractionId: 'trevi-fountain',
    componentId: 'trevi-fountain',
    placeId: 'ChIJ1UCDJ1NgLxMRtrsCzOHxdvY',
    name: 'Trevi Fountain',
    formattedAddress: 'Piazza di Trevi, 00187 Roma RM, Italy',
    location: { latitude: 41.9009325, longitude: 12.483313 },
    googleMapsUri:
      'https://www.google.com/maps/search/?api=1&query=Trevi%20Fountain%2C%20Rome&query_place_id=ChIJ1UCDJ1NgLxMRtrsCzOHxdvY',
    businessStatus: null,
    retrievedAt: '2026-08-21T08:31:00Z',
  },
]

function referenceKey(place: RomePlace) {
  return `${place.attractionId}:${place.componentId}`
}

export function mergeRomeMapPlaces(livePlaces: RomePlace[]): RomePlace[] {
  const merged = new Map(
    ROME_MAP_REFERENCES.map((place) => [referenceKey(place), place]),
  )

  livePlaces.forEach((place) => merged.set(referenceKey(place), place))

  return [...merged.values()]
}
