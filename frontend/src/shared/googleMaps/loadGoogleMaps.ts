import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import type { LibraryMap } from '@googlemaps/js-api-loader'

type GoogleMapsLibraries = {
  maps: LibraryMap['maps']
  marker: LibraryMap['marker']
}

let librariesPromise: Promise<GoogleMapsLibraries> | undefined

export function loadGoogleMaps(apiKey: string) {
  if (!librariesPromise) {
    setOptions({
      key: apiKey,
      v: 'weekly',
      language: 'en',
      region: 'IT',
      authReferrerPolicy: 'origin',
    })

    librariesPromise = Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
    ])
      .then(([maps, marker]) => ({ maps, marker }))
      .catch((error: unknown) => {
        librariesPromise = undefined
        throw error
      })
  }

  return librariesPromise
}
