import { useEffect, useLayoutEffect, useState } from 'react';
import { HaircutDoneDesktopWebView } from './desktop-web-view';
import { HaircutDoneMobileCaseStudy } from './mobile-case-study';
import styles from './responsive-view.module.css';

const HAIRCUTDONE_TABLET_MAX = 1040;
const useClientLayoutEffect = typeof document === 'undefined'
  ? useEffect
  : useLayoutEffect;

function getUsableViewportWidth() {
  return document.documentElement.clientWidth;
}

export function HaircutDoneResponsiveView({ backHref }) {
  const [viewportWidth, setViewportWidth] = useState(null);

  useClientLayoutEffect(() => {
    let resizeFrame;

    const updateViewportWidth = () => {
      const nextWidth = getUsableViewportWidth();
      setViewportWidth(currentWidth => (
        currentWidth === nextWidth ? currentWidth : nextWidth
      ));
    };

    const handleResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(updateViewportWidth);
    };

    updateViewportWidth();
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (viewportWidth === null) {
    return (
      <div
        className={styles.pending}
        data-haircutdone-responsive-state="pending"
        aria-hidden="true"
      />
    );
  }

  if (viewportWidth <= HAIRCUTDONE_TABLET_MAX) {
    return (
      <HaircutDoneMobileCaseStudy
        targetWidth={viewportWidth}
        backHref={backHref}
      />
    );
  }

  return <HaircutDoneDesktopWebView backHref={backHref} />;
}
