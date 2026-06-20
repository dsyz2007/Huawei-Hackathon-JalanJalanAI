import { api } from './api';
import { translations } from '../i18n';
import type { RouteResponse, Language } from '../types';

export type DemoRouteId = 'A' | 'B' | 'C';

export const DEMO_ROUTES: Record<DemoRouteId, { label: string; origin: string; destination: string }> = {
  A: { label: 'Bedok MRT → Bedok Interchange', origin: 'Bedok MRT', destination: 'Bedok Interchange' },
  B: { label: 'Tampines MRT → Tampines Mall', origin: 'Tampines MRT', destination: 'Tampines Mall' },
  C: { label: 'Ang Mo Kio MRT → AMK Hub', origin: 'Ang Mo Kio MRT', destination: 'AMK Hub' },
};

type Instructions = { text: string; audioText: string };
type RouteInstructions = Record<DemoRouteId, Instructions[]>;

const INSTRUCTIONS: Record<Language, RouteInstructions> = {
  en: {
    A: [
      { text: 'Exit through Exit B. Look for the blue MRT sign above you.', audioText: 'Exit through Exit B. Look for the blue sign above you.' },
      { text: 'Walk until you see the yellow POSB ATM. Turn left there.', audioText: 'Walk to the yellow ATM. Turn left there.' },
      { text: 'Cross the road at the traffic light. The red bus stop is on the other side.', audioText: 'Cross at the traffic light. The bus stop is on the other side.' },
      { text: 'You have arrived at Bedok Interchange!', audioText: 'You have arrived at Bedok Interchange!' },
    ],
    B: [
      { text: 'Exit through Exit A. Look for the green MRT sign above you.', audioText: 'Exit through Exit A.' },
      { text: 'Walk straight. You will pass a red post box on your right.', audioText: 'Walk straight. Pass the red post box on your right.' },
      { text: 'You have arrived at Tampines Mall. Enter through the big glass doors.', audioText: 'You have arrived at Tampines Mall!' },
    ],
    C: [
      { text: 'Exit through Exit C. Look for the orange sign above you.', audioText: 'Exit through Exit C.' },
      { text: 'Walk past the Kopitiam coffee shop and turn right.', audioText: 'Pass the coffee shop and turn right.' },
      { text: 'You have arrived at AMK Hub!', audioText: 'You have arrived at AMK Hub!' },
    ],
  },
  singlish: {
    A: [
      { text: 'Go out Exit B lah. Got blue MRT sign up there one, cannot miss.', audioText: 'Go out Exit B. Blue sign up there one.' },
      { text: 'Walk walk until you see yellow POSB ATM on the corner. Turn left there lah.', audioText: 'Walk to yellow ATM. Turn left there lah.' },
      { text: 'Cross at the traffic light lah. Red bus stop on the other side one.', audioText: 'Cross at the traffic light. Bus stop on the other side.' },
      { text: 'Reached liao! Bedok Interchange!', audioText: 'Reached liao! Bedok Interchange!' },
    ],
    B: [
      { text: 'Go out Exit A lor. Got green MRT sign up there.', audioText: 'Go out Exit A lor.' },
      { text: 'Walk straight lah. Got red post box on your right side one.', audioText: 'Walk straight. Red post box on your right.' },
      { text: 'Reached liao! Tampines Mall! Go in through the big glass door lah.', audioText: 'Reached Tampines Mall!' },
    ],
    C: [
      { text: 'Go out Exit C lah. Got orange sign up there, cannot miss one.', audioText: 'Go out Exit C lah.' },
      { text: 'Walk past the Kopitiam kopi shop then turn right lah.', audioText: 'Pass the kopi shop, turn right lah.' },
      { text: 'Reached liao! AMK Hub!', audioText: 'Reached AMK Hub!' },
    ],
  },
  yue: {
    A: [
      { text: '由B出口出去。搵頭頂嗰個藍色地鐵標誌。', audioText: '由B出口出去。搵藍色地鐵標誌。' },
      { text: '行到見到黃色POSB提款機。喺嗰度向左轉。', audioText: '行到黃色提款機，向左轉。' },
      { text: '喺交通燈過馬路。對面有個紅色巴士站。', audioText: '喺交通燈過馬路。巴士站喺對面。' },
      { text: '到咗喇！勿洛轉車站！', audioText: '到咗喇！勿洛轉車站！' },
    ],
    B: [
      { text: '由A出口出去。搵頭頂嗰個綠色地鐵標誌。', audioText: '由A出口出去。' },
      { text: '行直。右邊會見到紅色郵箱。', audioText: '行直。右邊有紅色郵箱。' },
      { text: '到咗喇！淡濱尼商場！由大玻璃門入去。', audioText: '到咗淡濱尼商場！' },
    ],
    C: [
      { text: '由C出口出去。搵頭頂嗰個橙色標誌。', audioText: '由C出口出去。' },
      { text: '行過Kopitiam咖啡店之後向右轉。', audioText: '過咖啡店之後向右轉。' },
      { text: '到咗喇！宏茂橋購物中心！', audioText: '到咗宏茂橋購物中心！' },
    ],
  },
  teo: {
    A: [
      { text: '從B出口行出去。搵頭頂彼个藍色地鐵標誌。', audioText: '從B出口行出去。搵藍色標誌。' },
      { text: '行到看著黃色POSB提款機。佇彼拐倒爿。', audioText: '行到黃色提款機，拐倒爿。' },
      { text: '佇交通燈過馬路。紅色巴士站佇對面。', audioText: '佇交通燈過馬路。巴士站佇對面。' },
      { text: '到咯！勿洛轉車站！', audioText: '到咯！勿洛轉車站！' },
    ],
    B: [
      { text: '從A出口行出去。搵頭頂彼个綠色地鐵標誌。', audioText: '從A出口行出去。' },
      { text: '行直去。正爿會看著紅色郵箱。', audioText: '行直去。正爿有紅色郵箱。' },
      { text: '到咯！淡濱尼商場！從大玻璃門行入去。', audioText: '到咯！淡濱尼商場！' },
    ],
    C: [
      { text: '從C出口行出去。搵頭頂彼个橙色標誌。', audioText: '從C出口行出去。' },
      { text: '行過Kopitiam咖啡店了後拐正爿。', audioText: '過咖啡店了後拐正爿。' },
      { text: '到咯！宏茂橋購物中心！', audioText: '到咯！宏茂橋購物中心！' },
    ],
  },
  zh: {
    A: [
      { text: '从B出口出去。找头顶的蓝色地铁标志。', audioText: '从B出口出去。找蓝色地铁标志。' },
      { text: '走到看见黄色POSB ATM机。在那里向左转。', audioText: '走到黄色ATM机，向左转。' },
      { text: '在红绿灯处过马路。红色公交车站在对面。', audioText: '在红绿灯过马路。公交站在对面。' },
      { text: '您已到达勿洛转换站！', audioText: '您已到达勿洛转换站！' },
    ],
    B: [
      { text: '从A出口出去。找头顶的绿色地铁标志。', audioText: '从A出口出去。' },
      { text: '直走。右边会看到红色邮箱。', audioText: '直走。右边有红色邮箱。' },
      { text: '您已到达淡滨尼购物中心！从大玻璃门进去。', audioText: '您已到达淡滨尼购物中心！' },
    ],
    C: [
      { text: '从C出口出去。找头顶的橙色标志。', audioText: '从C出口出去。' },
      { text: '走过Kopitiam咖啡店后向右转。', audioText: '过咖啡店后向右转。' },
      { text: '您已到达宏茂桥购物中心！', audioText: '您已到达宏茂桥购物中心！' },
    ],
  },
  ms: {
    A: [
      { text: 'Keluar melalui Pintu Keluar B. Cari papan tanda MRT biru di atas.', audioText: 'Keluar melalui Pintu Keluar B. Cari tanda biru di atas.' },
      { text: 'Jalan sehingga nampak ATM POSB kuning. Belok kiri di sana.', audioText: 'Jalan ke ATM kuning. Belok kiri di sana.' },
      { text: 'Seberangi jalan di lampu isyarat. Hentian bas merah ada di seberang.', audioText: 'Seberangi jalan di lampu isyarat. Hentian bas di seberang.' },
      { text: 'Anda telah tiba di Pusat Pertukaran Bedok!', audioText: 'Anda telah tiba di Pusat Pertukaran Bedok!' },
    ],
    B: [
      { text: 'Keluar melalui Pintu Keluar A. Cari papan tanda MRT hijau di atas.', audioText: 'Keluar melalui Pintu Keluar A.' },
      { text: 'Jalan terus. Anda akan lalu kotak pos merah di sebelah kanan.', audioText: 'Jalan terus. Kotak pos merah di kanan.' },
      { text: 'Anda telah tiba di Pusat Membeli-belah Tampines! Masuk melalui pintu kaca besar.', audioText: 'Anda telah tiba di Tampines Mall!' },
    ],
    C: [
      { text: 'Keluar melalui Pintu Keluar C. Cari papan tanda oren di atas.', audioText: 'Keluar melalui Pintu Keluar C.' },
      { text: 'Jalan lepas kedai kopi Kopitiam dan belok kanan.', audioText: 'Lepas kedai kopi, belok kanan.' },
      { text: 'Anda telah tiba di AMK Hub!', audioText: 'Anda telah tiba di AMK Hub!' },
    ],
  },
  ta: {
    A: [
      { text: 'B வெளியேற்று வழியாக வெளியேறுங்கள். மேலே நீல MRT அடையாளத்தை தேடுங்கள்.', audioText: 'B வழியாக வெளியேறுங்கள். நீல அடையாளம் தேடுங்கள்.' },
      { text: 'மஞ்சள் POSB ATM தெரியும் வரை நடங்கள். அங்கே இடது திரும்புங்கள்.', audioText: 'மஞ்சள் ATM வரை நடங்கள். இடது திரும்புங்கள்.' },
      { text: 'போக்குவரத்து விளக்கில் சாலை கடங்கள். சிவப்பு பேருந்து நிறுத்தம் மறுபுறம் உள்ளது.', audioText: 'போக்குவரத்து விளக்கில் சாலை கடங்கள்.' },
      { text: 'நீங்கள் பேடோக் இடைமாற்றை அடைந்துவிட்டீர்கள்!', audioText: 'நீங்கள் பேடோக் இடைமாற்றை அடைந்துவிட்டீர்கள்!' },
    ],
    B: [
      { text: 'A வெளியேற்று வழியாக வெளியேறுங்கள். மேலே பச்சை MRT அடையாளத்தை தேடுங்கள்.', audioText: 'A வழியாக வெளியேறுங்கள்.' },
      { text: 'நேராக நடங்கள். வலது பக்கத்தில் சிவப்பு தபால் பெட்டி தெரியும்.', audioText: 'நேராக நடங்கள். சிவப்பு தபால் பெட்டி வலதில்.' },
      { text: 'நீங்கள் தம்பினேஸ் மாலை அடைந்துவிட்டீர்கள்! பெரிய கண்ணாடி கதவுகள் வழியாக உள்ளே நுழையுங்கள்.', audioText: 'நீங்கள் தம்பினேஸ் மாலை அடைந்துவிட்டீர்கள்!' },
    ],
    C: [
      { text: 'C வெளியேற்று வழியாக வெளியேறுங்கள். மேலே ஆரஞ்சு அடையாளத்தை தேடுங்கள்.', audioText: 'C வழியாக வெளியேறுங்கள்.' },
      { text: 'Kopitiam காபி கடையை கடந்து வலது திரும்புங்கள்.', audioText: 'காபி கடை கடந்து வலது திரும்புங்கள்.' },
      { text: 'நீங்கள் AMK Hub ஐ அடைந்துவிட்டீர்கள்!', audioText: 'நீங்கள் AMK Hub ஐ அடைந்துவிட்டீர்கள்!' },
    ],
  },
  hi: {
    A: [
      { text: 'निकास B से बाहर निकलें। ऊपर नीले MRT संकेत को देखें।', audioText: 'निकास B से निकलें। नीला संकेत देखें।' },
      { text: 'पीले POSB ATM तक चलें। वहाँ बाएं मुड़ें।', audioText: 'पीले ATM तक चलें। बाएं मुड़ें।' },
      { text: 'ट्रैफिक लाइट पर सड़क पार करें। लाल बस स्टॉप दूसरी तरफ है।', audioText: 'ट्रैफिक लाइट पर सड़क पार करें।' },
      { text: 'आप बेडोक इंटरचेंज पहुंच गए!', audioText: 'आप बेडोक इंटरचेंज पहुंच गए!' },
    ],
    B: [
      { text: 'निकास A से बाहर निकलें। ऊपर हरे MRT संकेत को देखें।', audioText: 'निकास A से निकलें।' },
      { text: 'सीधे चलें। दाईं तरफ लाल पोस्ट बॉक्स दिखेगा।', audioText: 'सीधे चलें। दाईं तरफ लाल पोस्ट बॉक्स।' },
      { text: 'आप टैम्पाइन्स मॉल पहुंच गए! बड़े शीशे के दरवाजों से अंदर जाएं।', audioText: 'आप टैम्पाइन्स मॉल पहुंच गए!' },
    ],
    C: [
      { text: 'निकास C से बाहर निकलें। ऊपर नारंगी संकेत को देखें।', audioText: 'निकास C से निकलें।' },
      { text: 'Kopitiam कॉफी शॉप के पास से गुजरें और दाईं ओर मुड़ें।', audioText: 'कॉफी शॉप के पास से दाईं ओर मुड़ें।' },
      { text: 'आप AMK Hub पहुंच गए!', audioText: 'आप AMK Hub पहुंच गए!' },
    ],
  },
};

const LANDMARK_KEYS: Record<DemoRouteId, string[]> = {
  A: ['bedokMrtExitB', 'posbAtm', 'redBusStop', 'bedokInterchange'],
  B: ['tampinesMrtExitA', 'tampinesPostOffice', 'tampinesMallEntrance'],
  C: ['angMoKioMrtExitC', 'kopitiamCoffeeShop', 'amkHubEntrance'],
};

const BASE_ROUTES: Record<DemoRouteId, Omit<RouteResponse, 'steps'> & { steps: Omit<RouteResponse['steps'][number], 'instruction'>[] }> = {
  A: {
    routeId: 'demo-A',
    distance: '650m',
    duration: '8 mins',
    steps: [
      { step: 1, checkpoint: { id: 'A1', action: 'exit_mrt', lat: 1.3236, lng: 103.9300, distance: 0 }, landmark: { name: '', description: '' } },
      { step: 2, checkpoint: { id: 'A2', action: 'turn_left', lat: 1.3240, lng: 103.9305, distance: 80 }, landmark: { name: '', description: '' } },
      { step: 3, checkpoint: { id: 'A3', action: 'cross_road', lat: 1.3245, lng: 103.9310, distance: 200 }, landmark: { name: '', description: '' } },
      { step: 4, checkpoint: { id: 'A4', action: 'arrive', lat: 1.3250, lng: 103.9315, distance: 400 }, landmark: { name: '', description: '' } },
    ],
  },
  B: {
    routeId: 'demo-B',
    distance: '400m',
    duration: '5 mins',
    steps: [
      { step: 1, checkpoint: { id: 'B1', action: 'exit_mrt', lat: 1.3527, lng: 103.9451, distance: 0 }, landmark: { name: '', description: '' } },
      { step: 2, checkpoint: { id: 'B2', action: 'go_straight', lat: 1.3530, lng: 103.9455, distance: 100 }, landmark: { name: '', description: '' } },
      { step: 3, checkpoint: { id: 'B3', action: 'arrive', lat: 1.3533, lng: 103.9458, distance: 250 }, landmark: { name: '', description: '' } },
    ],
  },
  C: {
    routeId: 'demo-C',
    distance: '300m',
    duration: '4 mins',
    steps: [
      { step: 1, checkpoint: { id: 'C1', action: 'exit_mrt', lat: 1.3699, lng: 103.8492, distance: 0 }, landmark: { name: '', description: '' } },
      { step: 2, checkpoint: { id: 'C2', action: 'turn_right', lat: 1.3702, lng: 103.8495, distance: 80 }, landmark: { name: '', description: '' } },
      { step: 3, checkpoint: { id: 'C3', action: 'arrive', lat: 1.3705, lng: 103.8498, distance: 200 }, landmark: { name: '', description: '' } },
    ],
  },
};

function buildRoute(id: DemoRouteId, language: Language): RouteResponse {
  const base = BASE_ROUTES[id];
  const instructions = INSTRUCTIONS[language][id];
  const landmarkKeys = LANDMARK_KEYS[id];
  const landmarkTranslations = translations[language].landmarks;
  return {
    ...base,
    steps: base.steps.map((step, i) => ({
      ...step,
      landmark: step.landmark
        ? { ...step.landmark, ...landmarkTranslations[landmarkKeys[i]] }
        : step.landmark,
      instruction: {
        text: instructions[i].text,
        audioText: instructions[i].audioText,
        language,
      },
    })),
  };
}

export async function getDemoRoute(id: DemoRouteId, language: Language): Promise<RouteResponse> {
  try {
    const { data } = await api.post<RouteResponse>('/demo-route', { id, language });
    return data;
  } catch {
    return buildRoute(id, language);
  }
}
