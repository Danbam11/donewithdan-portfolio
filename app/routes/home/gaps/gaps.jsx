import bookingsIllustration from '~/assets/gaps-bookings.png';
import { useHydrated } from '~/hooks/useHydrated';
import followupsIllustration from '~/assets/gaps-followups.png';
import leadsIllustration from '~/assets/gaps-leads.png';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import styles from './gaps.module.css';

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
      const stackDistance = window.innerHeight * 1.8;
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

function StackingProblem({ index, problem, progress, stackingEnabled }) {
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
    index === 0
      ? ['0%', '0%', '0%']
      : index === 1
        ? ['100%', '0%', '0%']
        : ['100%', '100%', '0%']
  );

  return (
    <motion.article
      className={styles.problem}
      data-problem={problem.number}
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
    title: (
      <>
        <span className={styles.firstPhrase}>Leads,</span>
        <br />
        not leaks.
      </>
    ),
    description: 'Funnels, forms, and quizzes route every inquiry where it needs to go.',
    image: leadsIllustration,
    alt: 'Illustration supporting Leads, not leaks.',
  },
  {
    number: '02',
    title: (
      <>
        <span className={styles.firstPhrase}>Bookings,</span>
        <br />
        not back-and-forth.
      </>
    ),
    description: 'Confirmations, reminders, and reschedules move without manual chasing.',
    image: bookingsIllustration,
    alt: 'Illustration supporting Bookings, not back-and-forth.',
  },
  {
    number: '03',
    title: (
      <>
        <span className={styles.firstPhrase}>Follow-ups,</span>
        <br />
        not forgotten.
      </>
    ),
    description: 'Every next step runs when it should—even after cancellations or no-shows.',
    image: followupsIllustration,
    alt: 'Illustration supporting Follow-ups, not forgotten.',
  },
];

export function Gaps({ animateEntrance = true }) {
  const headerRef = useRef(null);
  const identityRef = useRef(null);
  const identityEnteredRef = useRef(false);
  const stackStartMarkerRef = useRef(null);
  const stackStageRef = useRef(null);

  const reducedMotion = useReducedMotion();
  const isHydrated = useHydrated();
  const stackingEnabled = useDesktopStacking(reducedMotion);
  const [identityEntered, setIdentityEntered] = useState(false);

  const revealEnabled = animateEntrance && !reducedMotion;
  const identityVisible = !revealEnabled || identityEntered;

  useEffect(() => {
    if (
      !revealEnabled ||
      !isHydrated ||
      identityEnteredRef.current ||
      !identityRef.current
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return;

        identityEnteredRef.current = true;
        setIdentityEntered(true);
        observer.disconnect();
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(identityRef.current);
    return () => observer.disconnect();
  }, [isHydrated, revealEnabled]);

  const { scrollYProgress: headerScrollProgress } = useScroll({
    target: stackStageRef,
    offset: ['start 100%', 'start 8%'],
  });

  const smoothedHeaderScrollProgress = useSpring(headerScrollProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.35,
    restDelta: 0.001,
    restSpeed: 0.01,
  });

  const stackProgress = useStackProgress(stackStartMarkerRef, stackStageRef, stackingEnabled);
  const smoothedStackProgress = useSpring(stackProgress, {
    stiffness: 180,
    damping: 32,
    mass: 0.28,
    restDelta: 0.001,
    restSpeed: 0.01,
  });

  const headerHeight = useElementHeight(headerRef);
  const heroReleaseY = useTransform(
    smoothedHeaderScrollProgress,
    [0, 0.25, 0.85, 1],
    [0, 0, -headerHeight, -headerHeight]
  );

  return (
    <section className={styles.section} aria-labelledby="gaps-title">
      <div className={styles.heroShell}>
        <motion.header
          className={`${styles.header}${stackingEnabled ? ` ${styles.headerSticky}` : ''}`}
          ref={headerRef}
          style={stackingEnabled ? { y: heroReleaseY } : undefined}
        >
          <div
            ref={identityRef}
            className={`${styles.decorativeWord} ${styles.identityDecorative}`}
            data-visible={identityVisible}
            aria-hidden="true"
          >
            <span className={styles.wordCovered}>GAPS</span>
            <span className={styles.wordExposed}>GAPS</span>
          </div>

          <div className={styles.intro}>
            <p
              className={`${styles.kicker} ${styles.identityKicker}`}
              data-visible={identityVisible}
            >
              GAPS
            </p>

            <h2
              className={`${styles.heading} ${styles.identityHeading}`}
              data-visible={identityVisible}
              id="gaps-title"
            >
              <span className={styles.heroLine}>What gets left</span>
              <span className={styles.heroLine}>
                <span className={styles.unText}>un</span>
                <span className={styles.doneText}>DONE.</span>
              </span>
            </h2>
          </div>
        </motion.header>
      </div>

      <div
        className={`${styles.problems}${
          stackingEnabled ? ` ${styles.stackingActive}` : ` ${styles.reducedMotion}`
        }`}
      >
        <div className={styles.stackStartMarker} ref={stackStartMarkerRef} aria-hidden="true" />

        <div className={styles.stackStage} ref={stackStageRef}>
          {problems.map((problem, index) => (
            <StackingProblem
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
