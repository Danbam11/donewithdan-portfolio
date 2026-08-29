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
import styles from './mobile-hero.module.css';

const capabilityWords = ['AUTOMATION', 'FUNNELS', 'WORKFLOWS'];

export const mobileHeroGeometry = {
  master: { width: 390, height: 844 },
  eyebrow: { left: 39, top: 356.8911917098444, width: 217, height: 14.145077720207155 },
  capability: { left: 39, top: 371.03626943005156, width: 312, height: 53 },
  done: { left: 39, top: 428.7046632124352, width: 148, height: 53 },
  divider: { left: 39, top: 486.37305699481885, width: 148, height: 1.0880829015541167 },
  blob: { left: 161, top: -6, width: 719, height: 821, borderRadius: 153.90560547186638 },
};

export const mobileHeroVariants = {
  320: { width: 320, height: 693, scale: 320 / 390 },
  390: { width: 390, height: 844, scale: 1 },
  414: { width: 414, height: 896, scale: 414 / 390 },
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

function BriefEyebrow({ animate, reduceMotion }) {
  return animate && !reduceMotion ? (
    <DecoderText text="DONEWITHDAN · TECH VA" />
  ) : (
    'DONEWITHDAN · TECH VA'
  );
}

function MobileBlobCanvas({
  height,
  live,
  reduceMotion,
  forceWebglFailure,
  onStateChange,
  width,
}) {
  const canvasRef = useRef();
  const runtimeRef = useRef();
  const behaviorRef = useRef({ live, onStateChange, reduceMotion });

  behaviorRef.current = { live, onStateChange, reduceMotion };

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
      if (mounted) behaviorRef.current.onStateChange(state);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const renderStatic = () => {
      if (!renderer || !scene || !camera) return;
      renderer.render(scene, camera);
    };

    const shouldAnimate = () => {
      const { live: isLive, reduceMotion: shouldReduceMotion } = behaviorRef.current;

      return (
        isLive &&
        !shouldReduceMotion &&
        inViewport &&
        !document.hidden &&
        !contextLost &&
        Boolean(renderer)
      );
    };

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
      const { live: isLive, reduceMotion: shouldReduceMotion } = behaviorRef.current;

      if (shouldAnimate()) {
        setState('running');
        if (!frame) frame = requestAnimationFrame(renderFrame);
        return;
      }

      stop();
      renderStatic();

      if (contextLost) setState('webgl-context-lost');
      else if (shouldReduceMotion) setState('reduced-motion-static');
      else if (!isLive) setState('static');
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

      camera = new PerspectiveCamera(blobCamera.fov, 1, 0.1, 100);
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
      mesh.scale.setScalar(1.82);
      mesh.position.set(1.62, 0.085, 0);
      group.add(mesh);
      scene.add(group);

      runtimeRef.current = {
        camera,
        renderStatic,
        renderer,
        scene,
        sync,
      };

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
      runtimeRef.current = undefined;
      observer?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      if (scene) cleanScene(scene);
      renderer?.renderLists?.dispose();
      if (renderer) cleanRenderer(renderer);
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [forceWebglFailure]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime || !width || !height) return;

    runtime.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    runtime.renderer.setSize(width, height, false);
    runtime.camera.aspect = width / height;
    runtime.camera.updateProjectionMatrix();
    runtime.renderStatic();
  }, [height, width]);

  useEffect(() => {
    runtimeRef.current?.sync();
  }, [live, onStateChange, reduceMotion]);

  return <canvas aria-hidden className={styles.blobCanvas} ref={canvasRef} />;
}

export function MobileHero({
  autoRotate = true,
  forceWebglFailure = false,
  height = mobileHeroVariants[390].height,
  initialEntrance = true,
  liveBlob = false,
  reducedMotion,
  scale = mobileHeroVariants[390].scale,
  width = mobileHeroVariants[390].width,
}) {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = reducedMotion ?? prefersReducedMotion;
  const { activeWord, coverPhase } = useCapabilityCycle({
    autoRotate,
    initialEntrance,
    reduceMotion,
  });
  const [blobState, setBlobState] = useState('initializing');
  const handleBlobState = useCallback(state => setBlobState(state), []);

  return (
    <div
      className={styles.reviewStage}
      style={{ '--stage-width': `${width}px`, '--stage-height': `${height}px` }}
    >
      <section
        aria-labelledby="mobile-hero-title"
        className={styles.viewport}
        data-blob-mode={liveBlob ? 'live' : 'static'}
        data-reduce-motion={Boolean(reduceMotion)}
        style={{ width, height }}
      >
        <div className={styles.canvasLayer}>
          <div aria-hidden className={styles.blobFallback} />
          <MobileBlobCanvas
            forceWebglFailure={forceWebglFailure}
            height={height}
            live={liveBlob}
            onStateChange={handleBlobState}
            reduceMotion={Boolean(reduceMotion)}
            width={width}
          />
        </div>
        <div className={styles.composition} style={{ transform: `scale(${scale})` }}>
          <div aria-hidden className={styles.depthLayer} />
          <div aria-hidden className={styles.headlineDepthLayer} />
          <header className={styles.copy}>
            <p className={styles.eyebrow} data-hero-geometry="eyebrow">
              <BriefEyebrow
                animate={initialEntrance}
                reduceMotion={Boolean(reduceMotion)}
              />
            </p>
            <h1 className={styles.heading} id="mobile-hero-title">
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
