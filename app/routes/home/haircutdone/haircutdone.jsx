import haircutDoneQuizStart from '~/assets/haircutdone-quiz-start.png';
import { Button } from '~/components/button';
import { Heading } from '~/components/heading';
import { deviceModels } from '~/components/model/device-models';
import { Section } from '~/components/section';
import { Loader } from '~/components/loader';
import { Transition } from '~/components/transition';
import { useHydrated } from '~/hooks/useHydrated';
import { lazy, Suspense, useEffect, useState } from 'react';
import styles from './haircutdone.module.css';

const Model = lazy(() =>
  import('~/components/model').then(module => ({ default: module.Model }))
);

const laptopSizes = '(max-width: 696px) 92vw, (max-width: 1040px) 80vw, 58vw';

const usePointerMotionCapability = () => {
  const [enablePointerMotion, setEnablePointerMotion] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(min-width: 1041px) and (pointer: fine) and (hover: hover)'
    );
    const updatePointerMotion = () => setEnablePointerMotion(mediaQuery.matches);

    updatePointerMotion();
    mediaQuery.addEventListener?.('change', updatePointerMotion);

    return () => mediaQuery.removeEventListener?.('change', updatePointerMotion);
  }, []);

  return enablePointerMotion;
};

export function HaircutDone({ href }) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const isHydrated = useHydrated();
  const enablePointerMotion = usePointerMotionCapability();

  return (
    <Section className={styles.section} as="section" aria-labelledby="haircutdone-title">
      <div className={styles.content}>
        <div className={styles.mobileCanvas}>
          <div className={styles.details}>
          <Transition in={isHydrated}>
            {({ visible }) => (
              <>
                <div className={styles.decorativeWord} data-visible={visible} aria-hidden="true">
                  <span className={styles.wordCovered}>CASE</span>
                  <span className={styles.wordExposed}>CASE</span>
                </div>
                <div className={styles.intro}>
                  <p className={styles.eyebrow} data-visible={visible}>
                    CASE
                  </p>
                  <Heading
                    level={3}
                    as="h2"
                    className={styles.title}
                    data-visible={visible}
                    id="haircutdone-title"
                  >
                    <span className={styles.heroLine}>See how it</span>
                    <span className={styles.heroLine}>got</span>
                    <span className={styles.heroLine}>DONE.</span>
                  </Heading>
                  <div className={styles.cta} data-visible={visible}>
                    <Button iconEnd="arrow-right" iconHoverShift href={href}>
                      Explore HaircutDone
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Transition>
          </div>

          <div className={styles.preview}>
          {!modelLoaded && <Loader center className={styles.loader} />}
          {isHydrated && (
            <Suspense>
              <Model
                alt="HaircutDone style-match quiz displayed on a laptop"
                cameraPosition={{ x: 0, y: 0, z: 8 }}
                className={styles.model}
                onLoad={() => setModelLoaded(true)}
                enablePointerMotion={enablePointerMotion}
                showDelay={150}
                models={[
                  {
                    ...deviceModels.laptop,
                    texture: {
                      srcSet: `${haircutDoneQuizStart} 1280w`,
                      placeholder: haircutDoneQuizStart,
                      sizes: laptopSizes,
                    },
                  },
                ]}
              />
            </Suspense>
          )}
          </div>
        </div>

      </div>
    </Section>
  );
}
