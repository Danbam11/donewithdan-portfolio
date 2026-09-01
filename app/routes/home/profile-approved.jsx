import danielPortrait from '~/assets/daniel-profile-portrait.png';
import profileCtaArrowMarkup from '~/assets/profile-cta-arrow.svg?raw';
import { useSyncExternalStore } from 'react';
import { DecoderText } from '~/components/decoder-text';
import styles from './profile-approved.module.css';

const PROFILE_TABLET_BREAKPOINT = 1040;
const PROFILE_COMPACT_MAX_WIDTH = 834;
const PROFILE_DESKTOP_REFERENCE_WIDTH = 1440;
const PROFILE_DESKTOP_REFERENCE_HEIGHT = 1110;

function subscribeToProfileViewport(onStoreChange) {
  window.addEventListener('resize', onStoreChange);
  return () => window.removeEventListener('resize', onStoreChange);
}

function getProfileViewportWidth() {
  return typeof window === 'undefined' ? null : window.innerWidth;
}

export function useProfileViewportWidth() {
  return useSyncExternalStore(subscribeToProfileViewport, getProfileViewportWidth, () => null);
}

const profileCtaArrowAccessibleMarkup = profileCtaArrowMarkup.replace(
  '<svg ',
  '<svg aria-hidden="true" ',
);

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
            dangerouslySetInnerHTML={{ __html: profileCtaArrowAccessibleMarkup }}
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

export const ProfileApprovedMobile = () => (
  <section className={styles.mobileProfile} aria-labelledby="profile-approved-mobile-title">
    <div className={styles.mobileDecorativeProfile} aria-hidden="true">
      PROFILE
    </div>

    <div className={styles.mobileCopy}>
      <span className={styles.mobileSectionLabel}>PROFILE</span>
      <h2 id="profile-approved-mobile-title" className={styles.mobileHeading}>
        Ready to get things
      </h2>
      <div className={styles.mobileDone}>DONE?</div>

      <div className={styles.mobileBody}>
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

      <a className={styles.mobileCta} href="/contact">
        <span className={styles.mobileCtaLabel}>Let&apos;s talk!</span>
        <span
          className={styles.mobileCtaArrow}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: profileCtaArrowAccessibleMarkup }}
        />
      </a>
    </div>

    <div className={styles.mobilePortraitFrame}>
      <img
        className={styles.mobilePortrait}
        src={danielPortrait}
        width="1122"
        height="1402"
        alt="Daniel wearing glasses and a blue shirt"
      />
      <span className={styles.mobilePortraitRevealBlock} aria-hidden="true" />
    </div>
  </section>
);

export const ProfileApprovedMobileComposition = ({ animationKey = 0 }) => (
  <div key={animationKey} className={styles.mobileComposition}>
    <ProfileApprovedMobile />
    <footer className={styles.mobileCopyright}>
      <p>© DonewithDan. Designed &amp; built by Daniel.</p>
    </footer>
  </div>
);

export const ProfileApprovedMobileScaledComposition = ({ width = 390, animationKey = 0 }) => {
  const scale = width / 390;

  return (
    <div
      className={styles.mobileScaledFrame}
      style={{ width: `${width}px`, height: `${1274 * scale}px` }}
    >
      <div
        className={styles.mobileScaledComposition}
        style={{ transform: `scale(${scale})` }}
      >
        <ProfileApprovedMobileComposition animationKey={animationKey} />
      </div>
    </div>
  );
};

export const ProfileApprovedResponsive = ({ animationKey = 0 }) => {
  const viewportWidth = useProfileViewportWidth();

  if (viewportWidth === null) {
    return <div className={styles.responsivePending} aria-hidden="true" />;
  }

  if (viewportWidth <= PROFILE_TABLET_BREAKPOINT) {
    const effectiveCompactWidth = Math.min(viewportWidth, PROFILE_COMPACT_MAX_WIDTH);
    const compactScale = effectiveCompactWidth / 390;

    return (
      <div
        className={styles.responsiveCompactFrame}
        style={{ width: `${viewportWidth}px`, height: `${1274 * compactScale}px` }}
      >
        <ProfileApprovedMobileScaledComposition
          width={effectiveCompactWidth}
          animationKey={animationKey}
        />
      </div>
    );
  }

  const scale = viewportWidth / PROFILE_DESKTOP_REFERENCE_WIDTH;

  return (
    <div
      className={styles.fullFrame}
      style={{
        width: `${viewportWidth}px`,
        minWidth: `${viewportWidth}px`,
        height: `${PROFILE_DESKTOP_REFERENCE_HEIGHT * scale}px`,
        minHeight: `${PROFILE_DESKTOP_REFERENCE_HEIGHT * scale}px`,
      }}
    >
      <div
        className={styles.fullFrameComposition}
        style={{ transform: `translateX(${170 * scale}px) scale(${scale})` }}
      >
        <ProfileApprovedComposition animationKey={animationKey} />
      </div>
    </div>
  );
};
