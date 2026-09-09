import { useEffect, useRef, useState } from 'react';

import loomVideo from '~/assets/case-study/loom-video-clean.mp4';
import styles from './mobile-loom.module.css';

const REVEAL_THRESHOLD = 0.18;
const REVEAL_SEQUENCE_DURATION = 590;

export function HaircutDoneMobileLoom({ revealEnabled = false }) {
  const sectionRef = useRef(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [revealSequenceComplete, setRevealSequenceComplete] = useState(false);
  const isRevealed = !revealEnabled || hasRevealed;
  const isInteractive = !revealEnabled || revealSequenceComplete;

  useEffect(() => {
    if (!revealEnabled) return undefined;

    const section = sectionRef.current;
    if (!section) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasRevealed(true);
      setRevealSequenceComplete(true);
      return undefined;
    }

    if (typeof window.IntersectionObserver !== 'function') {
      setHasRevealed(true);
      setRevealSequenceComplete(true);
      return undefined;
    }

    let completionTimer;
    const observer = new window.IntersectionObserver(
      entries => {
        const entry = entries[0];

        if (entry?.isIntersecting && entry.intersectionRatio >= REVEAL_THRESHOLD) {
          setHasRevealed(true);
          observer.disconnect();
          completionTimer = window.setTimeout(
            () => setRevealSequenceComplete(true),
            REVEAL_SEQUENCE_DURATION,
          );
        }
      },
      { threshold: REVEAL_THRESHOLD },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      window.clearTimeout(completionTimer);
    };
  }, [revealEnabled]);

  return (
    <section
      ref={sectionRef}
      className={[
        styles.section,
        revealEnabled && styles.revealEnabled,
        isRevealed ? styles.revealed : styles.revealPending,
        isInteractive ? styles.interactive : styles.interactionPending,
      ]
        .filter(Boolean)
        .join(' ')}
      data-mobile-loom-element="section"
      data-reveal-enabled={revealEnabled}
      data-reveal-state={isRevealed ? 'revealed' : 'pending'}
      data-reveal-interaction={isInteractive ? 'enabled' : 'disabled'}
      aria-labelledby="haircutdone-mobile-loom-heading"
    >
      <p className={styles.label} data-mobile-loom-element="label">
        WALKTHROUGH
      </p>

      <h2
        className={styles.heading}
        data-mobile-loom-element="heading"
        id="haircutdone-mobile-loom-heading"
      >
        See the full system
        <br />
        in motion.
      </h2>

      <div className={styles.videoContainer} data-mobile-loom-element="video-container">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          className={styles.video}
          data-mobile-loom-element="video"
          src={loomVideo}
          controls
          playsInline
          autoPlay={false}
          loop={false}
          muted={false}
          preload="auto"
          aria-label="HaircutDone product walkthrough"
        />
      </div>
    </section>
  );
}
