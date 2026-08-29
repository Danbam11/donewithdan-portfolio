import { Toolstrip as PassiveToolstrip } from '~/components/toolstrip/toolstrip';
import { Toolstrip as DesktopToolstrip } from '~/components/toolstrip/variant-c/toolstrip-variant-c';
import { useEffect, useState } from 'react';
import { HeroRuntimeSpike } from '../hero-spike/hero-spike';
import {
  MobileHero,
  mobileHeroGeometry,
  mobileHeroVariants,
} from '../mobile-hero/mobile-hero';
import { TabletHero } from '../tablet-hero/tablet-hero';
import styles from './hero-toolstrip-integration.module.css';

const reviewViewports = {
  desktop1440: {
    name: 'Desktop 1440 × 1000',
    styles: { width: '1440px', height: '1000px' },
    type: 'desktop',
  },
  desktop1920: {
    name: 'Desktop 1920 × 1000',
    styles: { width: '1920px', height: '1000px' },
    type: 'desktop',
  },
  tablet834: {
    name: 'Tablet 834 × 1112',
    styles: { width: '834px', height: '1112px' },
    type: 'tablet',
  },
  mobile320: {
    name: 'Mobile 320 × 693',
    styles: { width: '320px', height: '693px' },
    type: 'mobile',
  },
  mobile390: {
    name: 'Mobile 390 × 844',
    styles: { width: '390px', height: '844px' },
    type: 'mobile',
  },
  mobile414: {
    name: 'Mobile 414 × 896',
    styles: { width: '414px', height: '896px' },
    type: 'mobile',
  },
};

function useViewportWidth() {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? mobileHeroGeometry.master.width : window.innerWidth
  );

  useEffect(() => {
    const updateWidth = () => setWidth(window.innerWidth);

    window.addEventListener('resize', updateWidth);
    updateWidth();

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return width;
}

function ToolstripAtmosphere({ children }) {
  return <div className={styles.toolstripAtmosphere}>{children}</div>;
}

function HeroToolstripIntegration({ children, mode, toolstrip }) {
  return (
    <main className={`${styles.integration} ${styles[`${mode}Integration`]}`}>
      {children}
      <div className={styles.toolstripContinuation}>{toolstrip}</div>
    </main>
  );
}

function DesktopIntegration() {
  return (
    <HeroToolstripIntegration
      mode="desktop"
      toolstrip={
        <div className={`${styles.toolstripSlot} ${styles.desktopToolstripSlot}`}>
          <ToolstripAtmosphere>
            <DesktopToolstrip glowVariant="react-bits" />
          </ToolstripAtmosphere>
        </div>
      }
    >
      <HeroRuntimeSpike autoRotate fullView initialEntrance wireframePreview={false} />
    </HeroToolstripIntegration>
  );
}

function TabletIntegration() {
  return (
    <HeroToolstripIntegration
      mode="tablet"
      toolstrip={
        <div className={`${styles.toolstripSlot} ${styles.tabletToolstripSlot}`}>
          <ToolstripAtmosphere>
            <PassiveToolstrip interactive={false} />
          </ToolstripAtmosphere>
        </div>
      }
    >
      <TabletHero autoRotate initialEntrance liveBlob />
    </HeroToolstripIntegration>
  );
}

function MobileIntegration() {
  const viewportWidth = useViewportWidth();
  const approvedVariant = mobileHeroVariants[viewportWidth];
  const scale = approvedVariant?.scale ?? viewportWidth / mobileHeroGeometry.master.width;
  const height = approvedVariant?.height ?? mobileHeroGeometry.master.height * scale;

  return (
    <HeroToolstripIntegration
      mode="mobile"
      toolstrip={
        <div className={`${styles.toolstripSlot} ${styles.mobileToolstripSlot}`}>
          <ToolstripAtmosphere>
            <PassiveToolstrip interactive={false} />
          </ToolstripAtmosphere>
        </div>
      }
    >
      <MobileHero
        autoRotate
        height={height}
        initialEntrance
        liveBlob
        scale={scale}
        width={viewportWidth}
      />
    </HeroToolstripIntegration>
  );
}

const viewportParameters = defaultViewport => ({
  viewport: {
    defaultViewport,
    viewports: reviewViewports,
  },
});

export default {
  title: 'Home/Hero + Toolstrip Integration',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Desktop1440 = () => <DesktopIntegration />;
Desktop1440.storyName = 'Desktop — 1440';
Desktop1440.parameters = viewportParameters('desktop1440');

export const Desktop1920 = () => <DesktopIntegration />;
Desktop1920.storyName = 'Desktop — 1920';
Desktop1920.parameters = viewportParameters('desktop1920');

export const Tablet834 = () => <TabletIntegration />;
Tablet834.storyName = 'Tablet — 834';
Tablet834.parameters = viewportParameters('tablet834');

export const Mobile390Master = () => <MobileIntegration />;
Mobile390Master.storyName = 'Mobile — 390 MASTER';
Mobile390Master.parameters = viewportParameters('mobile390');

export const Mobile320 = () => <MobileIntegration />;
Mobile320.storyName = 'Mobile — 320';
Mobile320.parameters = viewportParameters('mobile320');

export const Mobile414 = () => <MobileIntegration />;
Mobile414.storyName = 'Mobile — 414';
Mobile414.parameters = viewportParameters('mobile414');
