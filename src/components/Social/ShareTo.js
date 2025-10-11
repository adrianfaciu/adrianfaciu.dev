import React from 'react';
import LinkedInShareButton from './LinkedIn';
import ShareToBlueSkyButton from './BlueSky';

import * as styles from './ShareTo.module.scss';

export default function ShareTo({ text, url }) {
  return (
    <div className={styles['share']}>
      <p>Share this article on</p>
      <LinkedInShareButton url={url} text={text} />
      <p>or</p>
      <ShareToBlueSkyButton url={url} text={text} />
    </div>
  );
}
