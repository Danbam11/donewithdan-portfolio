import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import headlinerIcon from '~/assets/case-study/headliner-icon.svg';
import crmCustomFields from '~/assets/case-study/haircutdone-crm-custom-fields.png';
import noBookingFollowUp from '~/assets/case-study/haircutdone-ghl-006-no-booking-follow-up.png';
import vipPriorityRequest from '~/assets/case-study/haircutdone-ghl-007-vip-priority-request.png';
import landingCta from '~/assets/case-study/haircutdone-landing-cta.png';
import newLeadStage from '~/assets/case-study/haircutdone-pipeline-new-lead-stage.png';
import faceShapeQuiz from '~/assets/case-study/haircutdone-quiz-face-shape.png';
import quizStart from '~/assets/case-study/haircutdone-quiz-start.png';
import shopHomepage from '~/assets/case-study/haircutdone-shop-homepage.png';
import tagsList from '~/assets/case-study/haircutdone-tags-list.png';
import { HaircutDoneMobileBackControl } from './mobile-back-control';
import styles from './mobile-opening-showcase.module.css';

const slides = [
  { title: 'Landing CTA', image: landingCta },
  { title: 'Custom Fields', image: crmCustomFields },
  { title: 'Face Shape Quiz', image: faceShapeQuiz },
  { title: 'Lead Pipeline', image: newLeadStage },
  { title: 'Quiz Start', image: quizStart },
  { title: 'Tags', image: tagsList },
  { title: 'No Booking Follow-Up', image: noBookingFollowUp },
  { title: 'Shop Homepage', image: shopHomepage },
  { title: 'VIP Priority Request', image: vipPriorityRequest },
];

const renderedSlides = [slides[slides.length - 1], ...slides, slides[0]];

const wrapSlide = (slide) => (slide + slides.length) % slides.length;

function TitleCharacters({ children }) {
  return Array.from(children).map((character, index) => (
    <span
      className={styles.titleCharacter}
      style={{ '--character-index': index }}
      key={`${character}-${index}`}
    >
      {character === ' ' ? '\u00a0' : character}
    </span>
  ));
}

function CarouselTitle({ title }) {
  const [transition, setTransition] = useState({
    current: title,
    previous: null,
    key: 0,
  });

  useLayoutEffect(() => {
    setTransition((currentTransition) => {
      if (currentTransition.current === title) return currentTransition;

      return {
        current: title,
        previous: currentTransition.current,
        key: currentTransition.key + 1,
      };
    });
  }, [title]);

  return (
    <h2
      className={`${styles.showcaseTitle} ${styles.carouselTitle}`}
      data-mobile-element="title-slot"
      aria-label={transition.current}
    >
      {transition.previous === null ? (
        <span className={styles.titleFace} data-title-role="current" aria-hidden="true">
          <TitleCharacters>{transition.current}</TitleCharacters>
        </span>
      ) : (
        <>
          <span
            className={`${styles.titleFace} ${styles.titleOutgoing}`}
            data-title-role="outgoing"
            aria-hidden="true"
            key={`outgoing-${transition.key}`}
          >
            <TitleCharacters>{transition.previous}</TitleCharacters>
          </span>
          <span
            className={`${styles.titleFace} ${styles.titleIncoming}`}
            data-title-role="incoming"
            aria-hidden="true"
            key={`incoming-${transition.key}`}
          >
            <TitleCharacters>{transition.current}</TitleCharacters>
          </span>
        </>
      )}
    </h2>
  );
}

function InteractiveShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [trackPosition, setTrackPosition] = useState(1);
  const [trackTransitionEnabled, setTrackTransitionEnabled] = useState(true);
  const [progressWrapping, setProgressWrapping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const gestureRef = useRef(null);
  const activeSlideRef = useRef(0);
  const wrapDirectionRef = useRef(null);
  const wrapTimeoutRef = useRef(null);
  const active = slides[activeSlide];

  const normalizeWrappedTrack = useCallback(() => {
    const wrapDirection = wrapDirectionRef.current;
    if (wrapDirection === null) return;

    if (wrapTimeoutRef.current !== null) {
      window.clearTimeout(wrapTimeoutRef.current);
      wrapTimeoutRef.current = null;
    }

    setTrackTransitionEnabled(false);
    setTrackPosition(wrapDirection > 0 ? 1 : slides.length);
    wrapDirectionRef.current = null;
  }, []);

  const moveBy = useCallback(
    (direction) => {
      if (wrapDirectionRef.current !== null) return;

      const currentSlide = activeSlideRef.current;
      const nextSlide = wrapSlide(currentSlide + direction);
      const wrapsForward = currentSlide === slides.length - 1 && direction > 0;
      const wrapsBackward = currentSlide === 0 && direction < 0;
      const isWrapping = wrapsForward || wrapsBackward;

      activeSlideRef.current = nextSlide;
      setActiveSlide(nextSlide);

      if (isWrapping) {
        wrapDirectionRef.current = direction;
        setProgressWrapping(true);
        setTrackPosition(wrapsForward ? slides.length + 1 : 0);
        wrapTimeoutRef.current = window.setTimeout(normalizeWrappedTrack, 380);
      } else {
        setTrackPosition(nextSlide + 1);
      }
    },
    [normalizeWrappedTrack],
  );

  useEffect(
    () => () => {
      if (wrapTimeoutRef.current !== null) window.clearTimeout(wrapTimeoutRef.current);
    },
    [],
  );

  useLayoutEffect(() => {
    if (trackTransitionEnabled) return undefined;

    const animationFrame = window.requestAnimationFrame(() => {
      setTrackTransitionEnabled(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [trackPosition, trackTransitionEnabled]);

  useLayoutEffect(() => {
    if (!progressWrapping) return undefined;

    const animationFrame = window.requestAnimationFrame(() => {
      setProgressWrapping(false);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [activeSlide, progressWrapping]);

  const resetDrag = useCallback(() => {
    if (viewportRef.current) viewportRef.current.dataset.dragging = 'false';
    if (trackRef.current) trackRef.current.style.setProperty('--drag-offset', '0px');
  }, []);

  const finishGesture = useCallback(
    (event, cancelled = false) => {
      const gesture = gestureRef.current;
      if (!gesture) return;

      const x = typeof event.clientX === 'number' ? event.clientX : gesture.lastX;
      const y = typeof event.clientY === 'number' ? event.clientY : gesture.lastY;
      const deltaX = (x - gesture.startX) / gesture.renderedScale;
      const deltaY = (y - gesture.startY) / gesture.renderedScale;
      const elapsed = Math.max(1, event.timeStamp - gesture.startTime);
      const velocity = deltaX / elapsed;

      resetDrag();

      if (!cancelled && gesture.intent === 'horizontal') {
        if (Math.abs(deltaX) >= 48 || Math.abs(velocity) >= 0.35) {
          moveBy(deltaX < 0 ? 1 : -1);
        }
      } else if (
        !cancelled &&
        gesture.intent === null &&
        Math.hypot(deltaX, deltaY) <= 8
      ) {
        setHasInteracted(true);
      }

      gestureRef.current = null;
    },
    [moveBy, resetDrag],
  );

  const handlePointerDown = useCallback((event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (wrapDirectionRef.current !== null) return;

    const renderedWidth = viewportRef.current?.getBoundingClientRect().width ?? 344;
    const renderedScale = renderedWidth > 0 ? renderedWidth / 344 : 1;

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: event.timeStamp,
      lastX: event.clientX,
      lastY: event.clientY,
      intent: null,
      renderedScale,
    };
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      const gesture = gestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId) return;

      const deltaX = (event.clientX - gesture.startX) / gesture.renderedScale;
      const deltaY = (event.clientY - gesture.startY) / gesture.renderedScale;
      const absoluteX = Math.abs(deltaX);
      const absoluteY = Math.abs(deltaY);
      gesture.lastX = event.clientX;
      gesture.lastY = event.clientY;

      if (gesture.intent === null) {
        if (absoluteX >= 8 && absoluteX > absoluteY * 1.2) {
          gesture.intent = 'horizontal';
          setHasInteracted(true);
          if (viewportRef.current) viewportRef.current.dataset.dragging = 'true';

          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // Pointer capture can already be owned or cancelled by the browser.
          }
        } else if (absoluteY >= 8 && absoluteY >= absoluteX / 1.2) {
          gesture.intent = 'vertical';
        }
      }

      if (gesture.intent !== 'horizontal') return;
      if (event.cancelable) event.preventDefault();

      trackRef.current?.style.setProperty('--drag-offset', `${deltaX}px`);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      event.preventDefault();
      setHasInteracted(true);
      moveBy(event.key === 'ArrowRight' ? 1 : -1);
    },
    [moveBy],
  );

  const handleTrackTransitionEnd = useCallback(
    (event) => {
      if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
      normalizeWrappedTrack();
    },
    [normalizeWrappedTrack],
  );

  return (
    <>
      <section
        className={styles.showcaseCard}
        data-mobile-element="cream-card"
        aria-label="HaircutDone interface showcase"
      >
        <CarouselTitle title={active.title} />
        <div
          className={styles.photoViewport}
          data-mobile-element="photo-viewport"
          data-dragging="false"
          ref={viewportRef}
          role="slider"
          aria-roledescription="carousel"
          aria-label="HaircutDone screenshot carousel"
          aria-orientation="horizontal"
          aria-valuemin={1}
          aria-valuemax={slides.length}
          aria-valuenow={activeSlide + 1}
          aria-valuetext={`${active.title}, slide ${activeSlide + 1} of ${slides.length}`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => finishGesture(event)}
          onPointerCancel={(event) => finishGesture(event, true)}
          onDragStart={(event) => event.preventDefault()}
        >
          <div
            className={`${styles.carouselTrack} ${
              hasInteracted ? styles.carouselTrackRevealed : styles.carouselTrackBlurred
            } ${trackTransitionEnabled ? '' : styles.carouselTrackJump}`}
            data-mobile-element="carousel-track"
            ref={trackRef}
            style={{ '--track-position': trackPosition, '--drag-offset': '0px' }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            {renderedSlides.map((slide, renderedIndex) => {
              const isClone = renderedIndex === 0 || renderedIndex === renderedSlides.length - 1;
              const realIndex = wrapSlide(renderedIndex - 1);

              return (
                <div
                  className={styles.carouselSlide}
                  role={isClone ? 'presentation' : 'group'}
                  aria-roledescription={isClone ? undefined : 'slide'}
                  aria-label={
                    isClone ? undefined : `${realIndex + 1} of ${slides.length}: ${slide.title}`
                  }
                  aria-hidden={isClone || realIndex !== activeSlide}
                  key={`${slide.title}-${renderedIndex}`}
                >
                  <img
                    className={styles.screenshot}
                    src={slide.image}
                    width={1920}
                    height={1080}
                    alt={isClone ? '' : `${slide.title} interface screenshot`}
                    draggable="false"
                  />
                </div>
              );
            })}
          </div>

          <span
            className={`${styles.swipeHint} ${hasInteracted ? styles.swipeHintDismissed : ''}`}
            data-mobile-element="swipe-hint"
            aria-hidden="true"
          />
        </div>
      </section>

      <div
        className={`${styles.progress} ${progressWrapping ? styles.progressWrapping : ''}`}
        data-mobile-element="carousel-progress"
        aria-hidden="true"
      >
        {slides.map((slide, index) => (
          <span
            className={styles.progressInactive}
            style={{ '--progress-index': index }}
            key={slide.title}
          />
        ))}
        <span
          className={styles.progressActive}
          style={{ '--active-slide': activeSlide }}
        />
      </div>

      <span className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
        Slide {activeSlide + 1} of {slides.length}: {active.title}
      </span>
    </>
  );
}

export function HaircutDoneMobileOpeningShowcase({
  motionEnabled = false,
  carouselEnabled = false,
  showBackControl = true,
}) {
  return (
    <section
      className={styles.canvas}
      data-motion-enabled={motionEnabled ? 'true' : 'false'}
      aria-label="HaircutDone mobile opening and showcase"
    >
      <h1 className={styles.heading} aria-label="HAIRCUTDONE">
        <span className={styles.haircut} data-mobile-element="haircut" aria-hidden="true">
          HAIRCUT
        </span>
        <span className={styles.done} data-mobile-element="done" aria-hidden="true">
          DONE
        </span>
      </h1>

      <img
        className={styles.pole}
        data-mobile-element="pole"
        src={headlinerIcon}
        width={68}
        height={149}
        alt=""
      />

      <p className={styles.description} data-mobile-element="description">
        From haircut quiz to follow-up,
        <br />
        the full customer journey—DONE.
      </p>

      {carouselEnabled ? (
        <InteractiveShowcase />
      ) : (
        <section
          className={styles.showcaseCard}
          data-mobile-element="cream-card"
          aria-label="HaircutDone interface showcase"
        >
          <h2 className={styles.showcaseTitle} data-mobile-element="title-slot">
            Landing CTA
          </h2>
          <div className={styles.photoViewport} data-mobile-element="photo-viewport">
            <img
              className={styles.screenshot}
              src={landingCta}
              width={1920}
              height={1080}
              alt="Landing CTA interface screenshot"
            />
          </div>
        </section>
      )}

      {showBackControl ? <HaircutDoneMobileBackControl /> : null}
    </section>
  );
}
