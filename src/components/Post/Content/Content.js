import React from 'react';
import * as styles from './Content.module.scss';
import Meta from '../Meta';

const Content = ({ body, title, date, readingTime }) => (
  <div className={styles['content']}>
    <h1 className={styles['content__title']}>{title}</h1>
    <Meta date={date} readingTime={readingTime} />
    <div
      className={styles['content__body']}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  </div>
);

export default Content;
