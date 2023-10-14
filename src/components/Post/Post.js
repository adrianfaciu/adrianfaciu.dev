import React from 'react';
import { Link } from 'gatsby';
import Author from './Author';
import Comments from './Comments';
import Content from './Content';
import Meta from './Meta';
import Tags from './Tags';
import styles from './Post.module.scss';
import SEO from '../Seo';

const Post = ({ post }) => {
  const { html } = post;
  const { tagSlugs, slug } = post.fields;
  const { tags, title, date, canonical, description } = post.frontmatter;

  return (
    <>
      <SEO {...{ title, description, slug, canonical }} />
      <div className={styles['post']}>
        <Link className={styles['post__home-button']} to="/">
          All Articles
        </Link>

        <div className={styles['post__content']}>
          <Content body={html} title={title} />
        </div>

        <div className={styles['post__footer']}>
          <Meta date={date} />
          {tags && tagSlugs && <Tags tags={tags} tagSlugs={tagSlugs} />}
          <Author {...{ title, slug }} />
        </div>

        <div className={styles['post__comments']}>
          <Comments postSlug={slug} postTitle={post.frontmatter.title} />
        </div>
      </div>
    </>
  );
};

export default Post;
