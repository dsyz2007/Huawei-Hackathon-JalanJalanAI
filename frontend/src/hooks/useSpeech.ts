import { useState, useCallback, useRef } from 'react';
import type { Language } from '../types';

const LANG_BCP47: Record<Language, string[]> = {
  english:  ['en-SG', 'en-GB', 'en-US'],
  singlish: ['en-SG', 'en-GB', 'en-US'],
  cantonese: ['zh-HK', 'zh-TW'],
  teochew:  ['zh-TW', 'zh-CN'],
  hokkien:  ['nan', 'zh-TW'],
  chinese:  ['zh-CN', 'zh-TW'],
  malay:    ['ms-MY', 'ms-SG', 'ms', 'id-ID', 'id'],
  tamil:    ['ta-SG', 'ta-IN', 'ta'],
  hindi:    ['hi-IN', 'hi'],
};

const VOICE_NAME_HINTS: Partial<Record<Language, string[]>> = {
  malay: ['amira', 'damayanti', 'malay', 'melayu'],
};

const LANG_RATE: Partial<Record<Language, number>> = {
  malay:    0.78,
  tamil:    0.80,
  hindi:    0.82,
  cantonese: 0.82,
  teochew:  0.82,
  hokkien:  0.82,
};

const COMMA_PAUSE_MS = 200;
const SENTENCE_PAUSE_MS = 450;
// Chrome silently stops speechSynthesis after ~15s; pause/resume every 10s keeps it alive
const CHROME_KEEPALIVE_MS = 10_000;

function splitSegments(text: string): Array<{ content: string; pauseAfter: number }> {
  const parts = text.split(/([,，.。!！?？;；]+)/);
  const segments: Array<{ content: string; pauseAfter: number }> = [];

  for (let i = 0; i < parts.length; i += 2) {
    const content = parts[i].trim();
    const punct = parts[i + 1] ?? '';
    if (!content) continue;
    const isComma = /^[,，;；]+$/.test(punct);
    segments.push({
      content: content + punct,
      pauseAfter: punct ? (isComma ? COMMA_PAUSE_MS : SENTENCE_PAUSE_MS) : 0,
    });
  }

  return segments.length > 0 ? segments : [{ content: text, pauseAfter: 0 }];
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      resolve(window.speechSynthesis.getVoices());
    }, { once: true });
  });
}

function getBestVoice(candidates: string[], voices: SpeechSynthesisVoice[], nameHints?: string[]): SpeechSynthesisVoice | null {
  if (nameHints) {
    for (const hint of nameHints) {
      const match = voices.find(v => v.name.toLowerCase().includes(hint));
      if (match) return match;
    }
  }
  for (const bcp47 of candidates) {
    const lang = bcp47.toLowerCase();
    const baseLang = lang.split('-')[0];
    const match =
      voices.find(v => v.lang.toLowerCase() === lang) ??
      voices.find(v => v.lang.toLowerCase().startsWith(baseLang));
    if (match) return match;
  }
  return null;
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const cancelledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (keepaliveRef.current) { clearInterval(keepaliveRef.current); keepaliveRef.current = null; }
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const speak = useCallback(async (text: string, language: Language = 'english') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (keepaliveRef.current) { clearInterval(keepaliveRef.current); keepaliveRef.current = null; }

    const candidates = LANG_BCP47[language];
    const segments = splitSegments(text);
    cancelledRef.current = false;
    setSpeaking(true);
    setPaused(false);

    // Wait for the browser to load voices before speaking — critical for non-English on Chrome
    const voices = await waitForVoices();
    if (cancelledRef.current) return;

    const voice = getBestVoice(candidates, voices, VOICE_NAME_HINTS[language]);
    setVoiceUnavailable(voice === null);

    // Keepalive: prevents Chrome from cutting off speech after ~15 seconds
    keepaliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, CHROME_KEEPALIVE_MS);

    let index = 0;

    function speakNext() {
      if (cancelledRef.current || index >= segments.length) {
        if (!cancelledRef.current) {
          if (keepaliveRef.current) { clearInterval(keepaliveRef.current); keepaliveRef.current = null; }
          setSpeaking(false);
          setPaused(false);
        }
        return;
      }

      const { content, pauseAfter } = segments[index++];
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = candidates[0];
      if (voice) utterance.voice = voice;
      utterance.rate = LANG_RATE[language] ?? 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      utterance.onend = () => {
        if (cancelledRef.current) return;
        if (pauseAfter > 0) {
          timerRef.current = setTimeout(speakNext, pauseAfter);
        } else {
          speakNext();
        }
      };

      utterance.onerror = (e) => {
        // 'interrupted' and 'canceled' are expected when stop() is called — not real errors
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        if (keepaliveRef.current) { clearInterval(keepaliveRef.current); keepaliveRef.current = null; }
        setSpeaking(false);
        setPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    }

    speakNext();
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    }
  }, []);

  return { speaking, paused, voiceUnavailable, speak, pause, resume, stop };
}
