import styles from './footer-rest.module.css';

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/DonewithDan',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/donewithdan/',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/donewithdan11/',
  },
];

export function HaircutDoneFooterRest() {
  return (
    <footer className={styles.footer}>
      <div className={styles.background} aria-hidden="true" />

      <nav className={styles.socials} aria-label="Social links">
        {socialLinks.map(link => (
          <a
            className={styles.socialLink}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            key={link.label}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <p className={styles.copyright}>© DonewithDan. Designed &amp; built by Daniel.</p>
      <div className={styles.done} aria-hidden="true">
        DONE
      </div>
    </footer>
  );
}
