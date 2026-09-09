import backBrushSource from '~/assets/case-study/inkbrush-back-navigation.svg?raw';
import styles from './mobile-back-control.module.css';

const backBrush = backBrushSource
  .replace(/viewBox="[^"]*"/, 'viewBox="18.307953 89.204919 173.149988 98.770081"')
  .replace('aria-label="A back navigation"', 'aria-hidden="true"');

export function HaircutDoneMobileBackControl({ href }) {
  const artwork = (
    <span
      className={styles.backBrush}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: backBrush }}
    />
  );

  if (href) {
    return (
      <a
        className={styles.backControl}
        data-mobile-element="back-control"
        href={href}
        aria-label="Back to DonewithDan"
      >
        {artwork}
      </a>
    );
  }

  return (
    <button
      className={styles.backControl}
      data-mobile-element="back-control"
      type="button"
      aria-label="Back navigation unavailable in this static reference"
      aria-disabled="true"
    >
      {artwork}
    </button>
  );
}
