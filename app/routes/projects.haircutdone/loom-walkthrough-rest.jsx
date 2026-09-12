import { motion, useInView, useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import styles from './loom-walkthrough-rest.module.css';

const loomVideo = '/media/loom-video-clean.mp4';

export function HaircutDoneLoomWalkthroughRest({ animated = false, live = false }) {
  const reduceMotion = useReducedMotion();
  const titleTriggerRef = useRef(null);
  const titleInView = useInView(titleTriggerRef, {
    once: true,
    amount: 0.35,
  });
  const shouldAnimate = animated && !reduceMotion;
  const titleVisible = !shouldAnimate || titleInView;
  const titleMotion =
    shouldAnimate
      ? {
          initial: { opacity: 0 },
          animate: { opacity: titleVisible ? 1 : 0 },
          transition: {
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
            delay: 0,
          },
        }
      : {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
        };

  return (
    <section className={styles.section} aria-labelledby="loom-walkthrough-heading">
      <div ref={titleTriggerRef} className={styles.titleTrigger} aria-hidden="true" />
      <motion.p className={styles.label} {...titleMotion}>
        WALKTHROUGH
      </motion.p>
      <motion.h2
        className={styles.heading}
        id="loom-walkthrough-heading"
        {...titleMotion}
      >
        See the full system in motion.
      </motion.h2>

      <svg
        className={styles.filterDefinition}
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <filter
          id="haircutdone-video-backlight"
          x="-10%"
          y="-20%"
          width="120%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="36" result="blurred" />
          <feColorMatrix
            in="blurred"
            type="saturate"
            values="9"
            result="saturatedBlur"
          />
          <feComponentTransfer in="saturatedBlur" result="edgeGlow">
            <feFuncA type="linear" slope="0.82" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="edgeGlow" operator="over" />
        </filter>
      </svg>

      <div className={styles.videoStage}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          className={styles.video}
          src={loomVideo}
          controls={live}
          autoPlay={false}
          muted={!live}
          preload={live ? 'auto' : 'metadata'}
          playsInline
          disablePictureInPicture
          aria-label="HaircutDone product walkthrough"
        />
      </div>
    </section>
  );
}

HaircutDoneLoomWalkthroughRest.propTypes = {
  animated: PropTypes.bool,
  live: PropTypes.bool,
};
