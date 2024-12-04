import React from "react";
import Script from "next/script";

type AdSenseTypes = {
  pId: string;
};

function AdSense({ pId }: AdSenseTypes) {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${pId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

export default AdSense;
