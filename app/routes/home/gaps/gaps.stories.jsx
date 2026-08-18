import { Gaps } from './gaps';

export default {
  title: 'GAPS / Section',
  component: Gaps,
};

export const FinalStatic = () => <Gaps animateEntrance={false} />;

// Uses the existing desktop Section rail: 192px left offset and 128px right
// gutter at the 1440px laptop breakpoint, beside the fixed 48px navigation rail.
export const ProductionShell = () => <Gaps animateEntrance={false} />;

// Starts the entrance anchor below the viewport. Scroll only reaches the trigger;
// the reveal then runs once as a short timeline and leaves Card 01 on native scroll.
export const HeroEntranceReview = () => (
  <>
    <div aria-hidden="true" style={{ minHeight: '72vh' }} />
    <Gaps />
  </>
);

export const StackingMotionReview = () => (
  <>
    <div
      role="note"
      style={{
        display: 'grid',
        minHeight: '56vh',
        placeItems: 'center',
        padding: 24,
        color: 'var(--colorTextBody)',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        textAlign: 'center',
      }}
    >
      STORYBOOK-ONLY STACKING REVIEW CONTEXT — scroll through the completed hero and all three cards.
    </div>
    <Gaps />
  </>
);
