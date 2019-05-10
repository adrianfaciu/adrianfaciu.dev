// @flow
import React from 'react';
import { Link } from 'gatsby';
import styles from './Menu.module.scss';

type Props = {
  menu: {
    label: string,
    path: string
  }[]
};

const menuItem = (item) => item.path.startsWith('http') ? externalLink(item) : internalLink(item);

const externalLink = (item) => (
  <li className={styles['menu__list-item']} key={item.path}>
    <a href={item.path} target="_blank">{item.label}</a>
  </li> 
)

const internalLink = (item) => (
 <li className={styles['menu__list-item']} key={item.path}>
  <Link
    to={item.path}
    className={styles['menu__list-item-link']}
    activeClassName={styles['menu__list-item-link--active']}
  >
    {item.label}
  </Link>
</li> 
);

const Menu = ({ menu }: Props) => (
  <nav className={styles['menu']}>
    <ul className={styles['menu__list']}>
      {menu.map((item) => (
        menuItem(item)
      ))}
    </ul>
  </nav>
);

export default Menu;
