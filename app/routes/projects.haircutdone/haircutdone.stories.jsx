import { HaircutDoneOpeningRest } from './opening-rest';
import { HaircutDoneDesktopWebView } from './desktop-web-view';
import { HaircutDoneGridToLoomScroll } from './grid-to-loom-scroll';
import { HaircutDoneFooterRest } from './footer-rest';
import { HaircutDoneFullDesktopScroll } from './full-desktop-scroll';
import { HaircutDoneHeadlinerGridScroll } from './headliner-grid-scroll';
import { HaircutDoneLoomWalkthroughRest } from './loom-walkthrough-rest';
import { HaircutDoneScreenshotGridRest } from './screenshot-grid-rest';

const haircutDoneDesktop = {
  name: 'HaircutDone Desktop Master',
  styles: {
    width: '1440px',
    height: '800px',
  },
};

const footerRestPreview = {
  display: 'flex',
  alignItems: 'flex-end',
  width: '1440px',
  height: '800px',
  overflow: 'hidden',
  background: '#151515',
};

export default {
  title: 'HaircutDone/Desktop',
  component: HaircutDoneOpeningRest,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: { haircutDoneDesktop },
      defaultViewport: 'haircutDoneDesktop',
    },
  },
};

export const OpeningRest = {
  args: { animated: false },
};
OpeningRest.storyName = '01 Opening Rest';

export const OpeningIntro = {
  args: { animated: true },
};
OpeningIntro.storyName = '02 Opening Intro';

export const ScreenshotGridRest = {
  render: () => <HaircutDoneScreenshotGridRest />,
};
ScreenshotGridRest.storyName = '03 Screenshot Grid Rest';

export const HeadlinerGridScroll = {
  render: () => <HaircutDoneHeadlinerGridScroll />,
};
HeadlinerGridScroll.storyName = '04 Headliner + Grid Scroll';

export const LoomWalkthroughRest = {
  render: () => <HaircutDoneLoomWalkthroughRest live={false} animated={false} />,
};
LoomWalkthroughRest.storyName = '05 Loom Walkthrough Rest';

export const LoomWalkthroughLive = {
  render: () => <HaircutDoneLoomWalkthroughRest live animated />,
};
LoomWalkthroughLive.storyName = '06 Loom Walkthrough Live';

export const GridToLoomScroll = {
  render: () => <HaircutDoneGridToLoomScroll />,
};
GridToLoomScroll.storyName = '07 Grid → Loom Scroll';

export const ScreenshotZoomInteraction = {
  render: () => <HaircutDoneScreenshotGridRest zoomable />,
};
ScreenshotZoomInteraction.storyName = '08 Screenshot Zoom Interaction';

export const FooterRest = {
  render: () => (
    <div style={footerRestPreview}>
      <HaircutDoneFooterRest />
    </div>
  ),
};
FooterRest.storyName = '09 Footer Rest';

export const FullDesktopScroll = {
  render: () => <HaircutDoneFullDesktopScroll />,
};
FullDesktopScroll.storyName = '10 Full Desktop Scroll';

export const FullWeb1920 = {
  render: () => <HaircutDoneDesktopWebView />,
  parameters: {
    viewport: {
      defaultViewport: 'reset',
    },
  },
};
FullWeb1920.storyName = '11 Full Web 1920';
