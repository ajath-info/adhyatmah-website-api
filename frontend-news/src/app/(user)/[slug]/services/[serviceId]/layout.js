import { CANONICAL_ORIGIN } from 'src/utils/seo';

// The service-detail page is a client component and cannot export metadata, so
// the canonical is declared here. Without it this URL had no canonical at all.
export async function generateMetadata({ params }) {
  const { slug, serviceId } = await params;

  return {
    alternates: { canonical: `${CANONICAL_ORIGIN}/${slug}/services/${serviceId}` }
  };
}

export default function PanditServiceLayout({ children }) {
  return children;
}
