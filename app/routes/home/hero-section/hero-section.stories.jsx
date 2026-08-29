import { HeroSection } from './hero-section';

const reviewViewports = {
  mobile320: {
    name: 'Mobile 320',
    styles: { width: '320px', height: '693px' },
    type: 'mobile',
  },
  mobile696: {
    name: 'Mobile boundary 696',
    styles: { width: '696px', height: '900px' },
    type: 'mobile',
  },
  tablet697: {
    name: 'Tablet boundary 697',
    styles: { width: '697px', height: '900px' },
    type: 'tablet',
  },
  tablet1040: {
    name: 'Tablet boundary 1040',
    styles: { width: '1040px', height: '1112px' },
    type: 'tablet',
  },
  desktop1041: {
    name: 'Desktop boundary 1041',
    styles: { width: '1041px', height: '1000px' },
    type: 'desktop',
  },
  desktop1440: {
    name: 'Desktop 1440',
    styles: { width: '1440px', height: '1000px' },
    type: 'desktop',
  },
};

export default {
  title: 'Home/Hero Section',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop1440',
      viewports: reviewViewports,
    },
  },
};

export const ResponsiveProduction = () => <HeroSection />;
ResponsiveProduction.storyName = 'Hero Section — Responsive Production';
