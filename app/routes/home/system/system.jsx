import { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Button } from '~/components/button';
import { useHydrated } from '~/hooks/useHydrated';
import { createHaircutDoneWorkflow } from './haircutdone/haircutdone-workflow';
import './haircutdone/haircutdone-workflow.css';
import styles from './system.module.css';

const PERSPECTIVE_START = Object.freeze({ rotateX: 18 });
const PERSPECTIVE_SETTLE_VIEWPORTS = 0.9;
const CONTENT_REVEAL_VIEWPORTS = 0.22;

export function SystemWorkflowSpike({ perspectiveEntrance = false, diagnostics = false }) {
  const presentationStageRef = useRef(null);
  const browserLayoutProbeRef = useRef(null);
  const browserShellRef = useRef(null);
  const hostRef = useRef(null);
  const controllerRef = useRef(null);
  const pendingInitializationRef = useRef(false);
  const mountedRef = useRef(false);
  const destroyOnResolveRef = useRef(false);
  const ambientRunningRef = useRef(false);
  const visibilityEligibleRef = useRef(false);
  const motionRangeActiveRef = useRef(false);
  const motionRangeRef = useRef({ start: 0, settle: 1, content: 1 });
  const identityRef = useRef(null);
  const belowBoardRef = useRef(null);
  const identityEnteredRef = useRef(false);
  const belowBoardEnteredRef = useRef(false);
  const isHydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [instanceEpoch, setInstanceEpoch] = useState(0);
  const [controllerReady, setControllerReady] = useState(false);
  const [ambientRunning, setAmbientRunning] = useState(false);
  const [visibilityGating, setVisibilityGating] = useState(false);
  const [hostWidth, setHostWidth] = useState(null);
  const [error, setError] = useState(null);
  const [compactLayout, setCompactLayout] = useState(false);
  const [motionRangeActive, setMotionRangeActive] = useState(false);
  const [motionRange, setMotionRange] = useState({ start: 0, settle: 1, content: 1 });
  const [motionGeometry, setMotionGeometry] = useState(null);
  const [perspectiveSettled, setPerspectiveSettled] = useState(false);
  const [identityEntered, setIdentityEntered] = useState(false);
  const [belowBoardEntered, setBelowBoardEntered] = useState(false);
  const perspectiveEnd = motionRange.start + motionRange.settle;
  const contentRevealEnd = perspectiveEnd + motionRange.content;
  const rotateX = useTransform(scrollY, [motionRange.start, perspectiveEnd], [18, 0]);
  const compositionY = useTransform(
    scrollY,
    [perspectiveEnd, contentRevealEnd],
    [0, motionGeometry?.finalShiftY ?? 0]
  );
  const contentOpacity = useTransform(scrollY, [perspectiveEnd, contentRevealEnd], [0, 1]);

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

  const beginMotionRange = useCallback(() => {
    if (motionRangeActiveRef.current || typeof window === 'undefined') return;

    const browserLayoutRect = browserLayoutProbeRef.current?.getBoundingClientRect();
    const browserRect = browserShellRef.current?.getBoundingClientRect();
    if (!browserLayoutRect || !browserRect) return;

    const viewportHeight = window.innerHeight;
    // The invisible probe keeps threshold and runway geometry independent of visual projection.
    const browserHeight = browserLayoutProbeRef.current.offsetHeight;
    const desiredGuardTop = viewportHeight * 0.2;
    const fitSafeTop = Math.max(16, viewportHeight - browserHeight - 16);
    const guardTopPx = Math.min(desiredGuardTop, fitSafeTop);
    const centeredTop = (viewportHeight - browserHeight) / 2;
    const finalTopPx = Math.min(112, Math.max(16, centeredTop));
    const finalShiftY = Math.min(0, finalTopPx - guardTopPx);

    const nextRange = {
      start: window.scrollY,
      settle: viewportHeight * PERSPECTIVE_SETTLE_VIEWPORTS,
      content: viewportHeight * CONTENT_REVEAL_VIEWPORTS,
    };
    const prePinTravel = Math.max(0, browserLayoutRect.top - guardTopPx);
    const requiredStickyRunway = Math.max(0, nextRange.settle + nextRange.content - prePinTravel);
    const nextGeometry = {
      browserHeight,
      guardTopPx,
      finalTopPx,
      finalShiftY,
      requiredStickyRunway,
    };

    if (import.meta.env.DEV) {
      console.debug('[SYSTEM WorkflowBoard scroll geometry]', {
        viewportWidth: window.innerWidth,
        viewportHeight,
        browserLayoutRectTop: browserLayoutRect.top,
        browserVisualRectTop: browserRect.top,
        browserHeight,
        motionStartScrollY: nextRange.start,
        guardTopPx,
        finalTopPx,
        finalShiftY,
        prePinTravel,
        settleDistance: nextRange.settle,
        contentRevealDistance: nextRange.content,
        requiredStickyRunway,
        perspectiveEnd: nextRange.start + nextRange.settle,
        contentRevealEnd: nextRange.start + nextRange.settle + nextRange.content,
      });
    }

    motionRangeActiveRef.current = true;
    motionRangeRef.current = nextRange;
    setMotionRange(nextRange);
    setMotionGeometry(nextGeometry);
    setMotionRangeActive(true);
    setPerspectiveSettled(false);
    startAmbient();
  }, [startAmbient]);

  const resetMotionRange = useCallback(() => {
    if (!motionRangeActiveRef.current) return;

    motionRangeActiveRef.current = false;
    setMotionRangeActive(false);
    setPerspectiveSettled(false);
    stopAmbient();
  }, [stopAmbient]);

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
        if (!diagnostics) {
          hostRef.current.style.maxWidth = 'none';
          hostRef.current
            .querySelector('.haircutdone-workflow-board')
            ?.style.setProperty('max-width', 'none');
        }
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
  }, [destroyController, diagnostics, instanceEpoch, isHydrated]);

  useEffect(() => {
    if (!hostRef.current || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(([entry]) => {
      setHostWidth(Math.round(entry.contentRect.width));
    });

    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) resetMotionRange();
  }, [reducedMotion, resetMotionRange]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Tablet and mobile are intentionally static compositions in Phase 1.
    // Desktop remains the only breakpoint that owns the approved scroll choreography.
    const mediaQuery = window.matchMedia('(max-width: 1040px)');
    const updateLayout = () => setCompactLayout(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);
    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  useEffect(() => {
    if (compactLayout) resetMotionRange();
  }, [compactLayout, resetMotionRange]);

  useEffect(() => {
    if (
      diagnostics ||
      !isHydrated ||
      reducedMotion ||
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
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(identityRef.current);
    return () => observer.disconnect();
  }, [diagnostics, isHydrated, reducedMotion]);

  useEffect(() => {
    if (
      diagnostics ||
      !isHydrated ||
      !compactLayout ||
      reducedMotion ||
      belowBoardEnteredRef.current ||
      !belowBoardRef.current
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.2) return;

        belowBoardEnteredRef.current = true;
        setBelowBoardEntered(true);
        observer.disconnect();
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(belowBoardRef.current);
    return () => observer.disconnect();
  }, [compactLayout, diagnostics, isHydrated, reducedMotion]);

  useEffect(() => {
    if (!controllerReady || !hostRef.current) return;

    hostRef.current.querySelectorAll('.haircutdone-workflow-node').forEach(node => {
      if (compactLayout) {
        node.setAttribute('tabindex', '-1');
        node.setAttribute('aria-disabled', 'true');
      } else {
        node.setAttribute('tabindex', '0');
        node.removeAttribute('aria-disabled');
      }
    });
  }, [compactLayout, controllerReady]);

  useMotionValueEvent(scrollY, 'change', latest => {
    if (!motionRangeActiveRef.current) return;

    const { start, settle } = motionRangeRef.current;
    setPerspectiveSettled(latest >= start + settle);
  });

  useEffect(() => {
    const visibilityGateActive = perspectiveEntrance || visibilityGating;

    const observedElement = compactLayout ? browserShellRef.current : browserLayoutProbeRef.current;

    if (!visibilityGateActive || !controllerReady || !observedElement) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (perspectiveEntrance && !reducedMotion && !compactLayout) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
            visibilityEligibleRef.current = true;
            beginMotionRange();
          } else if (
            entry.intersectionRatio < 0.9 &&
            window.scrollY < motionRangeRef.current.start
          ) {
            visibilityEligibleRef.current = false;
            resetMotionRange();
          }
          return;
        }

        const visibilityThreshold = compactLayout ? 0.3 : 0.15;

        if (entry.isIntersecting && entry.intersectionRatio >= visibilityThreshold) {
          visibilityEligibleRef.current = true;

          startAmbient();
        } else if (entry.intersectionRatio === 0) {
          visibilityEligibleRef.current = false;
          stopAmbient();
        }
      },
      { threshold: compactLayout ? [0, 0.3, 1] : [0, 0.15, 0.9, 1] }
    );

    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [
    beginMotionRange,
    compactLayout,
    controllerReady,
    perspectiveEntrance,
    reducedMotion,
    resetMotionRange,
    startAmbient,
    stopAmbient,
    visibilityGating,
  ]);

  const handleReinitialize = useCallback(() => {
    if (pendingInitializationRef.current) return;

    destroyController();
    setInstanceEpoch(epoch => epoch + 1);
  }, [destroyController]);

  const useShowcaseMotion = perspectiveEntrance && !reducedMotion && !compactLayout;
  const identityVisible = reducedMotion || identityEntered;
  const compactBelowBoardVisible = reducedMotion || belowBoardEntered;
  const workflowBoard = (
    <div className={styles.sizingLayer}>
      <div className={styles.host} ref={hostRef} />
    </div>
  );

  const diagnosticsContent = diagnostics ? (
    <>
      <div className={styles.context}>
        <p className={styles.eyebrow}>SYSTEM SPIKE</p>
        <h2 id="system-spike-title">
          {perspectiveEntrance ? 'WorkflowBoard perspective entrance' : 'WorkflowBoard lifecycle mount'}
        </h2>
        <p>
          {perspectiveEntrance
            ? 'SPIKE-ONLY scroll showcase. The board remains atomic while ambient work waits for its front-facing settlement.'
            : 'Isolated host for mount, containment, ambient controls, resize observation, and unmount cleanup. This is not the final SYSTEM section.'}
        </p>
      </div>
      <div className={styles.controls} aria-label="WorkflowBoard diagnostic controls">
        <button
          type="button"
          onClick={startAmbient}
          disabled={!controllerReady || reducedMotion || (perspectiveEntrance && !perspectiveSettled)}
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
              : perspectiveEntrance && !perspectiveSettled
                ? 'Perspective settling'
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
    </>
  ) : null;

  const boardPresentation = perspectiveEntrance ? (
    <div className={styles.presentationStage} ref={presentationStageRef}>
      <motion.div
        className={styles.presentationAnchor}
        style={useShowcaseMotion && motionRangeActive ? { y: compositionY } : undefined}
      >
        <div className={styles.browserLayoutProbe} ref={browserLayoutProbeRef} aria-hidden="true" />
        <div className={styles.browserPerspectiveStage}>
          <motion.div
            className={styles.browserPerspective}
            style={useShowcaseMotion ? (motionRangeActive ? { rotateX } : PERSPECTIVE_START) : undefined}
          >
            <div className={styles.browserShell} ref={browserShellRef}>
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
        {!diagnostics && (
          <motion.div
            className={styles.belowBoard}
            data-visible={compactLayout && compactBelowBoardVisible}
            ref={belowBoardRef}
            style={useShowcaseMotion ? { opacity: motionRangeActive ? contentOpacity : 0 } : undefined}
          >
            <p>
              A connected GoHighLevel journey for recommendations, booking, reminders, recovery,
              and follow-up.
            </p>
            <Button
              className={styles.cta}
              iconEnd="arrow-right"
              iconHoverShift
              href="/projects/haircutdone"
            >
              View the full system
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  ) : (
    <div className={styles.viewport}>{workflowBoard}</div>
  );

  return (
    <section
      className={`${styles.system}${diagnostics ? ` ${styles.diagnostic}` : ''}`}
      aria-labelledby={diagnostics ? 'system-spike-title' : 'system-title'}
      data-scroll-motion={useShowcaseMotion}
      style={
        motionGeometry
          ? {
              '--motionGuardTop': `${motionGeometry.guardTopPx}px`,
              '--motionStickyRunway': `${motionGeometry.requiredStickyRunway}px`,
            }
          : undefined
      }
    >
      {diagnosticsContent}
      {!diagnostics && (
        <>
          <p
            ref={identityRef}
            className={styles.decorative}
            data-visible={identityVisible}
            aria-hidden="true"
          >
            SYSTEM
          </p>
          <div className={styles.intro}>
            <p className={styles.eyebrow} data-visible={identityVisible}>SYSTEM</p>
            <h2 id="system-title" className={styles.headline} data-visible={identityVisible}>
              <span className={styles.oneJourney}>One journey.</span>
              <span className={styles.everyStep}>Every step,</span>
              <span className={styles.done}>DONE.</span>
            </h2>
          </div>
        </>
      )}

      {boardPresentation}
    </section>
  );
}

export function SystemWorkflow({ perspectiveEntrance = false }) {
  return <SystemWorkflowSpike perspectiveEntrance={perspectiveEntrance} />;
}
