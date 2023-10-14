import React from 'react';
import { getContactHref } from '../../../utils';
import styles from './Author.module.scss';
import { useSiteMetadata } from '../../../hooks';

const Author = ({ title, slug }) => {
  const { author, url } = useSiteMetadata();

  const shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url +
    slug}&via=${author.contacts.twitter}`;

  return (
    <div className={styles['author']}>
      <p className={styles['author__bio']}>
        <a
          className={styles['author__bio-twitter']}
          href={shareUrl}
          target="_blank"
        >
          Share on <strong>Twitter</strong>
        </a>
      </p>
      <p className={styles['author__bio']}>
        <a
          className={styles['author__bio-twitter']}
          href={getContactHref('twitter', author.contacts.twitter)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <strong>{author.name}</strong> on Twitter
        </a>
      </p>
    </div>
  );
};

export default Author;
