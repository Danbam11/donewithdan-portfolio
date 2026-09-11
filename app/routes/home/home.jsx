import { baseMeta } from '~/utils/meta';
import { Gaps } from './gaps';
import { HaircutDone } from './haircutdone';
import { HeroSection } from './hero-section/hero-section';
import { ProfileApprovedResponsive } from './profile-approved';
import { SystemWorkflow } from './system/system';
import config from '~/config.json';
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
    description: `Design portfolio of ${config.name} — a product designer working on web & mobile apps with a focus on motion, experience design, and accessibility.`,
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