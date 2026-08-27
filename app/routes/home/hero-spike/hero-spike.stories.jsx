import { useEffect, useRef, useState } from 'react';
import { HeroRuntimeSpike } from './hero-spike';

function ReviewSpace({ children }) {
  return (
    <div
      role="note"
      style={{
        display: 'grid',
        width: 1440,
        minHeight: 1100,
        placeItems: 'center',
        padding: 24,
        background: 'var(--background)',
        color: 'var(--textBody)',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

function CleanupReview() {
  const [mounted, setMounted] = useState(true);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 10,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          padding: 12,
          borderRadius: 8,
          background: 'rgb(0 0 0 / 80%)',
          color: '#f7ffff',
        }}
      >
        <button
          style={{
            padding: '10px 14px',
            border: '1px solid rgb(247 255 255 / 35%)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
          type="button"
          onClick={() => setMounted(value => !value)}
        >
          {mounted ? 'Unmount Hero' : 'Remount Hero'}
        </button>
        <span>Use repeatedly to inspect canvas/context cleanup.</span>
      </div>
      {mounted ? (
        <HeroRuntimeSpike diagnostics exactDesktop initialEntrance={false} />
      ) : (
        <ReviewSpace>HERO UNMOUNTED</ReviewSpace>
      )}
    </>
  );
}

function InitialEntranceReview(props) {
  const [run, setRun] = useState(0);

  return (
    <>
      <HeroRuntimeSpike autoRotate={false} exactDesktop key={run} {...props} />
      <div
        style={{
          display: 'flex',
          width: 1440,
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <button type="button" onClick={() => setRun(value => value + 1)}>
          Replay Initial Entrance
        </button>
      </div>
    </>
  );
}

function FitPreview({ fitMode = 'contain', initialEntrance = false, ...props }) {
  const containerRef = useRef();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;

    const updateScale = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const scaleMethod = fitMode === 'cover' ? Math.max : Math.min;
      setScale(scaleMethod(width / 1440, height / 1000));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [fitMode]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '100vh',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        background: '#000',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 1440,
          height: 1000,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        <HeroRuntimeSpike exactDesktop initialEntrance={initialEntrance} {...props} />
      </div>
    </div>
  );
}

export default {
  title: 'Home/Hero Runtime Spike',
  component: HeroRuntimeSpike,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    baseRotationX: 1.02,
    baseRotationY: -0.62,
    baseRotationZ: -0.1,
    pointerRotationStrength: 7,
    wireframePreview: false,
  },
  argTypes: {
    baseRotationX: {
      control: { type: 'number', min: -3.14, max: 3.14, step: 0.01 },
    },
    baseRotationY: {
      control: { type: 'number', min: -3.14, max: 3.14, step: 0.01 },
    },
    baseRotationZ: {
      control: { type: 'number', min: -3.14, max: 3.14, step: 0.01 },
    },
    pointerRotationStrength: {
      control: { type: 'number', min: 0, max: 12, step: 0.25 },
    },
    wireframePreview: {
      control: 'boolean',
    },
  },
};

export const Desktop1440InitialEntrance = args => <InitialEntranceReview {...args} />;

export const Desktop1440StandbyRuntime = args => (
  <HeroRuntimeSpike exactDesktop initialEntrance={false} {...args} />
);

export const Desktop1440FitPreview = args => <FitPreview {...args} />;

export const HeroFinalFullView = args => (
  <HeroRuntimeSpike
    {...args}
    autoRotate
    fullView
    initialEntrance
    wireframePreview={false}
  />
);
HeroFinalFullView.storyName = 'Hero Final — Full View';

export const HeroFinalExact1440 = args => (
  <HeroRuntimeSpike
    exactDesktop
    {...args}
    autoRotate
    initialEntrance
    wireframePreview={false}
  />
);
HeroFinalExact1440.storyName = 'Hero Final — Exact 1440';

export const Desktop1440WireframePreview = args => (
  <HeroRuntimeSpike exactDesktop initialEntrance={false} {...args} wireframePreview />
);

export const GeometryDebug = args => (
  <HeroRuntimeSpike
    autoRotate={false}
    debugGeometry
    diagnostics
    exactDesktop
    initialEntrance={false}
    {...args}
  />
);

export const OffscreenAndHiddenTab = () => (
  <>
    <ReviewSpace>SCROLL DOWN TO BRING THE HERO RAF INTO VIEW.</ReviewSpace>
    <HeroRuntimeSpike diagnostics exactDesktop initialEntrance={false} />
    <ReviewSpace>
      HERO IS OFFSCREEN — THE RUNTIME SHOULD REPORT A PAUSED STATE ON RETURN.
    </ReviewSpace>
  </>
);

export const ReducedMotion = () => (
  <HeroRuntimeSpike diagnostics exactDesktop reducedMotion />
);

export const CleanupAndRemount = () => <CleanupReview />;

export const WebglFailure = () => (
  <HeroRuntimeSpike diagnostics exactDesktop forceWebglFailure />
);
