import { useReducedMotion } from 'framer-motion';
import { useCallback, useRef } from 'react';

export function useScrollToHash() {
  const scrollTimeout = useRef();
  const reduceMotion = useReducedMotion();

  const scrollToHash = useCallback(
    (hash, onDone) => {
      const id = hash?.replace(/^#/, '');
      const targetElement = id ? document.getElementById(id) : null;

      if (!targetElement) {
        onDone?.();
        return undefined;
      }

      let completed = false;

      const finish = () => {
        if (completed) return;

        completed = true;
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout.current);
        onDone?.();
      };

      const handleScroll = () => {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(finish, 120);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      targetElement.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });

      scrollTimeout.current = setTimeout(finish, 120);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout.current);
      };
    },
    [reduceMotion]
  );

  return scrollToHash;
}