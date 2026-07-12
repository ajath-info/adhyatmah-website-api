'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const FB_PIXEL_ID = '2070607706886898';

const FacebookPixel = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Load the Facebook Pixel script
    const loadFbPixel = () => {
      if (window.fbq) return; // Already loaded

      const n = (window.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];

      const t = document.createElement('script');
      t.async = true;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(t, s);

      window.fbq('init', FB_PIXEL_ID);
      window.fbq('track', 'PageView');
    };

    loadFbPixel();
  }, []);

  // Track page views on route changes (client-side navigation)
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
};

export default FacebookPixel;
