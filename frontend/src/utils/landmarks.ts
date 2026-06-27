import type { Translations } from '../i18n';

export const LANDMARK_TO_I18N_KEY: Record<string, string> = {
  'Bedok MRT Exit B': 'bedokMrtExitB',
  'POSB ATM': 'posbAtm',
  'Red Bus Stop': 'redBusStop',
  'Bedok Interchange': 'bedokInterchange',
  'Tampines MRT Exit A': 'tampinesMrtExitA',
  'Tampines Central Post Office': 'tampinesPostOffice',
  'Tampines Mall Entrance': 'tampinesMallEntrance',
  'Ang Mo Kio MRT Exit C': 'angMoKioMrtExitC',
  'Kopitiam Coffee Shop': 'kopitiamCoffeeShop',
  'AMK Hub Entrance': 'amkHubEntrance',
};

export function getTranslatedLandmark(name: string | undefined, t: Translations) {
  if (!name) return undefined;
  const key = LANDMARK_TO_I18N_KEY[name];
  return key ? t.landmarks[key] : undefined;
}
