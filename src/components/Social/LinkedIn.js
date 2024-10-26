import React from 'react';

const LinkedInShareButton = ({ url, text }) => {
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url
  )}`;

  return (
    <a
      href={linkedInShareUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on LinkedIn"
    >
      LinkedIn
    </a>
  );
};

export default LinkedInShareButton;
