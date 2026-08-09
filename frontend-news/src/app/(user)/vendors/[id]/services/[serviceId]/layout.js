import { NOINDEX } from 'src/utils/seo';

// ID-keyed duplicate of /[slug]/services/[serviceId] — see the note in
// ../../layout.js. Kept out of the index so only one URL per service competes.
export const metadata = { ...NOINDEX };

export default function VendorServiceByIdLayout({ children }) {
  return children;
}
