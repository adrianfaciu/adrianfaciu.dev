import React from 'react';
import { Link } from 'gatsby';
import Author from './Author';
import Comments from './Comments';
import Content from './Content';
import Meta from './Meta';
import Tags from './Tags';
import Scroll from './Scroll';
import * as styles from './Post.module.scss';
import SEO from '../Seo';

const Post = ({ post }) => {
  const { html } = post;
  const { tagSlugs, slug } = post.fields;
  const { tags, title, date, canonical, description } = post.frontmatter;

  return (
    <>
      <SEO {...{ title, description, slug, canonical }} />
      <div>
        <Link className={styles['post__homeButton']} to="/">
          All Articles
        </Link>

        <div>
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

        <Scroll />
      </div>
    </>
  );
};

export default Post;
