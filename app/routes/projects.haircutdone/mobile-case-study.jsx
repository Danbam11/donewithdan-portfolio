import { HaircutDoneMobileBackControl } from './mobile-back-control';
import { HaircutDoneMobileFooter } from './mobile-footer';
import { HaircutDoneMobileLoom } from './mobile-loom';
import { HaircutDoneMobileOpeningShowcase } from './mobile-opening-showcase';
import styles from './mobile-case-study.module.css';

const MASTER_WIDTH = 390;

export function HaircutDoneMobileCaseStudy({
  targetWidth = MASTER_WIDTH,
  backHref,
}) {
  const scale = targetWidth / MASTER_WIDTH;

  return (
    <div
      className={styles.page}
      data-mobile-case-study-element="page"
      data-target-width={targetWidth}
      data-scale={scale}
      style={{
        '--haircutdone-case-study-scale': scale,
        '--haircutdone-target-width': `${targetWidth}px`,
      }}
    >
      <div className={styles.foregroundSlot} data-mobile-case-study-element="foreground-slot">
        <div className={styles.foregroundScale} data-mobile-case-study-element="foreground-scale">
          <HaircutDoneMobileOpeningShowcase
            motionEnabled
            carouselEnabled
            showBackControl={false}
          />
          <HaircutDoneMobileLoom revealEnabled />
        </div>
      </div>

      <div className={styles.footerReveal} data-mobile-case-study-element="footer-reveal">
        <div className={styles.footerSticky} data-mobile-case-study-element="footer-sticky">
          <div className={styles.footerScale} data-mobile-case-study-element="footer-scale">
            <HaircutDoneMobileFooter />
          </div>
        </div>
      </div>

      <HaircutDoneMobileBackControl href={backHref} />
    </div>
  );
}
