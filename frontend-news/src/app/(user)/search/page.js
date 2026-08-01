import React from 'react';
import Search from '@/components/widgets/search';
// dynamic import

export default function Searchs() {
  return <Search mobile />;
}

// Render per-request (SSR): this page's filter/search components read useSearchParams,
// which cannot be statically prerendered. SSR still sends full HTML to crawlers.
export const dynamic = 'force-dynamic';
