import styles from './mobile-footer.module.css';

export function HaircutDoneMobileFooter() {
  return (
    <footer className={styles.footer} data-mobile-footer-element="footer">
      <div
        className={styles.creamPanel}
        data-mobile-footer-element="cream-panel"
        aria-hidden="true"
      />

      <nav className={styles.socials} aria-label="HaircutDone social links">
        <a
          className={`${styles.socialLink} ${styles.facebook}`}
          data-mobile-footer-element="facebook"
          href="https://www.facebook.com/DonewithDan"
          target="_blank"
          rel="noreferrer"
        >
          Facebook
        </a>
        <a
          className={`${styles.socialLink} ${styles.linkedin}`}
          data-mobile-footer-element="linkedin"
          href="https://www.linkedin.com/in/donewithdan/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <a
          className={`${styles.socialLink} ${styles.instagram}`}
          data-mobile-footer-element="instagram"
          href="https://www.instagram.com/donewithdan11/"
          target="_blank"
          rel="noreferrer"
        >
          Instagram
        </a>
      </nav>

      <p className={styles.copyright} data-mobile-footer-element="copyright">
        © DonewithDan. Designed &amp; built by Daniel.
      </p>

      <div className={styles.done} data-mobile-footer-element="done" aria-hidden="true">
        DONE
      </div>
    </footer>
  );
}
