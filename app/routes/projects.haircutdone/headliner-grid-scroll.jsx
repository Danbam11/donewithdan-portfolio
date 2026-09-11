import {
  animate,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HaircutDoneBackBrush, HaircutDoneOpeningRest } from './opening-rest';
import {
  HaircutDoneScreenshotCard,
  HaircutDoneScreenshotGridRest,
  haircutDoneScreenshots,
} from './screenshot-grid-rest';
import styles from './headliner-grid-scroll.module.css';

const columns = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];

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

const clampProgress = value => Math.min(1, Math.max(0, value));
const GRID_TRAVEL_START = 0.11;
const GRID_TRAVEL_END = 0.88;
const GRID_SCALE_START = 3.35277777777778;
const GRID_SCALE_END = 1;
const GRID_Y_START = 1596.46666666667;
const GRID_Y_END = 0;
const GRID_INSPECTION_ANCHOR = 0.9;
const MASTER_WIDTH = 1440;
const MASTER_GRID = { left: 96, width: 1248 };
const mapElementCenter = ({ left, width }, targetWidth) =>
  ((left + width / 2) / MASTER_WIDTH) * targetWidth - width / 2;
const gridTravelProgress = value =>
  clampProgress((value - GRID_TRAVEL_START) / (GRID_TRAVEL_END - GRID_TRAVEL_START));
const gridScaleForProgress = value => {
  if (value <= GRID_TRAVEL_START) return GRID_SCALE_START;
  if (value >= GRID_TRAVEL_END) return GRID_SCALE_END;

  const t = gridTravelProgress(value);

  return GRID_SCALE_START + (GRID_SCALE_END - GRID_SCALE_START) * t;
};
const gridYForProgress = value => {
  if (value <= GRID_TRAVEL_START) return GRID_Y_START;
  if (value >= GRID_TRAVEL_END) return GRID_Y_END;

  const t = gridTravelProgress(value);

  return GRID_Y_START + (GRID_Y_END - GRID_Y_START) * t;
};
const removeIdentityTransform = (latest, generated) =>
  Number.parseFloat(latest.x) === 0 && Number.parseFloat(latest.y) === 0
    ? 'none'
    : generated;

function ChoreographedCard({
  beforeOpen,
  getZoomTarget,
  screenshot,
  rowIndex,
  direction,
  progress,
  zoomable,
}) {
  const distance = direction === 0 ? 0 : (rowIndex + 1) * 40 + rowIndex * 100;
  const x = useTransform(
    progress,
    [0, 0.286, 0.66, 0.88, 1],
    [
      `${direction * distance}%`,
      `${direction * distance}%`,
      `${direction * distance * 0.18}%`,
      '0%',
      '0%',
    ]
  );
  const y = useTransform(
    progress,
    [0, 0.286, 0.66, 0.88, 1],
    [`${distance}%`, `${distance}%`, `${distance * 0.18}%`, '0%', '0%']
  );

  return (
    <motion.div
      className={styles.cardMotion}
      style={direction === 0 ? undefined : { x, y }}
      transformTemplate={direction === 0 ? undefined : removeIdentityTransform}
    >
      <HaircutDoneScreenshotCard
        beforeOpen={beforeOpen}
        getZoomTarget={getZoomTarget}
        screenshot={screenshot}
        zoomable={zoomable}
      />
    </motion.div>
  );
}

export function HaircutDoneHeadlinerGridScroll({
  webLayout = null,
  showFloatingBack = true,
}) {
  const stageRef = useRef(null);
  const gridCompositionRef = useRef(null);
  const alignmentInProgressRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const [introComplete, setIntroComplete] = useState(Boolean(reducedMotion));
  const [heroClearForInspection, setHeroClearForInspection] = useState(
    Boolean(reducedMotion)
  );
  const gridInView = useInView(gridCompositionRef, { amount: 'some' });
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end end'],
  });
  const heroProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 36,
    mass: 0.3,
    restDelta: 0.0005,
    restSpeed: 0.01,
  });
  const gridProgress = useSpring(scrollYProgress, {
    stiffness: 190,
    damping: 32,
    mass: 0.38,
    restDelta: 0.0005,
    restSpeed: 0.01,
  });
  const leftBaseProgress = useTransform(scrollYProgress, value =>
    clampProgress(value * 1.1)
  );
  const centerBaseProgress = useTransform(scrollYProgress, value =>
    clampProgress(value * 1.01)
  );
  const rightBaseProgress = useTransform(scrollYProgress, value =>
    clampProgress(value * 1.1)
  );
  const leftProgress = useSpring(leftBaseProgress, {
    stiffness: 155,
    damping: 28,
    mass: 0.42,
    restDelta: 0.0005,
    restSpeed: 0.01,
  });
  const centerProgress = useSpring(centerBaseProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.32,
    restDelta: 0.0005,
    restSpeed: 0.01,
  });
  const rightProgress = useSpring(rightBaseProgress, {
    stiffness: 145,
    damping: 27,
    mass: 0.44,
    restDelta: 0.0005,
    restSpeed: 0.01,
  });

  const heroExitProgress = useTransform(heroProgress, [0, 0.3], [0, 1]);
  const heroY = useTransform(heroProgress, [0, 0.3], [0, -520]);
  const heroOpacity = useTransform(heroProgress, [0, 0.08, 0.14, 0.2], [1, 0.9, 0.4, 0]);
  const heroVisibility = useTransform(heroProgress, value =>
    value >= 0.2 ? 'hidden' : 'visible'
  );
  const poleX = useTransform(heroProgress, [0, 0.3], ['0px', '360px']);
  const descriptionY = useTransform(heroProgress, [0, 0.3], ['0px', '-110px']);

  const gridScale = useTransform(gridProgress, gridScaleForProgress);
  const gridY = useTransform(gridProgress, gridYForProgress);

  const syncHeroClearForInspection = useCallback(
    value => setHeroClearForInspection(Boolean(reducedMotion) || value >= 0.2),
    [reducedMotion]
  );

  useMotionValueEvent(heroProgress, 'change', syncHeroClearForInspection);

  useEffect(() => {
    syncHeroClearForInspection(heroProgress.get());
  }, [heroProgress, syncHeroClearForInspection]);

  const isVisualGeometryReady = useCallback(
    () =>
      gridProgress.get() >= GRID_TRAVEL_END &&
      leftProgress.get() >= 0.88 &&
      centerProgress.get() >= 0.888 &&
      rightProgress.get() >= 0.88,
    [centerProgress, gridProgress, leftProgress, rightProgress]
  );

  const isInspectionGeometryReady = useCallback(() => {
    const rawProgress = scrollYProgress.get();

    return (
      rawProgress >= GRID_TRAVEL_END &&
      rawProgress < 1 &&
      isVisualGeometryReady()
    );
  }, [isVisualGeometryReady, scrollYProgress]);

  const waitForInspectionGeometry = useCallback(() => {
    if (isVisualGeometryReady()) return Promise.resolve(true);

    return new Promise(resolve => {
      const cleanupFns = [];
      let timeoutId;
      let finished = false;

      const finish = result => {
        if (finished) return;

        finished = true;
        cleanupFns.forEach(cleanup => cleanup());
        window.clearTimeout(timeoutId);
        resolve(result);
      };
      const check = () => {
        if (isVisualGeometryReady()) finish(true);
      };

      cleanupFns.push(
        gridProgress.on('change', check),
        leftProgress.on('change', check),
        centerProgress.on('change', check),
        rightProgress.on('change', check)
      );
      timeoutId = window.setTimeout(() => finish(false), 1500);
      check();
    });
  }, [centerProgress, gridProgress, isVisualGeometryReady, leftProgress, rightProgress]);

  const getGridZoomTarget = useCallback(() => {
  const grid = gridCompositionRef.current;
  if (!grid) return null;

  const rect = grid.getBoundingClientRect();
  const bleed = 4;

  return {
    left: rect.left - bleed,
    top: rect.top - bleed,
    width: rect.width + bleed * 2,
    height: rect.height + bleed * 2,
  };
}, []);

  const prepareGridForInspection = useCallback(async () => {
    if (reducedMotion) return true;
    if (alignmentInProgressRef.current) return false;

    alignmentInProgressRef.current = true;

    try {
      if (isInspectionGeometryReady()) return true;

      const stage = stageRef.current;
      if (!stage) return false;

      const stageRect = stage.getBoundingClientRect();
      const stageTop = window.scrollY + stageRect.top;
      const scrollRange = stageRect.height - window.innerHeight;
      const targetScrollY = stageTop + scrollRange * GRID_INSPECTION_ANCHOR;
      const startScrollY = window.scrollY;
      const distance = Math.abs(targetScrollY - startScrollY);
      const durationScale = webLayout?.scale ?? 1;
      const duration = Math.min(
        0.75,
        Math.max(0.35, 0.35 + distance / (2000 * durationScale))
      );

      if (distance > 1) {
        await new Promise(resolve => {
          animate(startScrollY, targetScrollY, {
            duration,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: latest => {
              window.scrollTo({ top: latest, left: 0, behavior: 'auto' });
            },
            onComplete: resolve,
          });
        });
      } else {
        window.scrollTo({ top: targetScrollY, left: 0, behavior: 'auto' });
      }

      return await waitForInspectionGeometry();
    } finally {
      alignmentInProgressRef.current = false;
    }
  }, [isInspectionGeometryReady, reducedMotion, waitForInspectionGeometry, webLayout]);

  const gridInspectionAvailable =
    Boolean(reducedMotion) || (heroClearForInspection && gridInView);

  const leftColumnX = useTransform(leftProgress, [0, 0.286, 0.66, 0.88, 1], [-28, -28, -8, 0, 0]);
  const leftColumnY = useTransform(leftProgress, [0, 0.286, 0.66, 0.88, 1], [96, 96, 22, 0, 0]);
  const centerColumnY = useTransform(centerProgress, [0, 0.263, 0.69, 0.888, 1], [20, 20, 7, 0, 0]);
  const rightColumnX = useTransform(rightProgress, [0, 0.286, 0.66, 0.88, 1], [28, 28, 8, 0, 0]);
  const rightColumnY = useTransform(rightProgress, [0, 0.286, 0.66, 0.88, 1], [110, 110, 25, 0, 0]);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const webMasterWidth = webLayout
    ? webLayout.viewportWidth / webLayout.scale
    : MASTER_WIDTH;
  const webPlacementStyle = webLayout
    ? {
        '--haircutdone-web-master-width': `${webMasterWidth}px`,
        '--haircutdone-grid-left': `${mapElementCenter(
          MASTER_GRID,
          webMasterWidth
        )}px`,
        '--haircutdone-hero-group-offset': `${
          (webMasterWidth - MASTER_WIDTH) / 2
        }px`,
      }
    : undefined;

  useEffect(() => {
    if (reducedMotion) {
      setIntroComplete(true);
      return undefined;
    }

    if (introComplete) return undefined;

    const preventScroll = event => event.preventDefault();
    const preventScrollKeys = event => {
      if (scrollKeys.has(event.key)) event.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', preventScrollKeys, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('keydown', preventScrollKeys);
    };
  }, [introComplete, reducedMotion]);

  if (reducedMotion) {
    if (webLayout) {
      const masterScaleStyle = {
        transform: `scale(${webLayout.scale})`,
      };

      return (
        <div
          className={`${styles.page} ${styles.webPage}`}
          style={{ width: webLayout.viewportWidth }}
        >
          {showFloatingBack && <HaircutDoneBackBrush className={styles.floatingBack} />}
          <div
            className={styles.webReducedOpening}
            style={{
              width: webLayout.viewportWidth,
              height: webLayout.viewportHeight,
            }}
          >
            <div
              className={styles.webReducedOpeningMaster}
              style={{
                ...masterScaleStyle,
                top: webLayout.viewportOffsetY,
                width: webMasterWidth,
                ...webPlacementStyle,
              }}
            >
              <HaircutDoneOpeningRest
                animated
                showBack={false}
                style={webPlacementStyle}
              />
            </div>
          </div>
          <div
            className={styles.webReducedGrid}
            style={{
              width: webLayout.viewportWidth,
              height: webLayout.scaledMasterViewportHeight,
            }}
          >
            <div
              className={styles.webReducedMaster}
              style={{
                ...masterScaleStyle,
                width: webMasterWidth,
                ...webPlacementStyle,
              }}
            >
              <HaircutDoneScreenshotGridRest zoomable runtimeZoomTarget />
            </div>
          </div>
          <div
            className={styles.webContinuation}
            style={{
              width: webLayout.viewportWidth,
              height: webLayout.continuationHeight,
            }}
            aria-hidden="true"
          />
        </div>
      );
    }

    return (
      <div className={`${styles.page} ${styles.reducedPage}`}>
        {showFloatingBack && <HaircutDoneBackBrush className={styles.floatingBack} />}
        <HaircutDoneOpeningRest animated showBack={false} />
        <HaircutDoneScreenshotGridRest zoomable />
        <div className={styles.continuation} aria-hidden="true" />
      </div>
    );
  }

  const masterViewportContent = (
    <>
      <motion.div
        className={`${styles.heroLayer} ${introComplete ? styles.heroLayerReady : ''}`}
        style={{
          y: heroY,
          opacity: heroOpacity,
          visibility: heroVisibility,
          '--pole-x': poleX,
          '--description-y': descriptionY,
        }}
      >
        <HaircutDoneOpeningRest
          animated
          showBack={false}
          onIntroComplete={handleIntroComplete}
          scrollExitProgress={heroExitProgress}
          style={webPlacementStyle}
        />
      </motion.div>

      <motion.div
        ref={gridCompositionRef}
        className={styles.gridComposition}
        style={{ scale: gridScale, y: gridY }}
      >
        {columns.map((column, columnIndex) => {
          const columnStyle = [
            { x: leftColumnX, y: leftColumnY },
            { y: centerColumnY },
            { x: rightColumnX, y: rightColumnY },
          ][columnIndex];

          return (
            <motion.div
              className={`${styles.column} ${styles[`column${columnIndex + 1}`]}`}
              style={columnStyle}
              key={columnIndex}
            >
              {column.map((screenshotIndex, rowIndex) => {
                const screenshot = haircutDoneScreenshots[screenshotIndex];
                const direction = columnIndex - 1;
                const columnProgress = [leftProgress, centerProgress, rightProgress][columnIndex];

                return (
                  <ChoreographedCard
                    beforeOpen={prepareGridForInspection}
                    getZoomTarget={webLayout ? getGridZoomTarget : undefined}
                    screenshot={screenshot}
                    rowIndex={rowIndex}
                    direction={direction}
                    progress={columnProgress}
                    zoomable={gridInspectionAvailable}
                    key={screenshot.title}
                  />
                );
              })}
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );

  if (webLayout) {
    return (
      <div
        className={`${styles.page} ${styles.webPage}`}
        style={{ width: webLayout.viewportWidth }}
      >
        {showFloatingBack && <HaircutDoneBackBrush animated className={styles.floatingBack} />}
        <section
          ref={stageRef}
          className={styles.webStage}
          style={{
            width: webLayout.viewportWidth,
            height: webLayout.stageHeight,
          }}
          aria-label="HaircutDone screenshot scroll choreography"
        >
          <div
            className={styles.webStickyViewport}
            style={{
              width: webLayout.viewportWidth,
              height: webLayout.viewportHeight,
            }}
          >
            <div
              className={styles.webViewportOffset}
              style={{
                top: webLayout.viewportOffsetY,
                width: webLayout.viewportWidth,
                height: webLayout.scaledMasterViewportHeight,
              }}
            >
              <div
                className={styles.webMasterViewport}
                style={{
                  ...webPlacementStyle,
                  width: webMasterWidth,
                  transform: `scale(${webLayout.scale})`,
                }}
              >
                {masterViewportContent}
              </div>
            </div>
          </div>
        </section>

        <div
          className={styles.webContinuation}
          style={{
            width: webLayout.viewportWidth,
            height: webLayout.continuationHeight,
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {showFloatingBack && <HaircutDoneBackBrush animated className={styles.floatingBack} />}
      <section
        ref={stageRef}
        className={styles.stage}
        aria-label="HaircutDone screenshot scroll choreography"
      >
        <div className={styles.stickyViewport}>
          {masterViewportContent}
        </div>
      </section>

      <div className={styles.continuation} aria-hidden="true" />
    </div>
  );
}
