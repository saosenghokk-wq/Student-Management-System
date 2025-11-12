import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const scrollPositions = useRef({});

  useEffect(() => {
    // Prevent default scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Save current scroll position
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      scrollPositions.current[pathname] = mainContent.scrollTop;
    }

    return () => {
      // Prevent window scroll on unmount
      window.scrollTo(0, 0);
    };
  }, [pathname]);

  return null;
}
