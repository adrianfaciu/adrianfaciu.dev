import React from 'react';
import moment from 'moment';
import * as styles from './Meta.module.scss';

const Meta = ({ date, readingTime }) => (
  <div className={styles['meta']}>
    <p className={styles['meta__date']}>
      Published {moment(date).format('D MMM YYYY')} - {readingTime.text}
    </p>
  </div>
);

export default Meta;
