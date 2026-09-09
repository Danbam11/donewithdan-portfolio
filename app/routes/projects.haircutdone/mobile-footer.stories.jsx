import { HaircutDoneMobileFooter } from './mobile-footer';

const haircutDoneMobileFooter = {
  name: 'HaircutDone Mobile Footer',
  styles: {
    width: '390px',
    height: '256px',
  },
};

const footerSubstrate = {
  width: '390px',
  height: '256px',
  overflow: 'hidden',
  background: '#151515',
};

export default {
  title: 'HaircutDone/Mobile',
  component: HaircutDoneMobileFooter,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: { haircutDoneMobileFooter },
      defaultViewport: 'haircutDoneMobileFooter',
    },
  },
};

export const FooterStatic = {
  render: () => (
    <div style={footerSubstrate} data-mobile-footer-element="story-substrate">
      <HaircutDoneMobileFooter />
    </div>
  ),
};
FooterStatic.storyName = 'Footer — Static';
