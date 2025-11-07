export type LocaleKey = 'de' | 'en';

type Dictionary = Record<LocaleKey, Record<string, string>>;

const dictionary: Dictionary = {
  de: {
    heroHeadline: 'Dein Signature-Look, meisterhaft gestylt',
    heroSubline: 'SalonNova verbindet präzises Handwerk mit luxuriöser Atmosphäre – für Ergebnisse, die begeistern.',
    cta: 'Termin buchen',
    services: 'Leistungen',
    team: 'Unser Team',
    gallery: 'Impressionen',
    openingHours: 'Öffnungszeiten',
    location: 'Standort',
    bookingTitle: 'Termin buchen'
  },
  en: {
    heroHeadline: 'Your signature look, masterfully styled',
    heroSubline: 'SalonNova blends craftsmanship with a luxurious atmosphere for unforgettable results.',
    cta: 'Book appointment',
    services: 'Services',
    team: 'Our team',
    gallery: 'Gallery',
    openingHours: 'Opening hours',
    location: 'Location',
    bookingTitle: 'Book appointment'
  }
};

export const t = (key: string, locale: LocaleKey = 'de') => {
  return dictionary[locale][key] ?? dictionary.de[key] ?? key;
};
