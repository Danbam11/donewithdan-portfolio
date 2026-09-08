import { HaircutDoneHeadlinerGridScroll } from './headliner-grid-scroll';
import { HaircutDoneLoomWalkthroughRest } from './loom-walkthrough-rest';
import styles from './grid-to-loom-scroll.module.css';

export function HaircutDoneGridToLoomScroll() {
  return (
    <div className={styles.page}>
      <HaircutDoneHeadlinerGridScroll />
      <HaircutDoneLoomWalkthroughRest live animated />
    </div>
  );
}
