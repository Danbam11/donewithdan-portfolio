import { HaircutDoneFooterRest } from './footer-rest';
import { HaircutDoneHeadlinerGridScroll } from './headliner-grid-scroll';
import { HaircutDoneLoomWalkthroughRest } from './loom-walkthrough-rest';
import styles from './full-desktop-scroll.module.css';

export function HaircutDoneFullDesktopScroll() {
  return (
    <div className={styles.page}>
      <div className={styles.foreground}>
        <HaircutDoneHeadlinerGridScroll />
        <HaircutDoneLoomWalkthroughRest live animated />
      </div>

      <div className={styles.footerReveal}>
        <div className={styles.footerSticky}>
          <HaircutDoneFooterRest />
        </div>
      </div>
    </div>
  );
}
