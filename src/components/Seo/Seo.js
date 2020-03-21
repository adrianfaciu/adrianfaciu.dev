import React from "react";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

const SEO = ({ canonical }) => (
  <>
    <Helmet>{canonical && <link rel="canonical" href={canonical} />}</Helmet>
  </>
);

export default SEO;

SEO.propTypes = {
  canonical: PropTypes.string
};

SEO.defaultProps = {
  canonial: null
};
