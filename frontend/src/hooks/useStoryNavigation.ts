import { useState, useCallback, useRef } from 'react';

const SWIPE_THRESHOLD = 50;

export function useStoryNavigation(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  const next = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const previous = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) setCurrentStep(index);
  }, [totalSteps]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    const delta = pointerStartX.current - e.clientX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta > 0 ? next() : previous();
    }
    pointerStartX.current = null;
  }, [next, previous]);

  return {
    currentStep,
    isFirst: currentStep === 0,
    isLast: currentStep === totalSteps - 1,
    next,
    previous,
    goTo,
    swipeHandlers: { onPointerDown, onPointerUp },
  };
}
