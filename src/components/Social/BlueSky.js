import React from 'react';

const ShareToBlueSkyButton = ({ text, url }) => {
  const encodedText = encodeURIComponent(`${text} ${url}`);
  const blueSkyShareUrl = `https://bsky.app/intent/compose?text=${encodedText}`;

  return (
    <a
      href={blueSkyShareUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on BlueSky"
    >
      Bluesky
    </a>
  );
};

export default ShareToBlueSkyButton;
