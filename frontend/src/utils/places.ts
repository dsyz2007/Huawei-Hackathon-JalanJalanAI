import type { Language } from '../types';

interface Place {
  canonical: string; // English query sent to the backend (OneMap geocodes this)
  zh?: string;       // Chinese display name
}

const PLACES: Place[] = [
  { canonical: 'Bedok MRT', zh: '勿洛地铁站' },
  { canonical: 'Tampines MRT', zh: '淡滨尼地铁站' },
  { canonical: 'Ang Mo Kio MRT', zh: '宏茂桥地铁站' },
  { canonical: 'Jurong East MRT', zh: '裕廊东地铁站' },
  { canonical: 'Orchard MRT', zh: '乌节地铁站' },
  { canonical: 'Bishan MRT', zh: '碧山地铁站' },
  { canonical: 'Woodlands MRT', zh: '兀兰地铁站' },
  { canonical: 'Bedok Interchange', zh: '勿洛巴士转换站' },
  { canonical: 'Tampines Mall', zh: '淡滨尼广场' },
  { canonical: 'AMK Hub', zh: '宏茂桥中心' },
  { canonical: 'ION Orchard', zh: 'ION Orchard' },
  { canonical: 'VivoCity', zh: '怡丰城' },
  { canonical: 'Changi Airport', zh: '樟宜机场' },
  { canonical: 'Jurong Point', zh: '裕廊坊' },
  { canonical: 'Bugis Junction', zh: '白沙浮商业城' },
  { canonical: 'Toa Payoh HDB Hub', zh: '大巴窑中心' },
  { canonical: 'Singapore General Hospital', zh: '新加坡中央医院' },
  { canonical: 'Marina Bay Sands', zh: '滨海湾金沙' },
];

// Chinese-family languages display hanzi; others use the romanized name
// (which is how these places are actually written in Malay/Tamil/etc.).
const CHINESE_LANGS: Language[] = ['chinese', 'cantonese', 'teochew', 'hokkien'];

export function localizedPlaces(language: Language): { value: string; canonical: string }[] {
  const useZh = CHINESE_LANGS.includes(language);
  return PLACES.map((p) => ({ value: useZh && p.zh ? p.zh : p.canonical, canonical: p.canonical }));
}

// Map a (possibly translated) place name back to its English query for the backend.
export function resolvePlace(input: string): string {
  const trimmed = input.trim();
  const hit = PLACES.find((p) => p.canonical === trimmed || p.zh === trimmed);
  return hit ? hit.canonical : trimmed;
}
