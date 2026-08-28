import { useEffect, useRef } from 'react';
import { tools } from '../toolstrip';
import styles from './toolstrip-variant-c.module.css';

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
  interactive = true,
}) {
  const shellRef = useRef(null);
  const viewportRef = useRef(null);
  const activeItemRef = useRef(null);
  const pointerXRef = useRef(null);
  const pointerFrameRef = useRef(null);
  const glowCenterRef = useRef(null);
  const glowSpanRef = useRef(null);
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
      glowVariant === 'react-bits'
        ? Math.min(Math.max(itemRect.width * 1.45, 150), 250)
        : glowVariant === 'localized'
        ? Math.min(Math.max(itemRect.width * 1.8, 190), 330)
        : spanEnd - spanStart;

    const itemCenterX = itemRect.left + itemRect.width / 2 - shellRect.left;
    const glowCenterX =
      glowVariant === 'localized' || glowVariant === 'react-bits'
        ? itemCenterX
        : pointerX ?? itemCenterX;
    if (glowVariant === 'react-bits' && animate && glowCenterRef.current !== null) {
      if (glowTransitionFrameRef.current)
        cancelAnimationFrame(glowTransitionFrameRef.current);
      const startX = glowCenterRef.current;
      const startSpan = glowSpanRef.current ?? glowSpan;
      const startedAt = performance.now();
      const duration = 420;
      const animateCenter = now => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const nextX = startX + (glowCenterX - startX) * eased;
        const nextSpan = startSpan + (glowSpan - startSpan) * eased;
        shell.style.setProperty('--glow-x', `${nextX}px`);
        shell.style.setProperty('--glow-span', `${nextSpan}px`);
        glowCenterRef.current = nextX;
        glowSpanRef.current = nextSpan;
        if (progress < 1)
          glowTransitionFrameRef.current = requestAnimationFrame(animateCenter);
        else glowTransitionFrameRef.current = null;
      };
      glowTransitionFrameRef.current = requestAnimationFrame(animateCenter);
    } else {
      shell.style.setProperty('--glow-x', `${glowCenterX}px`);
      shell.style.setProperty('--glow-span', `${glowSpan}px`);
      glowCenterRef.current = glowCenterX;
      glowSpanRef.current = glowSpan;
    }
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
    glowSpanRef.current = null;
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
      glowVariant !== 'approved' ||
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
      } ${glowVariant === 'react-bits' ? styles.variantC : ''} ${className}`.trim()}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerLeave={interactive ? clearActiveItem : undefined}
    >
      {glowVariant === 'react-bits' && (
        <>
          <span className={styles.variantCAmbient} aria-hidden="true" />
          <span className={styles.variantCEdgeLight} aria-hidden="true" />
        </>
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
