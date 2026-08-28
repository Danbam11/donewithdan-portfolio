import { useEffect, useRef } from 'react';
import claudeCodeLogo from '~/assets/toolstrip/claude code.svg';
import claudeLogo from '~/assets/toolstrip/claude.svg';
import codexLogo from '~/assets/toolstrip/codex.svg';
import excalidrawLogo from '~/assets/toolstrip/excalidraw.svg';
import githubLogo from '~/assets/toolstrip/github.svg';
import googleWorkspaceLogo from '~/assets/toolstrip/google workspace.svg';
import gsapLogo from '~/assets/toolstrip/gsap.svg';
import highlevelLogo from '~/assets/toolstrip/highlevel.svg';
import kustomerLogo from '~/assets/toolstrip/kustomer.svg';
import n8nLogo from '~/assets/toolstrip/n8n.svg';
import penpotLogo from '~/assets/toolstrip/penpot.svg';
import slackLogo from '~/assets/toolstrip/slack.svg';
import visualStudioLogo from '~/assets/toolstrip/visual studio.svg';
import zapierLogo from '~/assets/toolstrip/zapier.svg';
import styles from './toolstrip.module.css';

const tools = [
  { name: 'Claude Code', logo: claudeCodeLogo },
  { name: 'Claude', logo: claudeLogo, logoScale: 1.35 },
  { name: 'Codex', logo: codexLogo },
  { name: 'Excalidraw', logo: excalidrawLogo },
  { name: 'GitHub', logo: githubLogo },
  {
    name: 'Google Workspace',
    logo: googleWorkspaceLogo,
    googleWorkspace: true,
    logoScale: 1.15,
  },
  { name: 'GSAP', logo: gsapLogo, logoScale: 1.45 },
  { name: 'GoHighLevel', logo: highlevelLogo, logoScale: 1.3 },
  { name: 'Kustomer', logo: kustomerLogo, logoOnly: true, logoScale: 2.35 },
  { name: 'n8n', logo: n8nLogo, logoScale: 1.25 },
  { name: 'Penpot', logo: penpotLogo, logoScale: 1.2 },
  { name: 'Slack', logo: slackLogo },
  { name: 'Visual Studio Code', logo: visualStudioLogo },
  { name: 'Zapier', logo: zapierLogo },
];

function ToolSequence({ hidden = false, sequenceIndex, onItemEnter }) {
  return (
    <ul className={styles.sequence} aria-hidden={hidden}>
      {tools.map((tool, itemIndex) => (
        <li
          className={`${styles.item} ${tool.logoOnly ? styles.itemLogoOnly : ''} ${
            tool.googleWorkspace ? styles.itemGoogleWorkspace : ''
          }`}
          key={tool.name}
          aria-label={tool.logoOnly ? tool.name : undefined}
          data-tool-item="true"
          data-tool-instance={`${sequenceIndex}-${itemIndex}`}
          onPointerEnter={event => onItemEnter(event.currentTarget)}
        >
          <span className={styles.itemContent}>
            <span
              className={styles.logo}
              style={{
                '--logo-image': `url("${tool.logo}")`,
                '--logo-scale': tool.logoScale ?? 1,
              }}
              aria-hidden="true"
            />
            {!tool.logoOnly && <span className={styles.name}>{tool.name}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Toolstrip({
  className = '',
  glowVariant = 'approved',
  showGlowDebug = false,
  interactive = true,
}) {
  const shellRef = useRef(null);
  const viewportRef = useRef(null);
  const activeItemRef = useRef(null);
  const pointerXRef = useRef(null);
  const pointerFrameRef = useRef(null);
  const glowCenterRef = useRef(null);
  const glowTransitionFrameRef = useRef(null);

  const supportsHover = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const updateGlow = (item, pointerX, animate = false) => {
    const shell = shellRef.current;
    const viewport = viewportRef.current;
    if (!shell || !viewport || !item) return;

    const shellRect = shell.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const allItems = Array.from(viewport.querySelectorAll('[data-tool-item]'));
    const itemIndex = allItems.indexOf(item);
    const previous = allItems[itemIndex - 1];
    const next = allItems[itemIndex + 1];
    const previousRect = previous?.getBoundingClientRect();
    const nextRect = next?.getBoundingClientRect();
    const spanStart = previousRect?.left ?? itemRect.left;
    const spanEnd = nextRect?.right ?? itemRect.right;
    const glowSpan =
      glowVariant === 'localized'
        ? Math.min(Math.max(itemRect.width * 1.8, 190), 330)
        : spanEnd - spanStart;

    const itemCenterX = itemRect.left + itemRect.width / 2 - shellRect.left;
    const glowCenterX =
      glowVariant === 'localized' ? itemCenterX : pointerX ?? itemCenterX;
    if (glowVariant === 'localized' && animate && glowCenterRef.current !== null) {
      if (glowTransitionFrameRef.current)
        cancelAnimationFrame(glowTransitionFrameRef.current);
      const start = glowCenterRef.current;
      const startedAt = performance.now();
      const duration = 320;
      const animateCenter = now => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        const next = start + (glowCenterX - start) * eased;
        shell.style.setProperty('--glow-x', `${next}px`);
        glowCenterRef.current = next;
        if (progress < 1)
          glowTransitionFrameRef.current = requestAnimationFrame(animateCenter);
        else glowTransitionFrameRef.current = null;
      };
      glowTransitionFrameRef.current = requestAnimationFrame(animateCenter);
    } else {
      shell.style.setProperty('--glow-x', `${glowCenterX}px`);
      glowCenterRef.current = glowCenterX;
    }
    shell.style.setProperty('--glow-span', `${glowSpan}px`);
    shell.style.setProperty('--glow-item-width', `${itemRect.width}px`);
    shell.style.setProperty(
      '--glow-x-ratio',
      `${Math.max(0, Math.min(100, (itemCenterX / shellRect.width) * 100))}%`
    );
    shell.style.setProperty('--glow-opacity', '1');
  };

  const clearActiveItem = () => {
    const shell = shellRef.current;
    if (!shell) return;

    if (pointerFrameRef.current) cancelAnimationFrame(pointerFrameRef.current);
    if (glowTransitionFrameRef.current)
      cancelAnimationFrame(glowTransitionFrameRef.current);
    pointerFrameRef.current = null;
    glowTransitionFrameRef.current = null;
    pointerXRef.current = null;
    activeItemRef.current = null;
    glowCenterRef.current = null;
    shell.removeAttribute('data-hovering');
    shell.querySelectorAll('[data-tool-item]').forEach(item => {
      item.removeAttribute('data-active');
      item.removeAttribute('data-neighbor');
    });
    shell.style.setProperty('--glow-opacity', '0');
  };

  const handleItemEnter = item => {
    if (!interactive || !supportsHover()) return;

    const shell = shellRef.current;
    if (!shell) return;
    activeItemRef.current = item;
    shell.setAttribute('data-hovering', 'true');
    shell.querySelectorAll('[data-tool-item]').forEach(candidate => {
      const isActive = candidate === item;
      const isNeighbor =
        candidate === item.previousElementSibling ||
        candidate === item.nextElementSibling;
      if (isActive) candidate.setAttribute('data-active', 'true');
      else candidate.removeAttribute('data-active');
      if (isNeighbor) candidate.setAttribute('data-neighbor', 'true');
      else candidate.removeAttribute('data-neighbor');
    });
    updateGlow(item, undefined, true);
  };

  const handlePointerMove = event => {
    if (
      !interactive ||
      !supportsHover() ||
      !activeItemRef.current ||
      glowVariant === 'localized'
    )
      return;
    pointerXRef.current = event.clientX;
    if (pointerFrameRef.current) return;

    pointerFrameRef.current = requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      updateGlow(activeItemRef.current, pointerXRef.current);
    });
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => viewport.toggleAttribute('data-offscreen', !entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(viewport);
    return () => {
      observer.disconnect();
      if (pointerFrameRef.current) cancelAnimationFrame(pointerFrameRef.current);
      if (glowTransitionFrameRef.current)
        cancelAnimationFrame(glowTransitionFrameRef.current);
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className={`${styles.shell} ${interactive ? styles.interactive : ''} ${
        glowVariant === 'localized' ? styles.variantB : ''
      } ${className}`.trim()}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerLeave={interactive ? clearActiveItem : undefined}
    >
      {glowVariant === 'localized' && (
        <svg
          className={styles.variantBGlowSvg}
          data-debug={showGlowDebug ? 'true' : undefined}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter
              id="toolstrip-variant-b-medium-blur"
              x="-30%"
              y="-100%"
              width="160%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter
              id="toolstrip-variant-b-bloom-blur"
              x="-50%"
              y="-200%"
              width="200%"
              height="500%"
            >
              <feGaussianBlur stdDeviation="28" />
            </filter>
          </defs>
          <rect
            className={`${styles.svgGlow} ${styles.svgBloom}`}
            x="1.5"
            y="1.5"
            width="97"
            height="97"
            rx="48.5"
            vectorEffect="non-scaling-stroke"
            filter="url(#toolstrip-variant-b-bloom-blur)"
          />
          <rect
            className={`${styles.svgGlow} ${styles.svgMedium}`}
            x="1.5"
            y="1.5"
            width="97"
            height="97"
            rx="48.5"
            vectorEffect="non-scaling-stroke"
            filter="url(#toolstrip-variant-b-medium-blur)"
          />
          <rect
            className={`${styles.svgGlow} ${styles.svgCore}`}
            x="1.5"
            y="1.5"
            width="97"
            height="97"
            rx="48.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <div
        ref={viewportRef}
        className={styles.viewport}
        role="region"
        aria-label="Tools used"
      >
        <div className={styles.track}>
          <ToolSequence sequenceIndex="primary" onItemEnter={handleItemEnter} />
          <ToolSequence sequenceIndex="duplicate" hidden onItemEnter={handleItemEnter} />
        </div>
      </div>
    </div>
  );
}

export { tools };
