import { TabletHero, tabletHeroGeometry } from './tablet-hero';

export default {
  title: 'Home/Tablet Hero',
  component: TabletHero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    autoRotate: true,
    initialEntrance: true,
    liveBlob: true,
  },
  argTypes: {
    autoRotate: { control: 'boolean' },
    initialEntrance: { control: 'boolean' },
    liveBlob: { control: 'boolean' },
  },
};

export const TabletFinal = args => (
  <TabletHero
    {...args}
    height={tabletHeroGeometry.viewport.height}
    width={tabletHeroGeometry.viewport.width}
  />
);
TabletFinal.storyName = 'Tablet Final — 834 × 1112';

export const TabletFinalReducedMotion = () => (
  <TabletHero
    autoRotate={false}
    initialEntrance={false}
    reducedMotion
    width={tabletHeroGeometry.viewport.width}
    height={tabletHeroGeometry.viewport.height}
  />
);
TabletFinalReducedMotion.storyName = 'Tablet Final — Reduced Motion';

export const TabletFinalWebglFailure = () => (
  <TabletHero
    autoRotate={false}
    forceWebglFailure
    initialEntrance={false}
    width={tabletHeroGeometry.viewport.width}
    height={tabletHeroGeometry.viewport.height}
  />
);
TabletFinalWebglFailure.storyName = 'Tablet Final — WebGL Failure';

export const TabletStaticBlobComparison = args => (
  <TabletHero
    {...args}
    height={tabletHeroGeometry.viewport.height}
    liveBlob={false}
    width={tabletHeroGeometry.viewport.width}
  />
);
TabletStaticBlobComparison.storyName = 'Tablet 834 — Static Blob Comparison';
