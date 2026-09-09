import { HaircutDoneMobileLoom } from './mobile-loom';

const haircutDoneMobileLoom = {
  name: 'HaircutDone Mobile Loom',
  styles: {
    width: '390px',
    height: '437px',
  },
};

export default {
  title: 'HaircutDone/Mobile',
  component: HaircutDoneMobileLoom,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: { haircutDoneMobileLoom },
      defaultViewport: 'haircutDoneMobileLoom',
    },
  },
};

export const LoomStatic = {
  args: {
    revealEnabled: false,
  },
};
LoomStatic.storyName = 'Loom — Static';

export const LoomReveal = {
  args: {
    revealEnabled: true,
  },
};
LoomReveal.storyName = 'Loom — Reveal';
