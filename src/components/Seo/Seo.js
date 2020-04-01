import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

import { useSiteMetadata } from '../../hooks';

const SEO = ({ slug, title, description, image, canonical }: Props) => {
  const { url } = useSiteMetadata();

  return (
    <>
      <Helmet>
        {slug && <meta property="og:url" content={url + slug} />}
        {title && <meta property="og:title" content={title} />}
        {description && (
          <meta property="og:description" content={description} />
        )}
        {image && <meta property="og:image" content={image} />}

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
