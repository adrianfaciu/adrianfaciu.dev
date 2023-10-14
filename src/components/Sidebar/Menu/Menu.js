import React from 'react';
import { Link } from 'gatsby';
import * as styles from './Menu.module.scss';

const menuItem = item =>
  item.path.startsWith('http') ? externalLink(item) : internalLink(item);

const externalLink = item => (
  <li className={styles['menu__listItem']} key={item.path}>
    <a href={item.path} target="_blank">
      {item.label}
    </a>
  </li>
);

const internalLink = item => (
  <li className={styles['menu__listItem']} key={item.path}>
    <Link
      to={item.path}
      className={styles['menu__listItemLink']}
      activeClassName={styles['menu__listItemLinkActive']}
    >
      {item.label}
    </Link>
  </li>
);

const Menu = ({ menu }) => (
  <nav className={styles['menu']}>
    <ul className={styles['menu__list']}>{menu.map(item => menuItem(item))}</ul>
  </nav>
);

export default Menu;
