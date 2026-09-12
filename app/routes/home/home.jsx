import { baseMeta } from '~/utils/meta';
import { Gaps } from './gaps';
import { HaircutDone } from './haircutdone';
import { HeroSection } from './hero-section/hero-section';
import { ProfileApprovedResponsive } from './profile-approved';
import { SystemWorkflow } from './system/system';
import styles from './home.module.css';

// Prefetch draco decoader wasm
export const links = () => {
  return [
    {
      rel: 'prefetch',
      href: '/draco/draco_wasm_wrapper.js',
      as: 'script',
      type: 'text/javascript',
      importance: 'low',
    },
    {
      rel: 'prefetch',
      href: '/draco/draco_decoder.wasm',
      as: 'fetch',
      type: 'application/wasm',
      importance: 'low',
    },
  ];
};

export const meta = () => {
  return baseMeta({
    title: 'Tech VA',
    description:
      'Tech VA portfolio focused on GoHighLevel systems, funnels, CRM automation, bookings, follow-ups, and smoother customer journeys.',
  });
};

export const Home = () => {
  return (
    <div className={styles.home}>
      <div id="hero">
        <HeroSection />
      </div>

      <SystemWorkflow perspectiveEntrance />

      <Gaps />

      <div id="projects">
        <HaircutDone href="/projects/haircutdone" />
      </div>

      <div id="profile" className={styles.profileSection}>
        <ProfileApprovedResponsive />
      </div>
    </div>
  );
};
