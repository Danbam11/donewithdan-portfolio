import { Toolstrip } from './toolstrip';

export default {
  title: 'Toolstrip',
  component: Toolstrip,
  parameters: {
    layout: 'fullscreen',
  },
};

const StoryFrame = ({ children, width = '100%' }) => (
  <div
    style={{
      display: 'grid',
      minHeight: '100vh',
      width,
      alignItems: 'center',
      padding: '32px',
      background: '#070a0e',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

export const DesktopRuntime = () => (
  <StoryFrame>
    <Toolstrip />
  </StoryFrame>
);

export const DesktopHoverPaused = () => (
  <StoryFrame>
    <div>
      <Toolstrip />
      <p
        role="note"
        style={{
          margin: '20px 0 0',
          color: '#a9b7bd',
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          textAlign: 'center',
        }}
      >
        STORYBOOK-ONLY: hover anywhere over the strip to pause the full marquee.
      </p>
    </div>
  </StoryFrame>
);

export const DesktopGlowVariantB = {
  args: {
    showGlowDebug: false,
  },
  argTypes: {
    showGlowDebug: {
      control: 'boolean',
      description: 'Storybook-only solid-color SVG layer diagnostic.',
    },
  },
  render: args => (
    <StoryFrame>
      <Toolstrip glowVariant="localized" showGlowDebug={args.showGlowDebug} />
    </StoryFrame>
  ),
};

export const TabletRuntime = () => (
  <StoryFrame width="768px">
    <Toolstrip interactive={false} />
  </StoryFrame>
);

export const MobileRuntime = () => (
  <StoryFrame width="390px">
    <Toolstrip interactive={false} />
  </StoryFrame>
);

export const ReducedMotion = () => (
  <StoryFrame>
    <Toolstrip />
  </StoryFrame>
);
