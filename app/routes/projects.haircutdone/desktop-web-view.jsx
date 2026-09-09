import { useEffect, useLayoutEffect, useState } from 'react';
import { HaircutDoneFooterRest } from './footer-rest';
import { HaircutDoneHeadlinerGridScroll } from './headliner-grid-scroll';
import { HaircutDoneLoomWalkthroughRest } from './loom-walkthrough-rest';
import { HaircutDoneBackBrush } from './opening-rest';
import styles from './desktop-web-view.module.css';

const MASTER_WIDTH = 1440;
const MASTER_HEIGHT = 800;
const MASTER_GRID_RUNWAY = 1200;
const MASTER_CONTINUATION = 400;
const MASTER_LOOM_HEIGHT = 1000;
const MASTER_FOOTER_HEIGHT = 330;
const MASTER_FOOTER_TRACK = 660;
const WEB_CONTENT_MAX_WIDTH = 1608.8888888889;
const MAX_WEB_CONTENT_SCALE = WEB_CONTENT_MAX_WIDTH / MASTER_WIDTH;
const WIDE_BACK_INSET = {
  right: 51.8882378472,
  bottom: 63.2662037037,
};
const MASTER_BACK = {
  left: 1287.57,
  top: 688.38,
  width: 106,
  height: 60,
};

const useClientLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;

const measureDesktopMetrics = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const widthScale = viewportWidth / MASTER_WIDTH;
  const heightScale = viewportHeight / MASTER_HEIGHT;
  const fitScale = Math.min(widthScale, heightScale);
  const scale = viewportWidth < MASTER_WIDTH
    ? Math.min(1, fitScale)
    : Math.min(MAX_WEB_CONTENT_SCALE, Math.max(1, fitScale));
  const scaledWidth = MASTER_WIDTH * scale;
  const scaledMasterViewportHeight = MASTER_HEIGHT * scale;
  const viewportOffsetX = (viewportWidth - scaledWidth) / 2;
  const viewportOffsetY = (viewportHeight - scaledMasterViewportHeight) / 2;

  return {
    viewportWidth,
    viewportHeight,
    scale,
    scaledWidth,
    scaledMasterViewportHeight,
    viewportOffsetX,
    viewportOffsetY,
    stageHeight: viewportHeight + MASTER_GRID_RUNWAY * scale,
    continuationHeight: MASTER_CONTINUATION * scale,
    loomHeight: MASTER_LOOM_HEIGHT * scale,
    footerHeight: MASTER_FOOTER_HEIGHT * scale,
    footerTrackHeight: MASTER_FOOTER_TRACK * scale,
  };
};

const metricsMatch = (current, next) =>
  current &&
  Object.keys(next).every(key => Math.abs(current[key] - next[key]) < 0.001);

export function HaircutDoneDesktopWebView({ backHref }) {
  const [metrics, setMetrics] = useState(null);

  useClientLayoutEffect(() => {
    let resizeFrame;

    const updateMetrics = () => {
      const nextMetrics = measureDesktopMetrics();
      setMetrics(currentMetrics =>
        metricsMatch(currentMetrics, nextMetrics) ? currentMetrics : nextMetrics
      );
    };
    const handleResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(updateMetrics);
    };

    updateMetrics();
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!metrics) {
    return <div className={styles.shell} data-haircutdone-desktop-web="" />;
  }

  const backSize = {
    width: MASTER_BACK.width * metrics.scale,
    height: MASTER_BACK.height * metrics.scale,
  };
  const backPosition =
    metrics.viewportWidth > MASTER_WIDTH
      ? {
          right: WIDE_BACK_INSET.right,
          bottom: WIDE_BACK_INSET.bottom,
        }
      : {
          left: MASTER_BACK.left * metrics.scale,
          top: metrics.viewportOffsetY + MASTER_BACK.top * metrics.scale,
        };
  const footerMasterWidth = metrics.viewportWidth / metrics.scale;
  const scaleStyle = {
    '--haircutdone-web-scale': metrics.scale,
    transform: `scale(${metrics.scale})`,
  };

  return (
    <div className={styles.shell} data-haircutdone-desktop-web="">
      <div className={styles.foreground}>
        <HaircutDoneHeadlinerGridScroll
          webLayout={metrics}
          showFloatingBack={false}
        />

        <div
          className={styles.contentRail}
          style={{
            width: metrics.scaledWidth,
            marginInline: metrics.viewportOffsetX,
          }}
        >
          <div
            className={styles.loomShell}
            style={{
              width: metrics.scaledWidth,
              height: metrics.loomHeight,
            }}
          >
            <div className={styles.masterSurface} style={scaleStyle}>
              <HaircutDoneLoomWalkthroughRest live animated />
            </div>
          </div>
        </div>
      </div>

      <div
        className={styles.footerReveal}
        style={{
          width: metrics.viewportWidth,
          height: metrics.footerTrackHeight,
          marginTop: -metrics.footerHeight,
        }}
      >
        <div
          className={styles.footerSticky}
          style={{
            top: `calc(100vh - ${metrics.footerHeight}px)`,
            width: metrics.viewportWidth,
            height: metrics.footerHeight,
          }}
        >
          <div
            className={styles.masterSurface}
            style={{
              ...scaleStyle,
              '--haircutdone-footer-width': `${footerMasterWidth}px`,
              width: footerMasterWidth,
            }}
          >
            <HaircutDoneFooterRest />
          </div>
        </div>
      </div>

      <div
        className={styles.fixedBack}
        style={{
          '--haircutdone-web-scale': metrics.scale,
          ...backPosition,
          width: backSize.width,
          height: backSize.height,
        }}
      >
        <HaircutDoneBackBrush
          animated
          className={styles.fixedBackAnchor}
          href={backHref}
        />
      </div>
    </div>
  );
}
