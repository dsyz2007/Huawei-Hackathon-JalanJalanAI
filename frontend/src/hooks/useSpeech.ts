import { useState, useCallback, useRef } from 'react';
import type { Language } from '../types';

const LANG_BCP47: Record<Language, string> = {
  en: 'en-SG',
  singlish: 'en-SG',
  yue: 'zh-HK',
  teo: 'zh-TW',
  zh: 'zh-CN',
  ms: 'ms-MY',
  ta: 'ta-IN',
  hi: 'hi-IN',
};

const COMMA_PAUSE_MS = 200;
const SENTENCE_PAUSE_MS = 450;

function splitSegments(text: string): Array<{ content: string; pauseAfter: number }> {
  const parts = text.split(/([,，.。!！?？]+)/);
  const segments: Array<{ content: string; pauseAfter: number }> = [];

  for (let i = 0; i < parts.length; i += 2) {
    const content = parts[i].trim();
    const punct = parts[i + 1] ?? '';
    if (!content) continue;
    const isComma = /^[,，]+$/.test(punct);
    segments.push({
      content: content + punct,
      pauseAfter: punct ? (isComma ? COMMA_PAUSE_MS : SENTENCE_PAUSE_MS) : 0,
    });
  }

  return segments.length > 0 ? segments : [{ content: text, pauseAfter: 0 }];
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cancelledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const speak = useCallback((text: string, language: Language = 'en') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    const bcp47 = LANG_BCP47[language];
    const segments = splitSegments(text);
    cancelledRef.current = false;
    setSpeaking(true);
    setPaused(false);

    let index = 0;

    function speakNext() {
      if (cancelledRef.current || index >= segments.length) {
        if (!cancelledRef.current) { setSpeaking(false); setPaused(false); }
        return;
      }

      const { content, pauseAfter } = segments[index++];
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = bcp47;
      utterance.rate = 0.85;
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

      utterance.onerror = () => {
        setSpeaking(false);
        setPaused(false);
      };

      utteranceRef.current = utterance;
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

  return { speaking, paused, speak, pause, resume, stop };
}
