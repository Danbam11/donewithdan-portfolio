import { SystemWorkflow, SystemWorkflowSpike } from './system';

// Storybook spike-only: creates enough native page scroll to move the actual
// WorkflowBoard host fully outside the viewport for IntersectionObserver testing.
function OffscreenTestSpace({ position }) {
  return (
    <div
      role="note"
      style={{
        display: 'grid',
        minHeight: '120vh',
        placeItems: 'center',
        padding: 24,
        color: 'var(--colorTextBody)',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        textAlign: 'center',
      }}
    >
      SPIKE-ONLY {position} scroll space — move the WorkflowBoard fully offscreen to test
      visibility gating.
    </div>
  );
}

export default {
  title: 'SYSTEM / WorkflowBoard',
  component: SystemWorkflow,
};

export const ProductionDesktop = () => (
  <>
    <OffscreenTestSpace position="before — 170px desktop rail is reserved by SYSTEM" />
    <SystemWorkflow perspectiveEntrance />
    <OffscreenTestSpace position="after — inspect the settled board, description, and CTA" />
  </>
);

export const LifecycleMount = () => (
  <>
    <OffscreenTestSpace position="before" />
    <SystemWorkflowSpike diagnostics />
    <OffscreenTestSpace position="after" />
  </>
);

export const PerspectiveEntrance = () => (
  <>
    <OffscreenTestSpace position="before — approach until the outer board settles" />
    <SystemWorkflowSpike perspectiveEntrance diagnostics />
    <OffscreenTestSpace position="after — continue fully offscreen, then re-enter" />
  </>
);
