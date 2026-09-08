import { motion, useReducedMotion, useTransform } from 'framer-motion';
import headlinerIcon from '~/assets/case-study/headliner-icon.svg';
import brushSource from '~/assets/case-study/inkbrush-back-navigation.svg?raw';
import styles from './opening-rest.module.css';

const brush = brushSource
  .replace(/viewBox="[^"]*"/, 'viewBox="18.307953 89.204919 173.149988 98.770081"')
  .replace('aria-label="A back navigation"', 'aria-hidden="true"');

const reveal = {
  hidden: {
    opacity: 0,
    filter: 'blur(10px)',
    y: -50,
  },
  visible: delay => ({
    opacity: [0, 0.5, 1],
    filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
    y: [-50, 5, 0],
    transition: {
      duration: 0.9,
      delay,
      times: [0, 0.5, 1],
      ease: 'linear',
    },
    transitionEnd: { filter: 'none' },
  }),
};

const exitDestinations = Array.from({ length: 11 }, (_, index) => -300 + index * 60);

function ScrollExitLetter({ children, destination, progress }) {
  const left = useTransform(progress, [0, 1], [0, destination]);

  return <motion.span style={{ position: 'relative', left }}>{children}</motion.span>;
}

function ScrollExitWord({ children, startIndex, progress }) {
  if (!progress) return children;

  return [...children].map((letter, index) => (
    <ScrollExitLetter
      destination={exitDestinations[startIndex + index]}
      progress={progress}
      key={`${letter}-${index}`}
    >
      {letter}
    </ScrollExitLetter>
  ));
}

export function HaircutDoneBackBrush({ animated = false, className = '' }) {
  const reducedMotion = useReducedMotion();
  const playIntro = animated && !reducedMotion;
  const BackBrush = playIntro ? motion.span : 'span';
  const backBrushRevealProps = playIntro
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 1.15, duration: 0.9, ease: 'linear' },
      }
    : {};

  return (
    <button
      type="button"
      className={`${styles.back} ${className}`.trim()}
      aria-label="Back navigation unavailable during build"
    >
      <BackBrush
        className={styles.brush}
        aria-hidden="true"
        {...backBrushRevealProps}
        dangerouslySetInnerHTML={{ __html: brush }}
      />
    </button>
  );
}

export function HaircutDoneOpeningRest({
  animated = false,
  showBack = true,
  onIntroComplete,
  scrollExitProgress,
  style,
}) {
  const reducedMotion = useReducedMotion();
  const playIntro = animated && !reducedMotion;
  const HeadlinerIcon = playIntro ? motion.img : 'img';
  const Description = playIntro ? motion.p : 'p';
  const revealProps = delay =>
    playIntro ? { initial: 'hidden', animate: 'visible', variants: reveal, custom: delay } : {};
  const introCompletionProps = playIntro ? { onAnimationComplete: onIntroComplete } : {};

  return (
    <section
      className={styles.canvas}
      style={style}
      aria-label="HaircutDone case study opening"
    >
      <h1 className={styles.heading} aria-label="HAIRCUTDONE">
        {playIntro ? (
          <span className={styles.haircut} aria-hidden="true">
            <motion.span
              style={{ display: 'inline-block' }}
              {...revealProps(0)}
            >
              <ScrollExitWord startIndex={0} progress={scrollExitProgress}>HAIR</ScrollExitWord>
            </motion.span><motion.span
              style={{ display: 'inline-block', marginLeft: '-2.59375px' }}
              {...revealProps(0.28)}
            >
              <ScrollExitWord startIndex={4} progress={scrollExitProgress}>CUT</ScrollExitWord>
            </motion.span>
          </span>
        ) : (
          <span className={styles.haircut}>HAIRCUT</span>
        )}
        {playIntro ? (
          <motion.span className={styles.done} {...revealProps(0.56)}>
            <ScrollExitWord startIndex={7} progress={scrollExitProgress}>DONE</ScrollExitWord>
          </motion.span>
        ) : (
          <span className={styles.done}>DONE</span>
        )}
      </h1>

      <HeadlinerIcon
        className={styles.headlinerIcon}
        src={headlinerIcon}
        width={157}
        height={342}
        alt=""
        {...revealProps(0.84)}
      />

      <Description
        className={styles.description}
        {...revealProps(1.15)}
        {...introCompletionProps}
      >
        From haircut quiz to follow-up,
        <br />
        the full customer journey—DONE.
      </Description>

      {showBack && <HaircutDoneBackBrush animated={animated} />}
    </section>
  );
}
