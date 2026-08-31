import { ProfileApprovedComposition } from './profile-approved';
import styles from './profile-approved.module.css';

const reviewViewports = {
  master1270: { name: 'Master — 1270 × 1110', styles: { width: '1270px', height: '1110px' } },
  desktop1440: { name: 'Desktop Full Frame — 1440', styles: { width: '1440px', height: '1110px' } },
  desktop1920: { name: 'Desktop Full Frame — 1920', styles: { width: '1920px', height: '1110px' } },
};

const FullFrame = ({ scale, offset, height }) => (
  <div className={styles.fullFrame} style={{ minHeight: height }}>
    <div
      className={styles.fullFrameComposition}
      style={{ transform: `translateX(${offset}px) scale(${scale})` }}
    >
      <ProfileApprovedComposition />
    </div>
  </div>
);

export default {
  title: 'Home/ProfileApproved',
  component: ProfileApprovedComposition,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop1440',
      viewports: reviewViewports,
    },
  },
};

export const Master1270 = () => <ProfileApprovedComposition />;
Master1270.storyName = 'Master — 1270 × 1110';
Master1270.parameters = { viewport: { defaultViewport: 'master1270', viewports: reviewViewports } };

export const Desktop1440 = () => <FullFrame scale={1} offset={170} height={1110} />;
Desktop1440.storyName = 'Desktop Full Frame — 1440';

export const Desktop1920 = () => <FullFrame scale={4 / 3} offset={680 / 3} height={1480} />;
Desktop1920.storyName = 'Desktop Full Frame — 1920';

export const MotionReview = {
  args: { animationKey: 0 },
  render: ({ animationKey }) => <ProfileApprovedComposition animationKey={animationKey} />,
};
MotionReview.storyName = 'Motion Review — change animationKey to replay';
MotionReview.parameters = { viewport: { defaultViewport: 'master1270', viewports: reviewViewports } };
