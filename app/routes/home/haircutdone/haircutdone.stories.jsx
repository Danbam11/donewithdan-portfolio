import { StoryContainer } from '../../../../.storybook/story-container';
import { HaircutDone } from './haircutdone';

const reviewViewports = {
  desktop1440: {
    name: 'Desktop 1440 × 1000',
    styles: { width: '1440px', height: '1000px' },
    type: 'desktop',
  },
  desktop1920: {
    name: 'Desktop 1920 × 1000',
    styles: { width: '1920px', height: '1000px' },
    type: 'desktop',
  },
  tablet834: {
    name: 'Tablet 834 × 1112',
    styles: { width: '834px', height: '1112px' },
    type: 'tablet',
  },
  mobile390: {
    name: 'Mobile 390 × 844',
    styles: { width: '390px', height: '844px' },
    type: 'mobile',
  },
  mobile414: {
    name: 'Mobile 414 × 896',
    styles: { width: '414px', height: '896px' },
    type: 'mobile',
  },
  mobile320: {
    name: 'Mobile 320',
    styles: { width: '320px', height: '693px' },
    type: 'mobile',
  },
};

export default {
  title: 'Home/HaircutDone',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop1440',
      viewports: reviewViewports,
    },
  },
};

export const Default = () => (
  <StoryContainer padding={0}>
    <HaircutDone />
  </StoryContainer>
);