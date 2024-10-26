import React, { useState, useEffect } from 'react';
import * as styles from './Scroll.module.scss';

function isContentScrolled() {
  return window?.scrollY > 300;
}

const Scroll = () => {
  const [isVisible, setIsVisible] = useState(isContentScrolled());

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(isContentScrolled());

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <div className={styles['scroll']}>
          <button
            aria-label="Load new posts"
            role="button"
            className={styles['scrollButton']}
            onClick={scrollToTop}
          >
            <svg viewBox="0 0 448 512" height="19" width="19">
              <path
                fill="hsl(211, 20%, 95.3%)"
                d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"
              ></path>
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default Scroll;
