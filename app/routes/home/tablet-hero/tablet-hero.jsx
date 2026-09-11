import { DecoderText } from '~/components/decoder-text';
import { VisuallyHidden } from '~/components/visually-hidden';
import { useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { cleanRenderer, cleanScene } from '~/utils/three';
import fragmentShader from '../hero-spike/hero-spike-fragment.glsl?raw';
import vertexShader from '../hero-spike/hero-spike-vertex.glsl?raw';
import styles from './tablet-hero.module.css';

const capabilityWords = ['AUTOMATION', 'FUNNELS', 'WORKFLOWS'];

export const tabletHeroGeometry = {
  viewport: { width: 834, height: 1112 },
  eyebrow: { left: 113, top: 429, width: 423.69, height: 27.63 },
  capability: { left: 113, top: 456.63, width: 608, height: 102 },
  done: { left: 113, top: 569.25, width: 287, height: 102 },
  divider: { left: 113, top: 681.88, width: 288.97, height: 2.12 },
  blob: { left: 220, top: 0, width: 920, height: 1050 },
};

const blobShaderValues = {
  frequency: 3.955,
  amplitude: 0.476,
  speed: 0.123,
  warp: 0,
  twist: 4.064,
  spikes: 0.132,
  pulse: 0,
};

const blobRotation = [1.02, -0.62, -0.1];
const blobPosition = [0.99, 0.12, 0];
const blobScale = 1.98;
const blobCamera = { fov: 50, position: [0, 0, 4.5] };

const coverTiming = {
  cover: 700,
  concealedHold: 50,
  reveal: 700,
  standbyDelay: 3200,
  entranceComplete: 2500,
};

function useCapabilityCycle({ autoRotate, initialEntrance, reduceMotion }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [coverPhase, setCoverPhase] = useState(
    initialEntrance && !reduceMotion ? 'initial' : 'idle'
  );

  useEffect(() => {
    const timers = [];
    let active = true;

    const schedule = (callback, delay) => {
      const timer = window.setTimeout(() => active && callback(), delay);
      timers.push(timer);
    };

    setWordIndex(0);
    setCoverPhase(initialEntrance && !reduceMotion ? 'initial' : 'idle');

    if (reduceMotion) {
      return () => timers.forEach(timer => window.clearTimeout(timer));
    }

    const cycle = () => {
      setCoverPhase('covering');
      schedule(() => {
        setWordIndex(index => (index + 1) % capabilityWords.length);
        setCoverPhase('revealing');
        schedule(() => {
          setCoverPhase('idle');
          if (autoRotate) schedule(cycle, coverTiming.standbyDelay);
        }, coverTiming.reveal);
      }, coverTiming.cover + coverTiming.concealedHold);
    };

    if (initialEntrance) {
      schedule(() => {
        setCoverPhase('idle');
        if (autoRotate) schedule(cycle, coverTiming.standbyDelay);
      }, coverTiming.entranceComplete);
    } else if (autoRotate) {
      schedule(cycle, coverTiming.standbyDelay);
    }

    return () => {
      active = false;
      timers.forEach(timer => window.clearTimeout(timer));
    };
  }, [autoRotate, initialEntrance, reduceMotion]);

  return { activeWord: capabilityWords[wordIndex], coverPhase };
}

function TabletEyebrow({ animate, reduceMotion }) {
  return animate && !reduceMotion ? (
    <DecoderText text="DONEWITHDAN · TECH VA" />
  ) : (
    'DONEWITHDAN · TECH VA'
  );
}

function TabletBlobCanvas({
  height,
  live,
  reduceMotion,
  forceWebglFailure,
  onStateChange,
  width,
}) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let renderer;
    let scene;
    let camera;
    let group;
    let mesh;
    let geometry;
    let material;
    let frame = 0;
    let inViewport = true;
    let contextLost = false;
    let mounted = true;
    let elapsed = 0;

    const setState = state => {
      if (mounted) onStateChange(state);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const renderStatic = () => {
      if (!renderer || !scene || !camera) return;
      renderer.render(scene, camera);
    };

    const shouldAnimate = () =>
      live &&
      !reduceMotion &&
      inViewport &&
      !document.hidden &&
      !contextLost &&
      Boolean(renderer);

    const renderFrame = timestamp => {
      frame = 0;
      if (!shouldAnimate()) return;

      elapsed = timestamp * 0.001;
      material.uniforms.uTime.value = elapsed;
      mesh.rotation.z = blobRotation[2] + elapsed * 0.02;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(renderFrame);
    };

    const sync = () => {
      if (shouldAnimate()) {
        setState('running');
        if (!frame) frame = requestAnimationFrame(renderFrame);
        return;
      }

      stop();
      renderStatic();

      if (contextLost) setState('webgl-context-lost');
      else if (reduceMotion) setState('reduced-motion-static');
      else if (!live) setState('static');
      else if (document.hidden) setState('hidden-tab-paused');
      else if (!inViewport) setState('offscreen-paused');
    };

    const handleVisibilityChange = () => sync();
    const handleContextLost = event => {
      event.preventDefault();
      contextLost = true;
      stop();
      setState('webgl-context-lost');
    };

    let observer;

    try {
      if (forceWebglFailure) throw new Error('Forced Storybook WebGL failure');

      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true,
      });
      renderer.outputColorSpace = SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);

      camera = new PerspectiveCamera(blobCamera.fov, width / height, 0.1, 100);
      camera.position.set(...blobCamera.position);

      scene = new Scene();
      group = new Group();
      geometry = new SphereGeometry(1, 128, 128);
      material = new ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uTime: { value: 0 },
          uFrequency: { value: blobShaderValues.frequency },
          uAmplitude: { value: blobShaderValues.amplitude },
          uSpeed: { value: blobShaderValues.speed },
          uWarp: { value: blobShaderValues.warp },
          uTwist: { value: blobShaderValues.twist },
          uSpikes: { value: blobShaderValues.spikes },
          uPulse: { value: blobShaderValues.pulse },
        },
      });

      mesh = new Mesh(geometry, material);
      mesh.rotation.set(...blobRotation);
      mesh.position.set(...blobPosition);
      mesh.scale.setScalar(blobScale);
      group.add(mesh);
      scene.add(group);

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(
          ([entry]) => {
            inViewport = entry.isIntersecting;
            sync();
          },
          { threshold: 0.01 }
        );
        observer.observe(canvas);
      }

      document.addEventListener('visibilitychange', handleVisibilityChange);
      canvas.addEventListener('webglcontextlost', handleContextLost);
      sync();
    } catch {
      setState('webgl-unavailable');
    }

    return () => {
      mounted = false;
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      if (scene) cleanScene(scene);
      renderer?.renderLists?.dispose();
      if (renderer) cleanRenderer(renderer);
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [forceWebglFailure, height, live, onStateChange, reduceMotion, width]);

  return <canvas aria-hidden className={styles.blobCanvas} ref={canvasRef} />;
}

export function TabletHero({
  autoRotate = true,
  forceWebglFailure = false,
  height = tabletHeroGeometry.viewport.height,
  initialEntrance = true,
  liveBlob = true,
  onShaderStateChange,
  reducedMotion,
  shaderRevealed = true,
  width = tabletHeroGeometry.viewport.width,
}) {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = reducedMotion ?? prefersReducedMotion;
  const { activeWord, coverPhase } = useCapabilityCycle({
    autoRotate,
    initialEntrance,
    reduceMotion,
  });
  const [blobState, setBlobState] = useState('initializing');
  const handleBlobState = useCallback(
    state => {
      setBlobState(state);
      onShaderStateChange?.(state);
    },
    [onShaderStateChange]
  );

  return (
    <div className={styles.reviewStage}>
      <section
        aria-labelledby="tablet-hero-title"
        className={styles.viewport}
        data-blob-mode={liveBlob ? 'live' : 'static'}
        data-reduce-motion={Boolean(reduceMotion)}
        style={{ width, height }}
      >
        <div
          className={styles.canvasLayer}
          data-shader-revealed={shaderRevealed}
          data-shader-state={blobState}
        >
          <div aria-hidden className={styles.blobFallback} />
          <TabletBlobCanvas
            forceWebglFailure={forceWebglFailure}
            height={height}
            live={liveBlob}
            onStateChange={handleBlobState}
            reduceMotion={Boolean(reduceMotion)}
            width={width}
          />
        </div>
        <div className={styles.composition}>
          <div aria-hidden className={styles.depthLayer} />
          <div aria-hidden className={styles.headlineDepthLayer} />
          <header className={styles.copy}>
            <p className={styles.eyebrow} data-hero-geometry="eyebrow">
              <TabletEyebrow
                animate={initialEntrance}
                reduceMotion={Boolean(reduceMotion)}
              />
            </p>
            <h1 className={styles.heading} id="tablet-hero-title">
              <VisuallyHidden>
                Automation done. Capabilities also include funnels and workflows.
              </VisuallyHidden>
              <span
                aria-hidden
                className={styles.capability}
                data-hero-geometry="capability"
              >
                <span
                  className={styles.activeWord}
                  data-initial={initialEntrance && !reduceMotion}
                >
                  {activeWord}
                  <span className={styles.cover} data-phase={coverPhase} />
                </span>
              </span>
              <span aria-hidden className={styles.done} data-hero-geometry="done">
                <span
                  className={styles.doneText}
                  data-initial={initialEntrance && !reduceMotion}
                >
                  DONE.
                  <span className={styles.doneCover} />
                </span>
              </span>
              <span
                aria-hidden
                className={styles.accentLine}
                data-hero-geometry="divider"
              />
            </h1>
          </header>
        </div>
        <output className={styles.runtimeStatus} data-hero-runtime-state>
          BLOB · {blobState}
        </output>
      </section>
    </div>
  );
}
