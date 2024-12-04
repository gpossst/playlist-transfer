import React from "react";
import Script from "next/script";

function AppleMusic() {
  return (
    <Script
      src="https://js-cdn.music.apple.com/musickit/v3/musickit.js"
      data-web-components
      async
    />
  );
}

export default AppleMusic;
