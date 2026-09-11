import { motion, useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import landingCta from '~/assets/case-study/haircutdone-landing-cta.png';
import customFields from '~/assets/case-study/haircutdone-crm-custom-fields.png';
import faceShapeQuiz from '~/assets/case-study/haircutdone-quiz-face-shape.png';
import leadPipeline from '~/assets/case-study/haircutdone-pipeline-new-lead-stage.png';
import quizStart from '~/assets/case-study/haircutdone-quiz-start.png';
import tags from '~/assets/case-study/haircutdone-tags-list.png';
import noBookingFollowUp from '~/assets/case-study/haircutdone-ghl-006-no-booking-follow-up.png';
import shopHomepage from '~/assets/case-study/haircutdone-shop-homepage.png';
import vipPriorityRequest from '~/assets/case-study/haircutdone-ghl-007-vip-priority-request.png';
import styles from './screenshot-grid-rest.module.css';

const DESKTOP_ZOOM_TARGET = {
  left: 96,
  top: 38.5,
  width: 1248,
  height: 723,
};

const isValidZoomTarget = target =>
  target &&
  [target.left, target.top, target.width, target.height].every(Number.isFinite) &&
  target.width > 0 &&
  target.height > 0;

const scrollKeys = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
  'Spacebar',
]);

const blurLayers = [
  styles.blurLight,
  styles.blurSoft,
  styles.blurModerate,
  styles.blurStrong,
  styles.blurMaximum,
];

export const haircutDoneScreenshots = [
  { title: 'Landing CTA', image: landingCta, tone: 'dark' },
  { title: 'Custom Fields', image: customFields, tone: 'light' },
  { title: 'Face Shape Quiz', image: faceShapeQuiz, tone: 'dark' },
  { title: 'Lead Pipeline', image: leadPipeline, tone: 'light' },
  { title: 'Quiz Start', image: quizStart, tone: 'dark' },
  { title: 'Tags', image: tags, tone: 'light' },
  { title: 'No Booking Follow-Up', image: noBookingFollowUp, tone: 'light' },
  { title: 'Shop Homepage', image: shopHomepage, tone: 'dark' },
  { title: 'VIP Priority Request', image: vipPriorityRequest, tone: 'light' },
];

function ScreenshotCardVisual({
  cardRef,
  hidden = false,
  onClick,
  onKeyDown,
  screenshot,
  zoomable = false,
}) {
  const { title, image, tone } = screenshot;
  const titleClass = `${styles.title} ${
    tone === 'light' ? styles.titleDark : styles.titleCream
  }`;
  const content = (
    <>
      <img
        className={styles.image}
        src={image}
        alt={`${title} interface screenshot`}
        width={400}
        height={225}
      />
      <span className={styles.blurStack} aria-hidden="true">
        {blurLayers.map(blurClass => (
          <img
            className={`${styles.blurLayer} ${blurClass}`}
            src={image}
            alt=""
            key={blurClass}
          />
        ))}
      </span>
      {zoomable ? (
        <span className={titleClass}>{title}</span>
      ) : (
        <figcaption className={titleClass}>{title}</figcaption>
      )}
    </>
  );

  if (!zoomable) return <figure className={styles.card}>{content}</figure>;

  return (
    <button
      ref={cardRef}
      className={`${styles.card} ${styles.cardZoomable} ${
        hidden ? styles.zoomSourceHidden : ''
      }`}
      type="button"
      aria-label={`Zoom in ${title} screenshot`}
      aria-expanded={hidden ? true : undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {content}
    </button>
  );
}

function ZoomableScreenshotCard({ beforeOpen, getZoomTarget, screenshot }) {
  const { title, image } = screenshot;
  const cardRef = useRef(null);
  const preparingRef = useRef(false);
  const zoomFrameRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState('idle');
  const [preparing, setPreparing] = useState(false);
  const [sourceRect, setSourceRect] = useState(null);
  const [zoomTarget, setZoomTarget] = useState(DESKTOP_ZOOM_TARGET);
  const inspectionActive = phase !== 'idle';
  const interactionLocked = preparing || inspectionActive;

  const openInspection = useCallback(async () => {
    if (phase !== 'idle' || preparingRef.current || !cardRef.current) return;

    preparingRef.current = true;
    if (beforeOpen) setPreparing(true);

    try {
      const allowed = beforeOpen ? await beforeOpen() : true;

      if (allowed === false || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const measuredZoomTarget = getZoomTarget?.();

      console.log('GRID ZOOM TARGET:', measuredZoomTarget);

      if (getZoomTarget && !isValidZoomTarget(measuredZoomTarget)) return;

      setSourceRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
      setZoomTarget(
        getZoomTarget
          ? {
              left: measuredZoomTarget.left,
              top: measuredZoomTarget.top,
              width: measuredZoomTarget.width,
              height: measuredZoomTarget.height,
            }
          : DESKTOP_ZOOM_TARGET
      );
      setPhase('opening');
    } finally {
      preparingRef.current = false;
      if (beforeOpen) setPreparing(false);
    }
  }, [beforeOpen, getZoomTarget, phase]);

  const closeInspection = useCallback(() => {
    setPhase(currentPhase => (currentPhase === 'open' ? 'closing' : currentPhase));
  }, []);

  const handleCardKeyDown = useCallback(
    event => {
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;

      event.preventDefault();
      openInspection();
    },
    [openInspection]
  );

  const handleAnimationComplete = useCallback(() => {
  if (phase === 'opening') {
    console.log(
      'ACTUAL ZOOM FRAME:',
      zoomFrameRef.current?.getBoundingClientRect()
    );

    setPhase('open');
    return;
  }

  if (phase === 'closing') {
    setPhase('idle');
    cardRef.current?.focus();
  }
}, [phase]);

  useEffect(() => {
    if (phase === 'open') zoomFrameRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (!interactionLocked) return undefined;

    const preventScroll = event => event.preventDefault();
    const handleKeyDown = event => {
      if (event.key === 'Escape' && phase === 'open') {
        event.preventDefault();
        closeInspection();
        return;
      }

      if (scrollKeys.has(event.key)) event.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeInspection, interactionLocked, phase]);

  const overlay =
    inspectionActive && sourceRect && typeof document !== 'undefined'
      ? createPortal(
          <dialog
            open
            className={styles.zoomBackdrop}
            onClick={phase === 'open' ? closeInspection : undefined}
            onKeyDown={event => {
              if (event.key !== 'Escape' || phase !== 'open') return;

              event.preventDefault();
              event.stopPropagation();
              closeInspection();
            }}
            aria-label={`${title} screenshot inspection`}
            aria-hidden={phase === 'opening' ? true : undefined}
          >
            <motion.div
              ref={zoomFrameRef}
              className={styles.zoomFrame}
              role="button"
              tabIndex={phase === 'open' ? 0 : -1}
              aria-disabled={phase !== 'open'}
              aria-label={`Zoom out ${title} screenshot`}
              initial={sourceRect}
              animate={phase === 'closing' ? sourceRect : zoomTarget}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
              }
              onAnimationComplete={handleAnimationComplete}
              onClick={event => {
                event.stopPropagation();
                if (phase === 'open') closeInspection();
              }}
              onKeyDown={event => {
                if (
                  phase !== 'open' ||
                  (event.key !== 'Enter' &&
                    event.key !== ' ' &&
                    event.key !== 'Spacebar')
                ) {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();
                closeInspection();
              }}
            >
              <img
                className={styles.zoomImage}
                src={image}
                alt=""
                draggable={false}
              />
            </motion.div>
          </dialog>,
          document.body
        )
      : null;

  return (
    <>
      <ScreenshotCardVisual
        cardRef={cardRef}
        hidden={inspectionActive}
        onClick={openInspection}
        onKeyDown={handleCardKeyDown}
        screenshot={screenshot}
        zoomable
      />
      {overlay}
    </>
  );
}

export function HaircutDoneScreenshotCard({
  beforeOpen,
  getZoomTarget,
  screenshot,
  zoomable = false,
}) {
  return zoomable ? (
    <ZoomableScreenshotCard
      beforeOpen={beforeOpen}
      getZoomTarget={getZoomTarget}
      screenshot={screenshot}
    />
  ) : (
    <ScreenshotCardVisual screenshot={screenshot} />
  );
}

export function HaircutDoneScreenshotGridRest({
  runtimeZoomTarget = false,
  zoomable = false,
}) {
  const gridRef = useRef(null);
  const getGridZoomTarget = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return null;

    const rect = grid.getBoundingClientRect();

    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  return (
    <section className={styles.canvas} aria-label="HaircutDone screenshot grid">
      <div ref={gridRef} className={styles.grid}>
        {haircutDoneScreenshots.map(screenshot => (
          <HaircutDoneScreenshotCard
            getZoomTarget={runtimeZoomTarget ? getGridZoomTarget : undefined}
            screenshot={screenshot}
            zoomable={zoomable}
            key={screenshot.title}
          />
        ))}
      </div>
    </section>
  );
}

const screenshotShape = PropTypes.shape({
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(['dark', 'light']).isRequired,
});

ScreenshotCardVisual.propTypes = {
  cardRef: PropTypes.shape({ current: PropTypes.object }),
  hidden: PropTypes.bool,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  screenshot: screenshotShape.isRequired,
  zoomable: PropTypes.bool,
};

ZoomableScreenshotCard.propTypes = {
  beforeOpen: PropTypes.func,
  getZoomTarget: PropTypes.func,
  screenshot: screenshotShape.isRequired,
};

HaircutDoneScreenshotCard.propTypes = {
  beforeOpen: PropTypes.func,
  getZoomTarget: PropTypes.func,
  screenshot: screenshotShape.isRequired,
  zoomable: PropTypes.bool,
};

HaircutDoneScreenshotGridRest.propTypes = {
  runtimeZoomTarget: PropTypes.bool,
  zoomable: PropTypes.bool,
};
