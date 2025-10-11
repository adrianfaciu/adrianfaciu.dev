import React from 'react';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';

import Layout from '../components/Layout';
import Post from '../components/Post';
import { useSiteMetadata } from '../hooks';

const PostTemplate = ({ data, pageContext }) => {
  const { title: siteTitle, subtitle: siteSubtitle } = useSiteMetadata();
  const {
    title: postTitle,
    description: postDescription,
    draft: isDraft,
  } = data.markdownRemark.frontmatter;
  const metaDescription =
    postDescription !== null ? postDescription : siteSubtitle;

  return (
    <Layout title={`${postTitle} - ${siteTitle}`} description={metaDescription}>
      <Helmet>{isDraft && <meta name="robots" content="noindex" />}</Helmet>
      <Post
        post={data.markdownRemark}
        previousPost={pageContext.previousPost}
        nextPost={pageContext.nextPost}
      />
    </Layout>
  );
};

export const query = graphql`
  query PostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      fields {
        slug
        tagSlugs
      }
      timeToRead
      frontmatter {
        date
        description
        tags
        title
        canonical
        draft
      }
    }
  }
`;

export default PostTemplate;
