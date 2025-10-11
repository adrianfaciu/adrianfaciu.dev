'use strict';

const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

// Remove this plugin to see all the mini css warnings about conflicting order
exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [
      new FilterWarningsPlugin({
        exclude: /mini-css-extract-plugin[^]*Conflicting order. Following module has been added:/,
      }),
    ],
  });
};

exports.createPages = async (args) => {
  const { actions } = args;
  const { createRedirect } = actions;

  // Redirect sharedarticles to Reeder
  createRedirect({
    fromPath: '/sharedarticles',
    toPath: 'https://reederapp.net/2mR0-bSCTv2wfPi1hG5Hsw',
    isPermanent: true,
    redirectInBrowser: true,
  });

  createRedirect({
    fromPath: '/sharedarticles/',
    toPath: 'https://reederapp.net/2mR0-bSCTv2wfPi1hG5Hsw',
    isPermanent: true,
    redirectInBrowser: true,
  });

  // Call existing createPages logic
  await require('./gatsby/create-pages')(args);
};

exports.onCreateNode = require('./gatsby/on-create-node');
