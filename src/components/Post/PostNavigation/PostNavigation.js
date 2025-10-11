import React from 'react';
import { Link } from 'gatsby';
import * as styles from './PostNavigation.module.scss';

const PostNavigation = ({ previousPost, nextPost }) => {
  if (!previousPost && !nextPost) {
    return null;
  }

  return (
    <nav className={styles['navigation']}>
      <div className={styles['navigation__inner']}>
        {previousPost && (
          <Link
            to={previousPost.slug}
            className={styles['navigation__item']}
            rel="prev"
          >
            <span className={styles['navigation__label']}>← Previous</span>
            <span className={styles['navigation__title']}>
              {previousPost.title}
            </span>
          </Link>
        )}
        {nextPost && (
          <Link
            to={nextPost.slug}
            className={styles['navigation__itemNext']}
            rel="next"
          >
            <span className={styles['navigation__label']}>Next →</span>
            <span className={styles['navigation__title']}>
              {nextPost.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default PostNavigation;
