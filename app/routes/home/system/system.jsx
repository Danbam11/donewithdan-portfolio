import { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useHydrated } from '~/hooks/useHydrated';
import { createHaircutDoneWorkflow } from './haircutdone/haircutdone-workflow';
import './haircutdone/haircutdone-workflow.css';
import styles from './system.module.css';

const entranceSpring = {
  stiffness: 110,
  damping: 26,
  mass: 0.8,
};

const entranceSettleProgress = 0.42;

export function SystemWorkflowSpike({ perspectiveEntrance = false }) {
  const presentationStageRef = useRef(null);
  const hostRef = useRef(null);
  const controllerRef = useRef(null);
  const pendingInitializationRef = useRef(false);
  const mountedRef = useRef(false);
  const destroyOnResolveRef = useRef(false);
  const ambientRunningRef = useRef(false);
  const visibilityEligibleRef = useRef(false);
  const entranceSettledRef = useRef(false);
  const isHydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: presentationStageRef,
    offset: ['start 90%', 'end 18%'],
  });
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.36, entranceSettleProgress, 1], [18, 3, 0, 0]),
    entranceSpring
  );
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.36, entranceSettleProgress, 1], [0.9, 0.985, 1, 1]),
    entranceSpring
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.36, entranceSettleProgress, 1], [88, 16, 0, 0]),
    entranceSpring
  );
  const textY = useSpring(
    useTransform(scrollYProgress, [0, 0.36, entranceSettleProgress, 1], [0, -62, -72, -128]),
    entranceSpring
  );
  const [instanceEpoch, setInstanceEpoch] = useState(0);
  const [controllerReady, setControllerReady] = useState(false);
  const [ambientRunning, setAmbientRunning] = useState(false);
  const [visibilityGating, setVisibilityGating] = useState(false);
  const [hostWidth, setHostWidth] = useState(null);
  const [error, setError] = useState(null);
  const [compactLayout, setCompactLayout] = useState(false);
  const [entranceSettled, setEntranceSettled] = useState(false);

  const stopAmbient = useCallback(() => {
    const controller = controllerRef.current;

    if (!controller || !ambientRunningRef.current) return;

    controller.stopAmbient();
    ambientRunningRef.current = false;
    setAmbientRunning(false);
  }, []);

  const startAmbient = useCallback(() => {
    const controller = controllerRef.current;

    if (!controller || reducedMotion || ambientRunningRef.current) return;

    controller.startAmbient();
    ambientRunningRef.current = true;
    setAmbientRunning(true);
  }, [reducedMotion]);

  const markEntranceSettled = useCallback(() => {
    if (entranceSettledRef.current) return;

    entranceSettledRef.current = true;
    setEntranceSettled(true);
  }, []);

  const destroyController = useCallback(() => {
    stopAmbient();
    controllerRef.current?.destroy();
    controllerRef.current = null;
    ambientRunningRef.current = false;
    setControllerReady(false);
    setAmbientRunning(false);
  }, [stopAmbient]);

  useEffect(() => {
    if (!isHydrated || !hostRef.current) return undefined;

    mountedRef.current = true;
    destroyOnResolveRef.current = false;
    if (pendingInitializationRef.current) return undefined;
    pendingInitializationRef.current = true;
    setError(null);

    void createHaircutDoneWorkflow(hostRef.current, { autoStart: false })
      .then(controller => {
        pendingInitializationRef.current = false;

        if (!mountedRef.current || destroyOnResolveRef.current) {
          controller.destroy();
          return;
        }

        controllerRef.current = controller;
        ambientRunningRef.current = false;
        setControllerReady(true);
        setAmbientRunning(false);
      })
      .catch(initializationError => {
        pendingInitializationRef.current = false;
        setError(initializationError);
      });

    return () => {
      mountedRef.current = false;

      queueMicrotask(() => {
        if (mountedRef.current) return;

        destroyOnResolveRef.current = true;
        destroyController();
      });
    };
  }, [destroyController, instanceEpoch, isHydrated]);

  useEffect(() => {
    if (!hostRef.current || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(([entry]) => {
      setHostWidth(Math.round(entry.contentRect.width));
    });

    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) stopAmbient();
  }, [reducedMotion, stopAmbient]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateLayout = () => setCompactLayout(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);
    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  useEffect(() => {
    if (!perspectiveEntrance) return;

    if (reducedMotion || compactLayout || scrollYProgress.get() >= entranceSettleProgress) {
      markEntranceSettled();
    }
  }, [compactLayout, markEntranceSettled, perspectiveEntrance, reducedMotion, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, 'change', latest => {
    if (
      perspectiveEntrance &&
      !reducedMotion &&
      !compactLayout &&
      latest >= entranceSettleProgress
    ) {
      markEntranceSettled();
    }
  });

  useEffect(() => {
    if (perspectiveEntrance && entranceSettled && visibilityEligibleRef.current) {
      startAmbient();
    }
  }, [entranceSettled, perspectiveEntrance, startAmbient]);

  useEffect(() => {
    const visibilityGateActive = perspectiveEntrance || visibilityGating;

    if (!visibilityGateActive || !controllerReady || !hostRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          visibilityEligibleRef.current = true;

          if (!perspectiveEntrance || entranceSettledRef.current) startAmbient();
        } else if (entry.intersectionRatio === 0) {
          visibilityEligibleRef.current = false;
          stopAmbient();
        }
      },
      { threshold: [0, 0.15] }
    );

    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [controllerReady, perspectiveEntrance, startAmbient, stopAmbient, visibilityGating]);

  const handleReinitialize = useCallback(() => {
    if (pendingInitializationRef.current) return;

    destroyController();
    setInstanceEpoch(epoch => epoch + 1);
  }, [destroyController]);

  const useShowcaseMotion = perspectiveEntrance && !reducedMotion && !compactLayout;
  const workflowBoard = (
    <div className={styles.sizingLayer}>
      <div className={styles.host} ref={hostRef} />
    </div>
  );

  return (
    <section className={styles.spike} aria-labelledby="system-spike-title">
      <motion.div
        className={styles.context}
        style={useShowcaseMotion ? { y: textY } : undefined}
      >
        <p className={styles.eyebrow}>SYSTEM SPIKE</p>
        <h2 id="system-spike-title">
          {perspectiveEntrance ? 'WorkflowBoard perspective entrance' : 'WorkflowBoard lifecycle mount'}
        </h2>
        <p>
          {perspectiveEntrance
            ? 'SPIKE-ONLY scroll showcase. The board remains atomic while ambient work waits for its front-facing settlement.'
            : 'Isolated host for mount, containment, ambient controls, resize observation, and unmount cleanup. This is not the final SYSTEM section.'}
        </p>
      </motion.div>

      <div className={styles.controls} aria-label="WorkflowBoard diagnostic controls">
        <button
          type="button"
          onClick={startAmbient}
          disabled={!controllerReady || reducedMotion || (perspectiveEntrance && !entranceSettled)}
        >
          Start ambient
        </button>
        <button type="button" onClick={stopAmbient} disabled={!controllerReady}>
          Stop ambient
        </button>
        {!perspectiveEntrance && (
          <button
            type="button"
            onClick={() => setVisibilityGating(enabled => !enabled)}
            disabled={!controllerReady}
          >
            {visibilityGating ? 'Disable visibility gating' : 'Enable visibility gating'}
          </button>
        )}
        <button
          type="button"
          onClick={handleReinitialize}
          disabled={pendingInitializationRef.current}
        >
          Destroy and reinitialize
        </button>
        <output className={styles.status} aria-live="polite">
          {error
            ? 'Initialization failed'
            : !controllerReady
              ? 'Initializing…'
              : reducedMotion
              ? 'Static reduced-motion mode'
              : perspectiveEntrance && !entranceSettled
                ? 'Entrance settling'
              : ambientRunning
                  ? 'Ambient running'
                  : 'Ambient stopped'}
          {perspectiveEntrance
            ? ' · automatic visibility gating on'
            : visibilityGating
              ? ' · visibility gating on'
              : ''}
          {hostWidth ? ` · host ${hostWidth}px` : ''}
        </output>
      </div>

      {perspectiveEntrance ? (
        <div className={styles.presentationStage} ref={presentationStageRef}>
          <motion.div
            className={`${styles.presentationAnchor}${
              entranceSettled ? ` ${styles.presentationAnchorSettled}` : ''
            }`}
            style={useShowcaseMotion ? { rotateX, scale, y: translateY } : undefined}
          >
            <div className={styles.browserShell}>
              <div className={styles.browserChrome} aria-hidden="true">
                <span />
                <span />
                <span />
                <div className={styles.browserAddress} />
              </div>
              <div className={styles.browserViewport}>{workflowBoard}</div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className={styles.viewport}>{workflowBoard}</div>
      )}
    </section>
  );
}
