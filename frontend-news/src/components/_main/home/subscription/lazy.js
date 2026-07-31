'use client';

import dynamic from 'next/dynamic';

// Loaded client-side only, on demand — this is a popup dialog with
// formik/react-query/toast dependencies that isn't needed for first paint.
// `ssr: false` requires this to live inside a Client Component, so it's
// pulled out of page.js (a Server Component) into this small wrapper.
const SubscriptionModal = dynamic(
  () => import('./index'),
  { ssr: false }
);

export default SubscriptionModal;