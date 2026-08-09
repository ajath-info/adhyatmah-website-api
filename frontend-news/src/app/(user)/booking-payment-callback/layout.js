import { NOINDEX } from 'src/utils/seo';

// Transactional screen — must never be indexed.
export const metadata = { ...NOINDEX };

export default function Layout({ children }) {
  return children;
}
