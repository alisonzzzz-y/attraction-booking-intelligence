// General descriptions from the checked official catalogue. No cached booking rules.
// 来自已核对官方目录的一般介绍，不缓存预约规则。
const overviews: Record<string, { text: string; sourceUrl: string }> = {
  'colosseum-archaeological-park': {
    text: "Ancient Rome's largest amphitheatre, part of the archaeological park with the Roman Forum and Palatine Hill.",
    sourceUrl: 'https://colosseo.it/en/tickets/colosseum-roman-forum-palatine/',
  },
  'borghese-gallery': {
    text: 'An art museum in Villa Borghese.',
    sourceUrl:
      'https://galleriaborghese.beniculturali.it/en/wp-content/uploads/Guidelines-on-the-new-procedures-for-visits.pdf',
  },
  'domus-aurea': {
    text: "Nero's archaeological palace complex.",
    sourceUrl: 'https://colosseo.it/en/tickets/domus-aurea/',
  },
  'capitoline-museums': {
    text: "Rome's civic museum collection on Capitoline Hill.",
    sourceUrl: 'https://www.museicapitolini.org/en/node/1011298',
  },
  'st-peters-basilica': {
    text: 'The principal basilica of Vatican City.',
    sourceUrl:
      'https://www.basilicasanpietro.va/en/faq/is-it-possible-to-book-entrance-to-st-peter-s-basilica',
  },
  'baths-of-caracalla': {
    text: 'A large Roman imperial bath complex open as an archaeological site.',
    sourceUrl: 'https://cultura.gov.it/luogo/terme-di-caracalla',
  },
  'trevi-fountain': {
    text: "Rome's monumental Baroque fountain.",
    sourceUrl:
      'https://www.comune.roma.it/web/it/notizia/biglietto-dingresso-fontana-di-trevi.page',
  },
  'vatican-museums-sistine-chapel': {
    text: 'The Vatican art collections, including the Sistine Chapel.',
    sourceUrl: 'https://www.museivaticani.va/content/museivaticani/en.html',
  },
  pantheon: {
    text: 'A preserved ancient Roman monument.',
    sourceUrl: 'https://direzionemuseiroma.cultura.gov.it/en/pantheon/',
  },
  'castel-sant-angelo': {
    text: 'A historic fortress and national museum beside the River Tiber.',
    sourceUrl:
      'https://direzionemuseiroma.cultura.gov.it/en/museo-nazionale-di-castel-santangelo/',
  },
}

export function romeAttractionOverview(attractionId?: string) {
  return attractionId ? overviews[attractionId] : undefined
}
