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
const creativeCommonsByTwo = 'https://creativecommons.org/licenses/by/2.0/'
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
    {
      alt: 'The Colosseum seen from across the archaeological park',
      author: 'Nicholas Hartmann',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Rome_Colosseum_exterior_1.jpg',
      src: '/images/rome/colosseum-archaeological-park-detail.jpg',
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
    {
      alt: 'Entrance to the Sistine Chapel in the Vatican Museums',
      author: 'Tim Adams',
      license: 'CC BY 2.0',
      licenseUrl: creativeCommonsByTwo,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Entrance_to_Sistine_Chapel_in_Vatican_Museums_in_Rome,_Italy.jpg',
      src: '/images/rome/vatican-museums-sistine-chapel-detail.jpg',
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
    {
      alt: 'Facade of St Peter Basilica in Rome',
      author: 'Peter J St B Green',
      license: 'CC BY-SA 3.0',
      licenseUrl: creativeCommonsBySaThree,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:St_Peters_Basilica_Rome_facade.jpg',
      src: '/images/rome/st-peters-basilica-detail.jpg',
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
    {
      alt: 'Interior dome of the Pantheon in Rome',
      author: 'Livioandronico2013',
      license: 'CC BY-SA 4.0',
      licenseUrl: creativeCommonsBySaFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Dome_of_Pantheon_(Rome).jpg',
      src: '/images/rome/pantheon-detail.jpg',
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
    {
      alt: 'The facade of the Borghese Gallery',
      author: 'Alessio Damato (Alejo2083), retouched by Ikiwaner',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Galleria_borghese_facade.jpg',
      src: '/images/rome/borghese-gallery-detail.jpg',
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
    {
      alt: 'Castel Sant Angelo viewed from the bridge',
      author: 'Quentin Lowagie / Klow',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Castel_Sant%27Angelo%2C_Rome%2C_from_the_Ponte_Sant%27Angelo.jpg',
      src: '/images/rome/castel-sant-angelo-detail.jpg',
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
    {
      alt: 'The courtyard of the Palazzo dei Conservatori at the Capitoline Museums',
      author: 'Jean-Pol GRANDMONT',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:0_Cortile_dei_Conservatori_-_Musei_Capitolini_-_Rome_%281%29.JPG',
      src: '/images/rome/capitoline-museums-detail.jpg',
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
    {
      alt: 'A panoramic view of the Baths of Caracalla',
      author: 'Ethan Doyle White',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Panorama_of_the_Baths_of_Caracalla.jpg',
      src: '/images/rome/baths-of-caracalla-detail.jpg',
    },
  ],
  'domus-aurea': [
    {
      alt: 'The entrance facade of the Domus Aurea in Rome',
      author: 'Rabax63',
      license: 'CC BY-SA 4.0',
      licenseUrl: creativeCommonsBySaFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:EingangDomusAurea.jpg',
      src: '/images/rome/domus-aurea.jpg',
    },
    {
      alt: 'Oculus inside the Domus Aurea in Rome',
      author: 'Mariordo',
      license: 'CC BY-SA 4.0',
      licenseUrl: creativeCommonsBySaFour,
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Oculus_Domus_Aurea_04_2024_7962.jpg',
      src: '/images/rome/domus-aurea-detail.jpg',
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
    {
      alt: 'Trevi Fountain illuminated at night',
      author: 'Bo&Ko',
      license: 'CC BY-SA 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Trevi_Fountain_at_night_31.07.2012.jpg',
      src: '/images/rome/trevi-fountain-detail.jpg',
    },
  ],
}

export function localPhotosForAttraction(
  attractionId?: string,
): LocalAttractionPhoto[] {
  return attractionId ? (localPhotos[attractionId] ?? []) : []
}
