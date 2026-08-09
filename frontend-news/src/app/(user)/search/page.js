import React from 'react';
import Search from '@/components/widgets/search';
import { NOINDEX } from 'src/utils/seo';

// SEO: utility route with no search value — keep it out of the index while
// still letting Google follow its links.
export const metadata = {
  ...NOINDEX
};

// dynamic import

export default function Searchs() {
  return <Search mobile />;
}

// Render per-request (SSR): this page's filter/search components read useSearchParams,
// which cannot be statically prerendered. SSR still sends full HTML to crawlers.
export const dynamic = 'force-dynamic';
