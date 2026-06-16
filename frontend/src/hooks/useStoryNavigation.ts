import { useState, useCallback, useRef } from 'react';

export function useStoryNavigation(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const next = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const previous = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) setCurrentStep(index);
  }, [totalSteps]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta > 0 ? next() : previous();
    }
    touchStartX.current = null;
  }, [next, previous]);

  return {
    currentStep,
    isFirst: currentStep === 0,
    isLast: currentStep === totalSteps - 1,
    next,
    previous,
    goTo,
    swipeHandlers: { onTouchStart, onTouchEnd },
  };
}
