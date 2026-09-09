import { HaircutDoneMobileCaseStudy } from './mobile-case-study';

const haircutDoneSmallMobile = {
  name: 'HaircutDone Small Mobile — Device View',
  styles: {
    width: '320px',
    height: '568px',
  },
};

const haircutDoneMobileMaster = {
  name: 'HaircutDone Mobile Master',
  styles: {
    width: '390px',
    height: '746px',
  },
};

const haircutDoneLargeMobile = {
  name: 'HaircutDone Large Mobile — Device View',
  styles: {
    width: '414px',
    height: '896px',
  },
};

const haircutDoneTablet = {
  name: 'HaircutDone Tablet — Device View',
  styles: {
    width: '834px',
    height: '1194px',
  },
};

const proportionalViewports = {
  haircutDoneSmallMobile,
  haircutDoneMobileMaster,
  haircutDoneLargeMobile,
  haircutDoneTablet,
};

export default {
  title: 'HaircutDone/Mobile',
  component: HaircutDoneMobileCaseStudy,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: proportionalViewports,
      defaultViewport: 'haircutDoneMobileMaster',
    },
  },
};

export const FullCaseStudy320 = {
  args: { targetWidth: 320 },
  parameters: { viewport: { defaultViewport: 'haircutDoneSmallMobile' } },
};
FullCaseStudy320.storyName = 'Full Case Study — 320';

export const FullCaseStudyScroll = {
  args: { targetWidth: 390 },
};
FullCaseStudyScroll.storyName = 'Full Case Study — Scroll';

export const FullCaseStudy414 = {
  args: { targetWidth: 414 },
  parameters: { viewport: { defaultViewport: 'haircutDoneLargeMobile' } },
};
FullCaseStudy414.storyName = 'Full Case Study — 414';

export const FullCaseStudy834Tablet = {
  args: { targetWidth: 834 },
  parameters: { viewport: { defaultViewport: 'haircutDoneTablet' } },
};
FullCaseStudy834Tablet.storyName = 'Full Case Study — 834 Tablet';
