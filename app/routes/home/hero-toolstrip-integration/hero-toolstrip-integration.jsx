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
    <div
      className={`${styles.integration} ${styles[`${mode}Integration`]}`}
      data-hero-composition={mode}
    >
      {children}
      <div className={styles.toolstripContinuation}>{toolstrip}</div>
    </div>
  );
}

export function DesktopHeroToolstrip({ onShaderStateChange, shaderRevealed }) {
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
      <HeroRuntimeSpike
        autoRotate
        fullView
        initialEntrance
        onShaderStateChange={onShaderStateChange}
        shaderRevealed={shaderRevealed}
        wireframePreview={false}
      />
    </HeroToolstripIntegration>
  );
}

export function TabletHeroToolstrip({ onShaderStateChange, shaderRevealed }) {
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
      <TabletHero
        autoRotate
        initialEntrance
        liveBlob
        onShaderStateChange={onShaderStateChange}
        shaderRevealed={shaderRevealed}
      />
    </HeroToolstripIntegration>
  );
}

export function MobileHeroToolstrip({ onShaderStateChange, shaderRevealed }) {
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
        onShaderStateChange={onShaderStateChange}
        scale={scale}
        shaderRevealed={shaderRevealed}
        width={viewportWidth}
      />
    </HeroToolstripIntegration>
  );
}
