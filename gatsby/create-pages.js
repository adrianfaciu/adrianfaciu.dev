'use strict';

const path = require('path');
const _ = require('lodash');
const createCategoriesPages = require('./pagination/create-categories-pages.js');
const createTagsPages = require('./pagination/create-tags-pages.js');
const createPostsPages = require('./pagination/create-posts-pages.js');

const createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  // 404
  createPage({
    path: '/404',
    component: path.resolve('./src/templates/not-found-template.js'),
  });

  // Tags list
  createPage({
    path: '/tags',
    component: path.resolve('./src/templates/tags-list-template.js'),
  });

  // Categories list
  createPage({
    path: '/categories',
    component: path.resolve('./src/templates/categories-list-template.js'),
  });

  // Posts and pages from markdown
  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { frontmatter: { date: DESC } }
      ) {
        edges {
          node {
            frontmatter {
              template
              title
              date
              draft
            }
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  const { edges } = result.data.allMarkdownRemark;

  // Filter published posts for navigation
  const posts = edges.filter(
    edge =>
      _.get(edge, 'node.frontmatter.template') === 'post' &&
      _.get(edge, 'node.frontmatter.draft') !== true
  );

  _.each(edges, (edge, index) => {
    if (_.get(edge, 'node.frontmatter.template') === 'page') {
      createPage({
        path: edge.node.fields.slug,
        component: path.resolve('./src/templates/page-template.js'),
        context: { slug: edge.node.fields.slug },
      });
    } else if (_.get(edge, 'node.frontmatter.template') === 'post') {
      const postIndex = posts.findIndex(
        p => p.node.fields.slug === edge.node.fields.slug
      );

      let previousPost = null;
      let nextPost = null;

      // Only set navigation for published posts (postIndex >= 0)
      if (postIndex >= 0) {
        const previousEdge = postIndex < posts.length - 1 ? posts[postIndex + 1] : null;
        const nextEdge = postIndex > 0 ? posts[postIndex - 1] : null;

        if (previousEdge) {
          previousPost = {
            slug: previousEdge.node.fields.slug,
            title: previousEdge.node.frontmatter.title || previousEdge.node.fields.slug,
          };
        }

        if (nextEdge) {
          nextPost = {
            slug: nextEdge.node.fields.slug,
            title: nextEdge.node.frontmatter.title || nextEdge.node.fields.slug,
          };
        }
      }

      createPage({
        path: edge.node.fields.slug,
        component: path.resolve('./src/templates/post-template.js'),
        context: {
          slug: edge.node.fields.slug,
          previousPost,
          nextPost,
        },
      });
    }
  });

  // Feeds
  await createTagsPages(graphql, actions);
  await createCategoriesPages(graphql, actions);
  await createPostsPages(graphql, actions);
};

module.exports = createPages;
