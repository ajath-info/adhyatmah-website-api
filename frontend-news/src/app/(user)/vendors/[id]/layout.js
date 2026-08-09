import { NOINDEX } from 'src/utils/seo';

// /vendors/[id] renders the same pandit profile that /[slug] serves, only keyed
// by database id instead of the readable slug. Two URLs, one page — that is one
// of the sources of "Duplicate without user-selected canonical". The slug URL
// is the one in the sitemap, so this ID-based variant is kept out of the index.
//
// The page itself is a client component and therefore cannot export metadata;
// a layout can.
export const metadata = { ...NOINDEX };

export default function VendorByIdLayout({ children }) {
  return children;
}
