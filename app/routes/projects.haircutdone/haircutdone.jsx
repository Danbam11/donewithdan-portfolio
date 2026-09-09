import { useEffect } from 'react';
import archivoBlack from '~/assets/fonts/Archivo_Black/ArchivoBlack-Regular.ttf';
import interTightBlack from '~/assets/fonts/Inter_Tight/static/InterTight-Black.ttf';
import interTightRegular from '~/assets/fonts/Inter_Tight/static/InterTight-Regular.ttf';
import { baseMeta } from '~/utils/meta';
import { HaircutDoneResponsiveView } from './responsive-view';
import styles from './route-shell.module.css';

export const links = () =>
  [archivoBlack, interTightRegular, interTightBlack].map(href => ({
    rel: 'preload',
    href,
    as: 'font',
    type: 'font/ttf',
    crossOrigin: '',
  }));

export const meta = () =>
  baseMeta({
    title: 'HaircutDone',
    prefix: 'Projects',
    description: 'From haircut quiz to follow-up, the full customer journey—DONE.',
  });

export function HaircutDone() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.route}>
      <HaircutDoneResponsiveView backHref="/" />
    </div>
  );
}
