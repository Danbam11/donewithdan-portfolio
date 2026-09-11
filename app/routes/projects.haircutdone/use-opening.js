import { useAnimationControls } from 'framer-motion';
import { useEffect, useState } from 'react';

export const openingVariants = {
  hidden: { opacity: 0, filter: 'blur(10px)', y: 12 },
  visible: (delay = 0) => ({
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function useOpening(reducedMotion) {
  const controls = useAnimationControls();
  const [animated, setAnimated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1041px) and (min-height: 780px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAnimated(desktop.matches && !motion.matches);
    update();
    desktop.addEventListener('change', update);
    motion.addEventListener('change', update);
    return () => {
      desktop.removeEventListener('change', update);
      motion.removeEventListener('change', update);
    };
  }, [reducedMotion]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (!animated) {
      controls.set('visible');
      setReady(true);
      return;
    }

    let active = true;
    let released = false;
    let watchdog;
    setReady(false);
    controls.set('hidden');

    // Keep scrollbar geometry intact: temporarily gate native input, never replace
    // document scrolling or mutate body/html overflow. Tab and links remain usable.
    const prevent = event => event.preventDefault();
    const preventKeys = event => {
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
        event.preventDefault();
      }
    };
    const keepTop = () => {
      if (window.scrollY !== 0) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    const release = () => {
      if (released) return;
      released = true;
      clearTimeout(watchdog);
      window.removeEventListener('wheel', prevent);
      window.removeEventListener('touchmove', prevent);
      window.removeEventListener('keydown', preventKeys);
      window.removeEventListener('scroll', keepTop);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    const finish = () => {
      if (!active) return;
      release();
      controls.stop();
      controls.set('visible');
      setReady(true);
    };
    const onVisibility = () => {
      if (document.hidden) finish();
    };

    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('keydown', preventKeys);
    window.addEventListener('scroll', keepTop, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    keepTop();
    // Animation completion owns normal release; the watchdog handles interruption.
    watchdog = window.setTimeout(finish, 1600);
    controls.start('visible').then(finish, finish);

    return () => {
      active = false;
      release();
      controls.stop();
    };
  }, [animated, controls]);

  return { animated, ready, controls };
}
