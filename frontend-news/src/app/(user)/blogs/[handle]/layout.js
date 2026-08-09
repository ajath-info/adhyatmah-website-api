import { CANONICAL_ORIGIN, isBadSlug } from 'src/utils/seo';

// The blog post page itself is a client component ('use client'), so it cannot
// export metadata. Without this layout every article shipped the generic
// site-wide <title> and no canonical, no description and no Article schema —
// which is why the blog posts sat in "Crawled - currently not indexed".
//
// A layout CAN export generateMetadata and does receive the route params, so
// this is the minimal way to give the existing client page proper server-side
// metadata without rewriting it.

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

async function fetchArticle(handle) {
  if (!baseUrl || isBadSlug(handle)) return null;

  try {
    const res = await fetch(`${baseUrl}/api/articles/${handle}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;

    const json = await res.json();
    return json?.data || json?.article || null;
  } catch (err) {
    console.warn('blog layout: failed to fetch article', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const article = await fetchArticle(handle);

  const canonical = `${CANONICAL_ORIGIN}/blogs/${handle}`;

  if (!article) {
    return {
      title: 'Blog | Adhyatmah',
      alternates: { canonical }
    };
  }

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || '';

  return {
    title,
    description,
    keywords: article.seoKeywords || undefined,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      publishedTime: article.publishedAt || article.createdAt,
      modifiedTime: article.updatedAt,
      images: article.image?.url ? [{ url: article.image.url }] : []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.image?.url ? [article.image.url] : []
    }
  };
}

export default async function BlogPostLayout({ children, params }) {
  const { handle } = await params;
  const article = await fetchArticle(handle);

  const canonical = `${CANONICAL_ORIGIN}/blogs/${handle}`;

  // Article + BreadcrumbList schema, server-rendered so it is present in the
  // initial HTML rather than appearing only after hydration.
  const schema = article
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.seoTitle || article.title,
          description: article.seoDescription || article.excerpt || '',
          image: article.image?.url ? [article.image.url] : undefined,
          datePublished: article.publishedAt || article.createdAt,
          dateModified: article.updatedAt || article.publishedAt || article.createdAt,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          author: { '@type': 'Organization', name: 'Adhyatmah', url: CANONICAL_ORIGIN },
          publisher: { '@type': 'Organization', name: 'Adhyatmah', url: CANONICAL_ORIGIN }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${CANONICAL_ORIGIN}/blogs` },
            { '@type': 'ListItem', position: 3, name: article.title, item: canonical }
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
