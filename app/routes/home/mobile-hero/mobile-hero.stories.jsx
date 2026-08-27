import { MobileHero, mobileHeroVariants } from './mobile-hero';

function MobileFinalStory({ variant, ...props }) {
  const dimensions = mobileHeroVariants[variant];

  return <MobileHero {...dimensions} {...props} />;
}

export default {
  title: 'Home/Mobile Hero',
  component: MobileHero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    autoRotate: true,
    initialEntrance: true,
  },
  argTypes: {
    autoRotate: { control: 'boolean' },
    initialEntrance: { control: 'boolean' },
  },
};

export const MobileFinal390Master = args => (
  <MobileFinalStory {...args} variant={390} />
);
MobileFinal390Master.storyName = 'Mobile Final — 390 × 844 MASTER';

export const MobileFinal320 = args => <MobileFinalStory {...args} variant={320} />;
MobileFinal320.storyName = 'Mobile Final — 320 × 693';

export const MobileFinal414 = args => <MobileFinalStory {...args} variant={414} />;
MobileFinal414.storyName = 'Mobile Final — 414 × 896';

export const Mobile390LiveBlobTest = args => (
  <MobileFinalStory {...args} liveBlob variant={390} />
);
Mobile390LiveBlobTest.storyName = 'Mobile 390 — Live Blob Test';

export const Mobile390ReducedMotion = () => (
  <MobileFinalStory autoRotate={false} initialEntrance={false} reducedMotion variant={390} />
);
Mobile390ReducedMotion.storyName = 'Mobile Final — Reduced Motion';

export const Mobile390WebglFailure = () => (
  <MobileFinalStory autoRotate={false} initialEntrance={false} forceWebglFailure variant={390} />
);
Mobile390WebglFailure.storyName = 'Mobile Final — WebGL Failure Fallback';

