import { useEffect, useState } from 'react';
import { HeroRuntimeSpike } from '../hero-spike/hero-spike';
import { MobileHero, mobileHeroGeometry } from '../mobile-hero/mobile-hero';
import { TabletHero } from '../tablet-hero/tablet-hero';
import styles from './responsive-hero.module.css';

const mobileMaxWidth = 696;
const tabletMaxWidth = 1040;

function getViewportState() {
  if (typeof window === 'undefined') {
    return { mode: 'desktop', width: 1440 };
  }

  const width = window.innerWidth;

  if (width <= mobileMaxWidth) return { mode: 'mobile', width };
  if (width <= tabletMaxWidth) return { mode: 'tablet', width };
  return { mode: 'desktop', width };
}

function ResponsiveHeroReview() {
  const [viewport, setViewport] = useState(getViewportState);

  useEffect(() => {
    const updateViewport = () => setViewport(getViewportState());

    window.addEventListener('resize', updateViewport);
    updateViewport();

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  let hero;

  if (viewport.mode === 'mobile') {
    const scale = viewport.width / mobileHeroGeometry.master.width;

    hero = (
      <MobileHero
        autoRotate
        height={mobileHeroGeometry.master.height * scale}
        initialEntrance
        liveBlob
        scale={scale}
        width={viewport.width}
      />
    );
  } else if (viewport.mode === 'tablet') {
    hero = <TabletHero autoRotate initialEntrance liveBlob />;
  } else {
    hero = (
      <HeroRuntimeSpike autoRotate fullView initialEntrance wireframePreview={false} />
    );
  }

  return (
    <div
      className={styles.review}
      data-responsive-hero-mode={viewport.mode}
      key={viewport.mode}
    >
      {hero}
    </div>
  );
}

export default {
  title: 'Home/Hero Responsive Integration',
  parameters: {
    layout: 'fullscreen',
  },
};

export const ResponsiveFinal = () => <ResponsiveHeroReview />;
ResponsiveFinal.storyName = 'Hero — Responsive Final';
