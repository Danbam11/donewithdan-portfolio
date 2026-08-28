import { Toolstrip } from './toolstrip-variant-c';

export default {
  title: 'Toolstrip',
  component: Toolstrip,
  parameters: {
    layout: 'fullscreen',
  },
};

const StoryFrame = ({ children }) => (
  <div
    style={{
      display: 'grid',
      minHeight: '100vh',
      width: '100%',
      alignItems: 'center',
      padding: '32px',
      background: '#070a0e',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

export const DesktopGlowVariantC = () => (
  <StoryFrame>
    <Toolstrip glowVariant="react-bits" />
  </StoryFrame>
);
DesktopGlowVariantC.storyName = 'Desktop Glow Variant C — React Bits';
