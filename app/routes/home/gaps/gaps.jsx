import bookingsIllustration from '~/assets/gaps-bookings.png';
import { Transition } from '~/components/transition';
import { useHydrated } from '~/hooks/useHydrated';
import followupsIllustration from '~/assets/gaps-followups.png';
import leadsIllustration from '~/assets/gaps-leads.png';
import {
  motion,
  useAnimationControls,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import styles from './gaps.module.css';

const foregroundWords = ['What', 'gets', 'left', 'un'];
const giantRevealMs = 1100;
const giantToForegroundMs = 40;
const foregroundCharacterDuration = 650;
const foregroundCharacterInterval = 100;
const foregroundWordDelays = {
  What: 0,
  gets: 400,
  left: 800,
  un: 1700,
};
const unCharacterDuration = 500;
const foregroundStageMs = 2300;
const foregroundToDoneMs = 100;
const doneCoverExpandMs = 500;
const doneCoverHoldMs = 80;
const doneCoverRetractMs = 500;
const foregroundCharacterVariants = {
  hidden: { opacity: 0, filter: 'blur(6px)' },
  visible: ({ delay, duration }) => ({
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      delay: delay / 1000,
      duration: duration / 1000,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function HeroCharacter({ character, controls, delay, duration }) {
  return (
    <motion.span
      className={styles.character}
      animate={controls}
      custom={{ delay, duration }}
      initial="hidden"
      variants={foregroundCharacterVariants}
    >
      {character}
    </motion.span>
  );
}

function HeroWord({ word, controls }) {
  const duration = word === 'un' ? unCharacterDuration : foregroundCharacterDuration;

  return (
    <span className={styles.heroWord}>
      {Array.from(word).map((character, index) => (
        <HeroCharacter
          character={character}
          key={`${word}-${character}-${index}`}
          controls={controls}
          delay={foregroundWordDelays[word] + index * foregroundCharacterInterval}
          duration={duration}
        />
      ))}
    </span>
  );
}

function useDesktopStacking(reducedMotion) {
  const [desktopStacking, setDesktopStacking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(min-width: 1041px)');
    const updateStacking = () => setDesktopStacking(mediaQuery.matches && !reducedMotion);

    updateStacking();
    mediaQuery.addEventListener('change', updateStacking);
    return () => mediaQuery.removeEventListener('change', updateStacking);
  }, [reducedMotion]);

  return desktopStacking;
}

function useDesktopHeroAnimation() {
  const [desktopHeroAnimation, setDesktopHeroAnimation] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(min-width: 1041px)');
    const updateHeroAnimation = () => setDesktopHeroAnimation(mediaQuery.matches);

    updateHeroAnimation();
    mediaQuery.addEventListener('change', updateHeroAnimation);
    return () => mediaQuery.removeEventListener('change', updateHeroAnimation);
  }, []);

  return desktopHeroAnimation;
}

function useStackProgress(startMarkerRef, stackStageRef, enabled) {
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!enabled || !startMarkerRef.current || !stackStageRef.current) {
      progress.set(0);
      return undefined;
    }

    const updateProgress = () => {
      const markerRect = startMarkerRef.current.getBoundingClientRect();
      const stageStyles = window.getComputedStyle(stackStageRef.current);
      const stackTop = Number.parseFloat(stageStyles.top) || 0;
      const stackStart = window.scrollY + markerRect.top - stackTop;
      const stackDistance = window.innerHeight * 1.6;
      const nextProgress = (window.scrollY - stackStart) / stackDistance;

      progress.set(Math.min(1, Math.max(0, nextProgress)));
    };

    const observer = new ResizeObserver(updateProgress);
    observer.observe(stackStageRef.current);
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [enabled, progress, stackStageRef, startMarkerRef]);

  return progress;
}

function useCardVisibility(cardRef, enabled) {
  const visibility = useMotionValue(0);

  useEffect(() => {
    if (!enabled || !cardRef.current) {
      visibility.set(0);
      return undefined;
    }

    const updateVisibility = () => {
      const rect = cardRef.current.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));

      visibility.set(Math.min(1, visibleHeight / rect.height));
    };

    const observer = new ResizeObserver(updateVisibility);
    observer.observe(cardRef.current);
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    updateVisibility();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [cardRef, enabled, visibility]);

  return visibility;
}

function useElementHeight(elementRef) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!elementRef.current) return undefined;

    const updateHeight = () => setHeight(elementRef.current.getBoundingClientRect().height);
    const observer = new ResizeObserver(updateHeight);

    observer.observe(elementRef.current);
    updateHeight();
    return () => observer.disconnect();
  }, [elementRef]);

  return height;
}

function StackingProblem({ cardRef, index, problem, progress, stackingEnabled }) {
  const scale = useTransform(
    progress,
    [0, 0.5, 1],
    index === 0 ? [1, 0.85, 0.85] : index === 1 ? [1, 1, 0.85] : [1, 1, 1]
  );
  const rotate = useTransform(
    progress,
    [0, 0.5, 1],
    index === 0 ? [0, 4, 4] : index === 1 ? [0, 0, 4] : [0, 0, 0]
  );
  const y = useTransform(
    progress,
    [0, 0.5, 1],
    index === 0 ? ['0%', '0%', '0%'] : index === 1 ? ['100%', '0%', '0%'] : ['100%', '100%', '0%']
  );

  return (
    <motion.article
      className={styles.problem}
      data-problem={problem.number}
      ref={cardRef}
      style={stackingEnabled ? { rotate, scale, y } : undefined}
    >
      <div className={styles.composition}>
        <div className={styles.copy}>
          <p className={styles.number}>{problem.number}</p>
          <h3>{problem.title}</h3>
          <p className={styles.description}>{problem.description}</p>
        </div>
        <figure className={styles.figure}>
          <img src={problem.image} alt={problem.alt} />
        </figure>
      </div>
    </motion.article>
  );
}

const problems = [
  {
    number: '01',
    title: <><span className={styles.firstPhrase}>Leads,</span><br />not leaks.</>,
    description: 'Funnels, forms, and quizzes route every inquiry where it needs to go.',
    image: leadsIllustration,
    alt: 'Illustration supporting Leads, not leaks.',
  },
  {
    number: '02',
    title: <><span className={styles.firstPhrase}>Bookings,</span><br />not back-and-forth.</>,
    description: 'Confirmations, reminders, and reschedules move without manual chasing.',
    image: bookingsIllustration,
    alt: 'Illustration supporting Bookings, not back-and-forth.',
  },
  {
    number: '03',
    title: <><span className={styles.firstPhrase}>Follow-ups,</span><br />not forgotten.</>,
    description: 'Every next step runs when it should—even after cancellations or no-shows.',
    image: followupsIllustration,
    alt: 'Illustration supporting Follow-ups, not forgotten.',
  },
];

export function Gaps({ animateEntrance = true }) {
  const headerRef = useRef(null);
  const cardOneRef = useRef(null);
  const stackStartMarkerRef = useRef(null);
  const stackStageRef = useRef(null);
  const startedRef = useRef(false);
  const mountedRef = useRef(true);
  const reducedMotion = useReducedMotion();
  const isHydrated = useHydrated();
  const giantControls = useAnimationControls();
  const kickerControls = useAnimationControls();
  const foregroundControls = useAnimationControls();
  const coverControls = useAnimationControls();
  const [doneRevealed, setDoneRevealed] = useState(false);
  const [coverVisible, setCoverVisible] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const desktopHeroAnimation = useDesktopHeroAnimation();
  const shouldAnimate = animateEntrance && desktopHeroAnimation && !reducedMotion;
  const shouldAnimateResponsiveText = animateEntrance && !desktopHeroAnimation;
  const stackingEnabled = useDesktopStacking(reducedMotion);
  const triggerReached = useInView(headerRef, {
    amount: 0,
    margin: '0px 0px -80% 0px',
    once: true,
  });
  const stackProgress = useStackProgress(stackStartMarkerRef, stackStageRef, stackingEnabled);
  const smoothedStackProgress = useSpring(stackProgress, {
    stiffness: 180,
    damping: 32,
    mass: 0.28,
    restDelta: 0.001,
    restSpeed: 0.01,
  });
  const cardOneVisibility = useCardVisibility(cardOneRef, stackingEnabled);
  const headerHeight = useElementHeight(headerRef);
  const heroReleaseY = useTransform(
    cardOneVisibility,
    [0, 0.4, 0.7],
    [0, 0, -headerHeight]
  );
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!shouldAnimate || !triggerReached || startedRef.current) return;

    const runEntrance = async () => {
      startedRef.current = true;

      void giantControls.start({
        opacity: 1,
        filter: 'blur(0px)',
        clipPath: 'inset(-24px -24px -24px -24px)',
        transition: { duration: giantRevealMs / 1000, ease: [0.22, 1, 0.36, 1] },
      });
      await new Promise(resolve => window.setTimeout(resolve, giantRevealMs));
      await new Promise(resolve => window.setTimeout(resolve, giantToForegroundMs));

      void kickerControls.start({
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      });
      void foregroundControls.start('visible');
      await new Promise(resolve => window.setTimeout(resolve, foregroundStageMs));
      await new Promise(resolve => window.setTimeout(resolve, foregroundToDoneMs));

      if (!mountedRef.current) return;

      setCoverVisible(true);
      await new Promise(resolve => window.requestAnimationFrame(resolve));
      void coverControls.start({
        scaleX: 1,
        transition: { duration: doneCoverExpandMs / 1000, ease: [0.22, 1, 0.36, 1] },
      });
      await new Promise(resolve => window.setTimeout(resolve, doneCoverExpandMs));

      if (!mountedRef.current) return;

      setDoneRevealed(true);
      await new Promise(resolve => window.setTimeout(resolve, doneCoverHoldMs));

      if (!mountedRef.current) return;

      void coverControls.start({
        scaleX: 0,
        transition: { duration: doneCoverRetractMs / 1000, ease: [0.22, 1, 0.36, 1] },
      });
      await new Promise(resolve => window.setTimeout(resolve, doneCoverRetractMs));

      if (mountedRef.current) {
        setCoverVisible(false);
        setEntranceComplete(true);
      }
    };

    void runEntrance();
  }, [coverControls, foregroundControls, giantControls, kickerControls, shouldAnimate, triggerReached]);

  useEffect(() => {
    if (!shouldAnimate || !triggerReached || entranceComplete) return undefined;

    let touchStartY = null;
    const preventForwardWheel = event => {
      if (event.deltaY > 0) event.preventDefault();
    };
    const recordTouchStart = event => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };
    const preventForwardTouch = event => {
      const touchY = event.touches[0]?.clientY;

      if (touchStartY !== null && touchY !== undefined && touchY < touchStartY) {
        event.preventDefault();
      }
    };
    const preventForwardKey = event => {
      if ([' ', 'ArrowDown', 'PageDown', 'End'].includes(event.key)) event.preventDefault();
    };

    window.addEventListener('wheel', preventForwardWheel, { passive: false });
    window.addEventListener('touchstart', recordTouchStart, { passive: true });
    window.addEventListener('touchmove', preventForwardTouch, { passive: false });
    window.addEventListener('keydown', preventForwardKey);

    return () => {
      window.removeEventListener('wheel', preventForwardWheel);
      window.removeEventListener('touchstart', recordTouchStart);
      window.removeEventListener('touchmove', preventForwardTouch);
      window.removeEventListener('keydown', preventForwardKey);
    };
  }, [entranceComplete, shouldAnimate, triggerReached]);

  return (
    <section className={styles.section} aria-labelledby="gaps-title">
      <div className={styles.heroShell}>
        <motion.header
          className={`${styles.header}${stackingEnabled ? ` ${styles.headerSticky}` : ''}`}
          ref={headerRef}
          style={
            stackingEnabled
              ? { y: heroReleaseY }
              : !desktopHeroAnimation
                ? { transform: 'scale(var(--mobileScale, 1))' }
                : undefined
          }
        >
        {shouldAnimate ? (
          <motion.div
            className={styles.decorativeWord}
            aria-hidden="true"
            animate={giantControls}
            initial={{
              opacity: 0,
              filter: 'blur(10px)',
              clipPath: 'inset(calc(100% + 24px) -24px -24px -24px)',
            }}
          >
            <span className={styles.wordCovered}>GAPS</span>
            <span className={styles.wordExposed}>GAPS</span>
          </motion.div>
        ) : shouldAnimateResponsiveText ? (
          <Transition in={isHydrated}>
            {({ visible }) => (
              <div
                className={`${styles.decorativeWord} ${styles.responsiveDecorativeWord}`}
                data-visible={visible}
                aria-hidden="true"
              >
                <span className={styles.wordCovered}>GAPS</span>
                <span className={styles.wordExposed}>GAPS</span>
              </div>
            )}
          </Transition>
        ) : (
          <div
            className={styles.decorativeWord}
            aria-hidden="true"
          >
            <span className={styles.wordCovered}>GAPS</span>
            <span className={styles.wordExposed}>GAPS</span>
          </div>
        )}
        <div className={styles.intro}>
          {shouldAnimate ? (
            <>
              <motion.p
                className={styles.kicker}
                animate={kickerControls}
                initial={{ opacity: 0, filter: 'blur(6px)' }}
              >
                GAPS
              </motion.p>
              <h2 className={styles.heading} id="gaps-title" aria-label="What gets left unDONE.">
                <span className={styles.heroLine} aria-hidden="true">
                  {foregroundWords.slice(0, 3).map(word => (
                    <HeroWord key={word} controls={foregroundControls} word={word} />
                  ))}
                </span>
                <span className={styles.heroLine} aria-hidden="true">
                  <HeroWord controls={foregroundControls} word={foregroundWords[3]} />
                  <span className={styles.doneReveal}>
                    <span className={`${styles.doneText}${doneRevealed ? ` ${styles.doneReady}` : ''}`}>
                      DONE.
                    </span>
                    {coverVisible && (
                      <motion.span
                        className={styles.doneWipe}
                        animate={coverControls}
                        initial={{ scaleX: 0 }}
                      />
                    )}
                  </span>
                </span>
              </h2>
            </>
          ) : shouldAnimateResponsiveText ? (
            <Transition in={isHydrated}>
              {({ visible }) => (
                <>
                  <p className={`${styles.kicker} ${styles.responsiveKicker}`} data-visible={visible}>
                    GAPS
                  </p>
                  <h2
                    className={`${styles.heading} ${styles.responsiveHeading}`}
                    data-visible={visible}
                    id="gaps-title"
                  >
                    <span className={styles.heroLine}>What gets left</span>
                    <span className={styles.heroLine}>
                      <span className={styles.unText}>un</span><span className={styles.doneText}>DONE.</span>
                    </span>
                  </h2>
                </>
              )}
            </Transition>
          ) : (
            <>
              <p className={styles.kicker}>GAPS</p>
              <h2 className={styles.heading} id="gaps-title">
                <span className={styles.heroLine}>What gets left</span>
                <span className={styles.heroLine}>
                  <span className={styles.unText}>un</span><span className={styles.doneText}>DONE.</span>
                </span>
              </h2>
            </>
          )}
        </div>
        </motion.header>
      </div>

      <div
        className={`${styles.problems}${stackingEnabled ? ` ${styles.stackingActive}` : ` ${styles.reducedMotion}`}`}
      >
        <div className={styles.stackStartMarker} ref={stackStartMarkerRef} aria-hidden="true" />
        <div className={styles.stackStage} ref={stackStageRef}>
          {problems.map((problem, index) => (
            <StackingProblem
              cardRef={index === 0 ? cardOneRef : undefined}
              index={index}
              key={problem.number}
              problem={problem}
            progress={smoothedStackProgress}
              stackingEnabled={stackingEnabled}
            />
          ))}
        </div>
        <div className={styles.stackScrollRunway} aria-hidden="true" />
      </div>
    </section>
  );
}
