import React from 'react';
import moment from 'moment';
import * as styles from './Meta.module.scss';

const Meta = ({ date, timeToRead }) => (
  <div className={styles['meta']}>
    <p className={styles['meta__date']}>
      Published {moment(date).format('D MMM YYYY')} - {timeToRead} min read
    </p>
  </div>
);

export default Meta;
