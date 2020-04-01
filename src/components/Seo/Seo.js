import React from 'react';
import { withPrefix } from 'gatsby';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

import { useSiteMetadata } from '../../hooks';

const SEO = ({ slug, title, description, image, canonical }: Props) => {
  const { url, author } = useSiteMetadata();

  const img = image || url + withPrefix(author.photo);

  return (
    <>
      <Helmet>
        {slug && <meta property="og:url" content={url + slug} />}
        {title && <meta property="og:title" content={title} />}
        {description && (
          <meta property="og:description" content={description} />
        )}
        {img && <meta property="og:image" content={img} />}

        <meta name="twitter:card" content="summary" />
        <meta property="og:type" content="article" />

        {canonical && <link rel="canonical" href={canonical} />}
      </Helmet>
    </>
  );
};

export default SEO;

SEO.propTypes = {
  slug: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  canonical: PropTypes.string,
};

SEO.defaultProps = {
  slug: null,
  title: null,
  description: null,
  image: null,
  canonical: null,
};
