import { DecoderText } from '~/components/decoder-text';
import { VisuallyHidden } from '~/components/visually-hidden';
import { useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
import { throttle } from '~/utils/throttle';
import { cleanRenderer, cleanScene } from '~/utils/three';
import fragmentShader from './hero-spike-fragment.glsl?raw';
import vertexShader from './hero-spike-vertex.glsl?raw';
import styles from './hero-spike.module.css';

const capabilityWords = ['AUTOMATION', 'FUNNELS', 'WORKFLOWS'];

const shaderValues = {
  frequency: 3.955,
  amplitude: 0.476,
  speed: 0.123,
  warp: 0,
  twist: 4.064,
  spikes: 0.132,
  pulse: 0,
};

const springConfig = {
  stiffness: 48,
  damping: 24,
  mass: 1.8,
};

const cameraConfig = {
  fov: 50,
  position: [0, 0, 4.5],
};

const meshConfig = {
  rotation: [1.02, -0.62, -0.1],
  scale: 1.82,
};

const pointerRotationStrength = 7;

const footprint = {
  left: 510,
  top: -303,
  width: 1103,
  height: 1261,
};

const coverTiming = {
  dividerReveal: 800,
  doneDelay: 200,
  eyebrowDecode: 1400,
  entranceComplete: 2500,
  initialReveal: 1500,
  standbyDelay: 3200,
  cover: 700,
  concealedHold: 50,
  reveal: 700,
};

function BriefEyebrow({ animate, reduceMotion }) {
  const [resolved, setResolved] = useState(!animate || reduceMotion);

  useEffect(() => {
    if (!animate || reduceMotion) {
      setResolved(true);
      return undefined;
    }

    setResolved(false);
    const timer = window.setTimeout(() => setResolved(true), coverTiming.eyebrowDecode);
    return () => window.clearTimeout(timer);
  }, [animate, reduceMotion]);

  return resolved ? (
    'DONEWITHDAN · TECH VA'
  ) : (
    <DecoderText text="DONEWITHDAN · TECH VA" />
  );
}

function useRotatingCapability({ autoRotate, initialEntrance, reduceMotion }) {
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

    if (reduceMotion) {
      setCoverPhase('idle');
      return undefined;
    }

    setCoverPhase(initialEntrance ? 'initial' : 'idle');

    const scheduleCycle = delay => {
      schedule(() => {
        setCoverPhase('covering');
        schedule(() => {
          setWordIndex(index => (index + 1) % capabilityWords.length);
          setCoverPhase('revealing');
          schedule(() => {
            setCoverPhase('idle');
            scheduleCycle(coverTiming.standbyDelay);
          }, coverTiming.reveal);
        }, coverTiming.cover + coverTiming.concealedHold);
      }, delay);
    };

    if (initialEntrance) {
      schedule(() => {
        setWordIndex(0);
        setCoverPhase('idle');

        if (autoRotate) scheduleCycle(coverTiming.standbyDelay);
      }, coverTiming.entranceComplete);
    } else if (autoRotate) {
      scheduleCycle(coverTiming.standbyDelay);
    }

    return () => {
      active = false;
      timers.forEach(timer => window.clearTimeout(timer));
    };
  }, [autoRotate, initialEntrance, reduceMotion]);

  return {
    activeWord: capabilityWords[wordIndex],
    coverPhase,
  };
}

function TwistedBlobCanvas({
  baseRotationX,
  baseRotationY,
  baseRotationZ,
  heroRef,
  reduceMotion,
  forceWebglFailure,
  onStateChange,
  rotationStrength,
  wireframePreview,
}) {
  const canvasRef = useRef();
  const rotationOffsetX = useSpring(0, springConfig);
  const rotationOffsetY = useSpring(0, springConfig);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    let renderer;
    let scene;
    let camera;
    let group;
    let mesh;
    let geometry;
    let material;
    let animationFrame = 0;
    let lastFrameTime;
    let elapsedTime = 0;
    let isInViewport = true;
    let contextLost = false;
    let mounted = true;
    let basePosition = { x: 0, y: 0 };

    const setRuntimeState = state => {
      if (mounted) onStateChange(state);
    };

    const stopAnimation = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      lastFrameTime = undefined;
    };

    const shouldAnimate = () =>
      !reduceMotion &&
      isInViewport &&
      !document.hidden &&
      !contextLost &&
      Boolean(renderer);

    const updatePresentation = () => {
      if (!group || !mesh) return;

      group.position.set(basePosition.x, basePosition.y, 0);
      mesh.rotation.set(
        baseRotationX + rotationOffsetX.get(),
        baseRotationY + rotationOffsetY.get(),
        baseRotationZ
      );
    };

    const renderFrame = timestamp => {
      animationFrame = 0;

      if (!shouldAnimate()) return;

      if (lastFrameTime === undefined) lastFrameTime = timestamp;
      const delta = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
      lastFrameTime = timestamp;
      elapsedTime += delta;
      material.uniforms.uTime.value = elapsedTime;
      updatePresentation();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(renderFrame);
    };

    const syncAnimation = () => {
      if (shouldAnimate()) {
        setRuntimeState('running');
        if (!animationFrame) animationFrame = requestAnimationFrame(renderFrame);
      } else {
        stopAnimation();
        updatePresentation();
        renderer?.render(scene, camera);

        if (contextLost) setRuntimeState('webgl-context-lost');
        else if (reduceMotion) setRuntimeState('reduced-motion-static');
        else if (document.hidden) setRuntimeState('hidden-tab-paused');
        else if (!isInViewport) setRuntimeState('offscreen-paused');
      }
    };

    const resize = () => {
      if (!renderer || !hero) return;

      const width = hero.clientWidth;
      const height = hero.clientHeight;
      if (!width || !height) return;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const cameraDistance = camera.position.z - group.position.z;
      const worldHeight = 2 * cameraDistance * Math.tan((camera.fov * Math.PI) / 360);
      const worldWidth = worldHeight * camera.aspect;
      const footprintCenterX = footprint.left + footprint.width / 2;
      const footprintCenterY = footprint.top + footprint.height / 2;
      const normalizedX = footprintCenterX / 1440;
      const normalizedY = footprintCenterY / 1000;

      basePosition = {
        x: (normalizedX - 0.5) * worldWidth,
        y: (0.5 - normalizedY) * worldHeight,
      };

      updatePresentation();
      renderer.render(scene, camera);
    };

    const returnToRest = () => {
      rotationOffsetX.set(0);
      rotationOffsetY.set(0);
    };

    const handlePointerMove = throttle(event => {
      if (!isInViewport || document.hidden) return;

      const bounds = hero.getBoundingClientRect();
      const normalizedX = Math.max(
        -0.5,
        Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5)
      );
      const normalizedY = Math.max(
        -0.5,
        Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5)
      );
      const strengthRadians = (rotationStrength * Math.PI) / 180;

      rotationOffsetX.set(-normalizedY * 2 * strengthRadians);
      rotationOffsetY.set(-normalizedX * 2 * strengthRadians);
    }, 50);

    const handleVisibilityChange = () => {
      if (document.hidden) returnToRest();
      syncAnimation();
    };

    const handleContextLost = event => {
      event.preventDefault();
      contextLost = true;
      stopAnimation();
      setRuntimeState('webgl-context-lost');
    };

    let observer;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

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

      camera = new PerspectiveCamera(cameraConfig.fov, 1, 0.1, 100);
      camera.position.set(...cameraConfig.position);

      scene = new Scene();
      group = new Group();
      geometry = new SphereGeometry(1, 200, 200);
      material = new ShaderMaterial({
        fragmentShader,
        vertexShader,
        wireframe: wireframePreview,
        uniforms: {
          uTime: { value: 0 },
          uFrequency: { value: shaderValues.frequency },
          uAmplitude: { value: shaderValues.amplitude },
          uSpeed: { value: shaderValues.speed },
          uWarp: { value: shaderValues.warp },
          uTwist: { value: shaderValues.twist },
          uSpikes: { value: shaderValues.spikes },
          uPulse: { value: shaderValues.pulse },
        },
      });

      mesh = new Mesh(geometry, material);
      mesh.rotation.set(baseRotationX, baseRotationY, baseRotationZ);
      mesh.scale.setScalar(meshConfig.scale);
      group.add(mesh);
      scene.add(group);

      resize();
      setRuntimeState(reduceMotion ? 'reduced-motion-static' : 'ready');

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(
          ([entry]) => {
            isInViewport = entry.isIntersecting;
            if (!isInViewport) returnToRest();
            syncAnimation();
          },
          { threshold: 0.01 }
        );
        observer.observe(hero);
      }

      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      canvas.addEventListener('webglcontextlost', handleContextLost);

      if (finePointer && !reduceMotion) {
        hero.addEventListener('pointermove', handlePointerMove);
        hero.addEventListener('pointerleave', returnToRest);
        hero.addEventListener('pointercancel', returnToRest);
        window.addEventListener('blur', returnToRest);
      }

      syncAnimation();
    } catch {
      setRuntimeState('webgl-unavailable');
    }

    return () => {
      mounted = false;
      stopAnimation();
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      hero?.removeEventListener('pointermove', handlePointerMove);
      hero?.removeEventListener('pointerleave', returnToRest);
      hero?.removeEventListener('pointercancel', returnToRest);
      window.removeEventListener('blur', returnToRest);
      rotationOffsetX.stop();
      rotationOffsetY.stop();
      rotationOffsetX.jump(0);
      rotationOffsetY.jump(0);

      if (scene) cleanScene(scene);
      renderer?.renderLists?.dispose();
      renderer?.forceContextLoss?.();
      if (renderer) cleanRenderer(renderer);

      geometry = undefined;
      material = undefined;
      mesh = undefined;
      group = undefined;
      scene = undefined;
      camera = undefined;
      renderer = undefined;
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [
    baseRotationX,
    baseRotationY,
    baseRotationZ,
    forceWebglFailure,
    heroRef,
    onStateChange,
    reduceMotion,
    rotationOffsetX,
    rotationOffsetY,
    rotationStrength,
    wireframePreview,
  ]);

  return <canvas aria-hidden className={styles.canvas} ref={canvasRef} />;
}

export function HeroRuntimeSpike({
  autoRotate = true,
  baseRotationX = meshConfig.rotation[0],
  baseRotationY = meshConfig.rotation[1],
  baseRotationZ = meshConfig.rotation[2],
  debugGeometry = false,
  diagnostics = false,
  exactDesktop = false,
  forceWebglFailure = false,
  initialEntrance = true,
  pointerRotationStrength: rotationStrength = pointerRotationStrength,
  reducedMotion,
  wireframePreview = false,
}) {
  const heroRef = useRef();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = reducedMotion ?? prefersReducedMotion;
  const { activeWord, coverPhase } = useRotatingCapability({
    autoRotate,
    initialEntrance,
    reduceMotion,
  });
  const [runtimeState, setRuntimeState] = useState('initializing');

  return (
    <section
      aria-labelledby="hero-spike-title"
      className={styles.hero}
      data-exact-desktop={exactDesktop}
      data-reduce-motion={reduceMotion}
      ref={heroRef}
    >
      <TwistedBlobCanvas
        baseRotationX={baseRotationX}
        baseRotationY={baseRotationY}
        baseRotationZ={baseRotationZ}
        forceWebglFailure={forceWebglFailure}
        heroRef={heroRef}
        onStateChange={setRuntimeState}
        reduceMotion={reduceMotion}
        rotationStrength={rotationStrength}
        wireframePreview={wireframePreview}
      />
      <div aria-hidden className={styles.depthLayer} />
      <div aria-hidden className={styles.headlineDepthLayer} />
      <header className={styles.copy}>
        <p className={styles.eyebrow}>
          <BriefEyebrow animate={initialEntrance} reduceMotion={reduceMotion} />
        </p>
        <div className={styles.headlineScale}>
          <h1 className={styles.heading} id="hero-spike-title">
            <VisuallyHidden>
              Automation done. Capabilities also include funnels and workflows.
            </VisuallyHidden>
            <span aria-hidden className={styles.rotatingSlot}>
              <span
                className={styles.activeWord}
                data-initial={initialEntrance && !reduceMotion}
                data-word={activeWord}
              >
                {activeWord}
                <span className={styles.cover} data-phase={coverPhase} />
              </span>
            </span>
            <span aria-hidden className={styles.done}>
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
              data-initial={initialEntrance && !reduceMotion}
            />
          </h1>
        </div>
      </header>
      {debugGeometry && (
        <div aria-hidden className={styles.debugOverlay}>
          <span className={styles.debugEyebrow}>EYEBROW · 268,314 · 500×30</span>
          <span className={styles.debugCapability}>CAPABILITY · 268,344 · 859×144</span>
          <span className={styles.debugDone}>DONE · 268,488 · 473×168</span>
          <span className={styles.debugDivider}>DIVIDER · 268,654 · 473×2</span>
          <span className={styles.debugBlob}>BLOB · 510,-303 · 1103×1261</span>
        </div>
      )}
      {diagnostics && (
        <output className={styles.runtimeStatus}>BLOB RUNTIME · {runtimeState}</output>
      )}
    </section>
  );
}

export const heroSpikeRuntime = {
  cameraConfig,
  coverTiming,
  footprint,
  meshConfig,
  pointerRotationStrength,
  shaderValues,
};
