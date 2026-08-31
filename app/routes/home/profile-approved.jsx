import danielPortrait from '~/assets/daniel-profile-portrait.png';
import profileCtaArrowMarkup from '~/assets/profile-cta-arrow.svg?raw';
import { DecoderText } from '~/components/decoder-text';
import styles from './profile-approved.module.css';

const Highlight = ({ children }) => (
  <span className={styles.highlight}>{children}</span>
);

export const ProfileApproved = () => (
  <section className={styles.profile} aria-labelledby="profile-approved-title">
    <div className={styles.content}>
      <div className={styles.copy}>
        <h2 id="profile-approved-title" className={styles.heading}>
          <span className={styles.headingLane}>
            <span className={styles.headingLine}>
              <DecoderText text="Ready to get things" delay={500} />
            </span>
          </span>
          <span className={styles.headingAccent}>
            <span className={styles.doneText}>DONE?</span>
            <span className={styles.revealBlock} style={{ animationName: 'reveal' }} aria-hidden="true" />
          </span>
        </h2>

        <div className={styles.body} style={{ animationName: 'fade-in' }}>
          <p>
            I build <Highlight>GoHighLevel</Highlight> systems designed to make leads, bookings,
            and follow-ups easier to manage.
          </p>
          <p>
            With <Highlight>seven</Highlight> years in customer support, I’ve seen where customer
            journeys usually break—missed leads, delayed replies, forgotten follow-ups, and too
            much manual work. I now turn those friction points into organized systems that feel
            clear, reliable, and easier to run.
          </p>
        </div>

        <a className={styles.cta} href="/contact" style={{ animationName: 'fade-in' }}>
          <span className={styles.ctaLabel}>Let’s talk!</span>
          <span
            className={styles.ctaArrow}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: profileCtaArrowMarkup }}
          />
        </a>
      </div>

      <div className={styles.visual}>
        <div className={styles.portraitFrame}>
          <img
            className={styles.portrait}
            src={danielPortrait}
            width="1122"
            height="1402"
            alt="Daniel wearing glasses and a blue shirt"
          />
          <span className={styles.revealBlock} style={{ animationName: 'reveal' }} aria-hidden="true" />
        </div>
        <div className={styles.profileWord} style={{ animationName: 'fade-in' }} aria-hidden="true">
          {'P\nR\nO\nF\nI\nL\nE'}
        </div>
      </div>
    </div>
  </section>
);

export const ProfileCopyright = () => (
  <footer className={styles.copyright}>
    <p>
      <span className={styles.copyrightText}>© DonewithDan. Designed &amp; built by Daniel.</span>
    </p>
  </footer>
);

export const ProfileApprovedComposition = ({ animationKey = 0 }) => (
  <div className={styles.composition}>
    <ProfileApproved key={animationKey} />
    <ProfileCopyright />
  </div>
);
