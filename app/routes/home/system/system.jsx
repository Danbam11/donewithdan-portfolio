import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useHydrated } from '~/hooks/useHydrated';
import { createHaircutDoneWorkflow } from './haircutdone/haircutdone-workflow';
import './haircutdone/haircutdone-workflow.css';
import styles from './system.module.css';

export function SystemWorkflowSpike() {
  const hostRef = useRef(null);
  const controllerRef = useRef(null);
  const pendingInitializationRef = useRef(false);
  const mountedRef = useRef(false);
  const destroyOnResolveRef = useRef(false);
  const ambientRunningRef = useRef(false);
  const isHydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const [instanceEpoch, setInstanceEpoch] = useState(0);
  const [controllerReady, setControllerReady] = useState(false);
  const [ambientRunning, setAmbientRunning] = useState(false);
  const [visibilityGating, setVisibilityGating] = useState(false);
  const [hostWidth, setHostWidth] = useState(null);
  const [error, setError] = useState(null);

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
    if (!visibilityGating || !controllerReady || !hostRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          startAmbient();
        } else if (entry.intersectionRatio === 0) {
          stopAmbient();
        }
      },
      { threshold: [0, 0.15] }
    );

    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [controllerReady, startAmbient, stopAmbient, visibilityGating]);

  const handleReinitialize = useCallback(() => {
    if (pendingInitializationRef.current) return;

    destroyController();
    setInstanceEpoch(epoch => epoch + 1);
  }, [destroyController]);

  return (
    <section className={styles.spike} aria-labelledby="system-spike-title">
      <div className={styles.context}>
        <p className={styles.eyebrow}>SYSTEM SPIKE</p>
        <h2 id="system-spike-title">WorkflowBoard lifecycle mount</h2>
        <p>
          Isolated host for mount, containment, ambient controls, resize observation, and
          unmount cleanup. This is not the final SYSTEM section.
        </p>
      </div>

      <div className={styles.controls} aria-label="WorkflowBoard diagnostic controls">
        <button type="button" onClick={startAmbient} disabled={!controllerReady || reducedMotion}>
          Start ambient
        </button>
        <button type="button" onClick={stopAmbient} disabled={!controllerReady}>
          Stop ambient
        </button>
        <button
          type="button"
          onClick={() => setVisibilityGating(enabled => !enabled)}
          disabled={!controllerReady}
        >
          {visibilityGating ? 'Disable visibility gating' : 'Enable visibility gating'}
        </button>
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
                : ambientRunning
                  ? 'Ambient running'
                  : 'Ambient stopped'}
          {visibilityGating ? ' · visibility gating on' : ''}
          {hostWidth ? ` · host ${hostWidth}px` : ''}
        </output>
      </div>

      <div className={styles.viewport}>
        <div className={styles.sizingLayer}>
          <div className={styles.host} ref={hostRef} />
        </div>
      </div>
    </section>
  );
}
