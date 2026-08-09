import { CANONICAL_ORIGIN } from 'src/utils/seo';

// Client-component page — canonical must be declared from the layout.
export async function generateMetadata({ params }) {
  const { serviceId } = await params;

  return {
    alternates: { canonical: `${CANONICAL_ORIGIN}/services/${serviceId}` }
  };
}

export default function ServiceDetailLayout({ children }) {
  return children;
}
