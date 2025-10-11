import React from 'react';
import { Link } from 'gatsby';
import Author from './Author';
import Comments from './Comments';
import Content from './Content';
import Meta from './Meta';
import Tags from './Tags';
import Scroll from './Scroll';
import PostNavigation from './PostNavigation';
import * as styles from './Post.module.scss';
import SEO from '../Seo';
import ShareTo from '../Social/ShareTo';
const Post = ({ post, previousPost, nextPost }) => {
  const { html, timeToRead } = post;
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
          <Content
            body={html}
            title={title}
            date={date}
            timeToRead={timeToRead}
          />
        </div>

        <ShareTo text={title} url={`https://adrianfaciu.dev${slug}`} />

        <PostNavigation previousPost={previousPost} nextPost={nextPost} />

        <Scroll />
      </div>
    </>
  );
};

export default Post;
