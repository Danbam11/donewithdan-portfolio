import { StoryContainer } from '../../../../.storybook/story-container';
import { HaircutDone } from './haircutdone';

export default {
  title: 'Home/HaircutDone',
};

export const Default = () => (
  <StoryContainer padding={0}>
    <HaircutDone />
  </StoryContainer>
);
