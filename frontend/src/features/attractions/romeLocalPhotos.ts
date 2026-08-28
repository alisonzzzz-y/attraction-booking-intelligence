export type LocalAttractionPhoto = {
  alt: string
  author: string
  license: string
  licenseUrl: string
  sourceUrl: string
  src: string
}

const creativeCommonsBySaFour =
  'https://creativecommons.org/licenses/by-sa/4.0/'
const creativeCommonsByFour = 'https://creativecommons.org/licenses/by/4.0/'
const creativeCommonsByTwo = 'https://creativecommons.org/licenses/by/2.0/'
const creativeCommonsBySaThree =
  'https://creativecommons.org/licenses/by-sa/3.0/'
const creativeCommonsZero = 'https://creativecommons.org/publicdomain/zero/1.0/'

const localPhotos: Record<string, LocalAttractionPhoto[]> = {
  'colosseum-archaeological-park': [
    {
      alt: 'The Colosseum beside the Via Sacra in Rome',
      author: 'Livioandronico2013',
      license: 'CC BY-SA 4.0',
      licenseUrl: creativeCommonsBySaFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Colosseum_and_Via_Sacra_(Rome).jpg',
      src: '/images/rome/colosseum-archaeological-park.jpg',
    },
  ],
  'vatican-museums-sistine-chapel': [
    {
      alt: 'Entrance to the Sistine Chapel in the Vatican Museums',
      author: 'Tim Adams',
      license: 'CC BY 2.0',
      licenseUrl: creativeCommonsByTwo,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Entrance_to_Sistine_Chapel_in_Vatican_Museums_in_Rome,_Italy.jpg',
      src: '/images/rome/vatican-museums-sistine-chapel.jpg',
    },
  ],
  'st-peters-basilica': [
    {
      alt: 'Facade of St Peter Basilica in Rome',
      author: 'Peter J St B Green',
      license: 'CC BY-SA 3.0',
      licenseUrl: creativeCommonsBySaThree,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:St_Peters_Basilica_Rome_facade.jpg',
      src: '/images/rome/st-peters-basilica.jpg',
    },
  ],
  pantheon: [
    {
      alt: 'Interior dome of the Pantheon in Rome',
      author: 'Livioandronico2013',
      license: 'CC BY-SA 4.0',
      licenseUrl: creativeCommonsBySaFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Dome_of_Pantheon_(Rome).jpg',
      src: '/images/rome/pantheon.jpg',
    },
  ],
  'borghese-gallery': [
    {
      alt: 'Ceiling artwork inside Galleria Borghese',
      author: 'Livioandronico2013',
      license: 'CC BY-SA 4.0',
      licenseUrl: creativeCommonsBySaFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Ceiling_%22Dance_of_the_Bacchae%22_in_Galleria_Borghese_(Rome).jpg',
      src: '/images/rome/borghese-gallery.jpg',
    },
  ],
  'castel-sant-angelo': [
    {
      alt: 'Castel Sant Angelo in Rome',
      author: 'BjoernEisbaer',
      license: 'CC BY-SA 3.0',
      licenseUrl: creativeCommonsBySaThree,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Castel_Sant_Angelo_(Rome).jpg',
      src: '/images/rome/castel-sant-angelo.jpg',
    },
  ],
  'capitoline-museums': [
    {
      alt: 'Campidoglio buildings near the Capitoline Museums',
      author: 'Nhartmannphotos',
      license: 'CC BY-SA 4.0',
      licenseUrl: creativeCommonsBySaFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Campidoglio_buildings,_Rome.jpg',
      src: '/images/rome/capitoline-museums.jpg',
    },
  ],
  'baths-of-caracalla': [
    {
      alt: 'Facade of the Baths of Caracalla in Rome',
      author: 'Vyacheslav Argenberg',
      license: 'CC BY 4.0',
      licenseUrl: creativeCommonsByFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Rome,_Italy,_The_Baths_of_Caracalla_facade.jpg',
      src: '/images/rome/baths-of-caracalla.jpg',
    },
  ],
  'domus-aurea': [
    {
      alt: 'Oculus inside the Domus Aurea in Rome',
      author: 'Mariordo',
      license: 'CC BY-SA 4.0',
      licenseUrl: creativeCommonsBySaFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Oculus_Domus_Aurea_04_2024_7962.jpg',
      src: '/images/rome/domus-aurea.jpg',
    },
  ],
  'trevi-fountain': [
    {
      alt: 'Trevi Fountain in Rome',
      author: 'Wilfredor',
      license: 'CC0 1.0',
      licenseUrl: creativeCommonsZero,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Fontaine_Trevi_-_Rome.jpg',
      src: '/images/rome/trevi-fountain.jpg',
    },
  ],
}

export function localPhotosForAttraction(
  attractionId?: string,
): LocalAttractionPhoto[] {
  return attractionId ? (localPhotos[attractionId] ?? []) : []
}
