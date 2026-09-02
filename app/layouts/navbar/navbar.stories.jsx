import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navbar } from './navbar';

const StoryRouter = ({ Story }) => {
  const [router] = useState(() =>
    createMemoryRouter([{ path: '*', element: <Story /> }], {
      initialEntries: ['/'],
    })
  );

  return <RouterProvider router={router} />;
};

const withRouter = Story => <StoryRouter Story={Story} />;

export default {
  title: 'Layouts/Navbar',
  decorators: [withRouter],
  parameters: {
    docs: {
      description: {
        component:
          'Isolated DonewithDan navbar review. Use the responsive viewport to inspect the fixed desktop rail, mobile closed state, and mobile menu transition against the #0a0f10 rail surface.',
      },
    },
  },
};

const storyProps = { prefetch: 'none' };

export const Desktop = () => <Navbar {...storyProps} />;

export const MobileMenuClosed = () => <Navbar {...storyProps} />;

export const MobileMenuOpen = () => {
  useEffect(() => {
    const menu = document.querySelector('[aria-label="Menu"]');
    menu?.click();
  }, []);

  return <Navbar {...storyProps} />;
};
