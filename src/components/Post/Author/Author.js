import React from 'react';
import { getContactHref } from '../../../utils';
import * as styles from './Author.module.scss';
import { useSiteMetadata } from '../../../hooks';

const Author = ({ title, slug }) => {
  const { author, url } = useSiteMetadata();

  return <div></div>;
};

export default Author;
