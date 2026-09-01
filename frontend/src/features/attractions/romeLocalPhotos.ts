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
      alt: 'The Cortile della Pigna at the Vatican Museums',
      author: 'Wilfredor',
      license: 'CC0 1.0',
      licenseUrl: creativeCommonsZero,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Cortile_della_Pigna,_Vatican_Museums.jpg',
      src: '/images/rome/vatican-museums-sistine-chapel.jpg',
    },
  ],
  'st-peters-basilica': [
    {
      alt: "St Peter's Basilica facade and dome at dusk",
      author: 'NateBergin',
      license: 'CC BY 4.0',
      licenseUrl: creativeCommonsByFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:01_St_Peter%27s_Basilica_Facade.jpg',
      src: '/images/rome/st-peters-basilica.jpg',
    },
  ],
  pantheon: [
    {
      alt: 'The Pantheon and Piazza della Rotonda in Rome',
      author: 'Meshari Alawfi',
      license: 'CC BY 4.0',
      licenseUrl: creativeCommonsByFour,
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:PantheonRome.jpg',
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
