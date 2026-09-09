import { HaircutDoneMobileOpeningShowcase } from './mobile-opening-showcase';

const haircutDoneMobile = {
  name: 'HaircutDone Mobile Master',
  styles: {
    width: '390px',
    height: '746px',
  },
};

export default {
  title: 'HaircutDone/Mobile',
  component: HaircutDoneMobileOpeningShowcase,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: { haircutDoneMobile },
      defaultViewport: 'haircutDoneMobile',
    },
  },
};

export const OpeningShowcaseStatic = {
  args: { motionEnabled: false, carouselEnabled: false },
};
OpeningShowcaseStatic.storyName = 'Opening + Showcase — Static';

export const OpeningShowcaseMotion = {
  args: { motionEnabled: true, carouselEnabled: false },
};
OpeningShowcaseMotion.storyName = 'Opening + Showcase — Motion';

export const OpeningShowcaseCarousel = {
  args: { motionEnabled: false, carouselEnabled: true },
};
OpeningShowcaseCarousel.storyName = 'Opening + Showcase — Carousel';
