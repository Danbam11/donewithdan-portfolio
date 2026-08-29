import { useSyncExternalStore } from 'react';
import {
  DesktopHeroToolstrip,
  MobileHeroToolstrip,
  TabletHeroToolstrip,
} from '../hero-toolstrip-integration/hero-toolstrip-integration';
import styles from './hero-section.module.css';

export const heroBreakpointQueries = {
  mobile: '(max-width: 696px)',
  tablet: '(min-width: 697px) and (max-width: 1040px)',
  desktop: '(min-width: 1041px)',
};

function getHeroBreakpoint() {
  if (typeof window === 'undefined') return null;
  if (window.matchMedia(heroBreakpointQueries.mobile).matches) return 'mobile';
  if (window.matchMedia(heroBreakpointQueries.tablet).matches) return 'tablet';
  return 'desktop';
}

function subscribeToHeroBreakpoint(onStoreChange) {
  const mediaQueries = Object.values(heroBreakpointQueries).map(query =>
    window.matchMedia(query)
  );

  mediaQueries.forEach(mediaQuery =>
    mediaQuery.addEventListener('change', onStoreChange)
  );

  return () => {
    mediaQueries.forEach(mediaQuery =>
      mediaQuery.removeEventListener('change', onStoreChange)
    );
  };
}

export function useHeroBreakpoint() {
  return useSyncExternalStore(subscribeToHeroBreakpoint, getHeroBreakpoint, () => null);
}

export function HeroSection() {
  const breakpoint = useHeroBreakpoint();
  let composition;

  if (breakpoint === 'mobile') composition = <MobileHeroToolstrip />;
  else if (breakpoint === 'tablet') composition = <TabletHeroToolstrip />;
  else if (breakpoint === 'desktop') composition = <DesktopHeroToolstrip />;
  else
    composition = (
      <div aria-hidden className={styles.pending} data-hero-section-pending />
    );

  return (
    <div className={styles.root} data-hero-section-breakpoint={breakpoint ?? 'pending'}>
      {composition}
    </div>
  );
}
