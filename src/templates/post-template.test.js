import React from 'react';
import renderer from 'react-test-renderer';
import { useStaticQuery, StaticQuery } from 'gatsby';
import PostTemplate from './post-template';
import siteMetadata from '../../jest/__fixtures__/site-metadata';
import markdownRemark from '../../jest/__fixtures__/markdown-remark';

describe('PostTemplate', () => {
  const props = {
    data: {
      ...markdownRemark,
    },
  };

  beforeEach(() => {
    StaticQuery.mockImplementationOnce(
      ({ render }) => render(siteMetadata),
      useStaticQuery.mockReturnValue(siteMetadata)
    );
  });

  it('renders correctly', () => {
    const tree = renderer.create(<PostTemplate {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
