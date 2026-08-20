import { CANONICAL_ORIGIN, isBadSlug } from 'src/utils/seo';

// The job detail page itself is a client component ('use client'), so it
// cannot export metadata. A layout CAN export generateMetadata and does
// receive the route params, so this is the minimal way to give the page
// proper server-side metadata + JobPosting structured data without
// rewriting it, following the same pattern used for /blogs/[handle].

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

async function fetchJob(slug) {
    if (!baseUrl || isBadSlug(slug)) return null;

    try {
        const res = await fetch(`${baseUrl}/api/careers/jobs/${slug}`, { next: { revalidate: 300 } });
        if (!res.ok) return null;

        const json = await res.json();
        return json?.data || null;
    } catch (err) {
        console.warn('careers layout: failed to fetch job', err);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const job = await fetchJob(slug);

    const canonical = `${CANONICAL_ORIGIN}/careers/${slug}`;

    if (!job) {
        return {
            title: 'Careers | Adhyatmah',
            alternates: { canonical }
        };
    }

    const title = job.seoTitle || `${job.title} | Careers at Adhyatmah`;
    const description = job.seoDescription || job.description?.slice(0, 160) || '';

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            type: 'article',
            title,
            description,
            url: canonical
        },
        twitter: {
            card: 'summary',
            title,
            description
        }
    };
}

export default async function CareerJobLayout({ children, params }) {
    const { slug } = await params;
    const job = await fetchJob(slug);

    const canonical = `${CANONICAL_ORIGIN}/careers/${slug}`;

    const schema = job
        ? [
            {
                '@context': 'https://schema.org',
                '@type': 'JobPosting',
                title: job.title,
                description: job.description || job.title,
                datePosted: job.postedAt || job.createdAt,
                employmentType: (job.employmentType || 'FULL_TIME').toUpperCase().replace('-', '_'),
                hiringOrganization: {
                    '@type': 'Organization',
                    name: 'Adhyatmah',
                    sameAs: CANONICAL_ORIGIN
                },
                jobLocation: {
                    '@type': 'Place',
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: job.location,
                        addressCountry: 'IN'
                    }
                }
            },
            {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_ORIGIN}/` },
                    { '@type': 'ListItem', position: 2, name: 'Careers', item: `${CANONICAL_ORIGIN}/careers` },
                    { '@type': 'ListItem', position: 3, name: job.title, item: canonical }
                ]
            }
        ]
        : null;

    return (
        <>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            )}
            {children}
        </>
    );
}