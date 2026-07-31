import React from 'react';
import { notFound } from 'next/navigation';
import { Box, Container, Stack } from '@mui/material';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ProductDetails from 'src/components/_main/product';
import ProductDetailTabs from 'src/components/_main/product/tabs';
import ProductAdditionalInfo from 'src/components/_main/product/additional-info';
import RelatedProductsCarousel from '@/components/_main/product/related-products';
import ProductContentCard from '@/components/cards/product-content';
import ProductSEOContent from '@/components/_main/product/seo-content';
// Static generation with ISR
export const revalidate = 60;

// ✅ Base URL (set once for all fetches)
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// This SEO content block's copy (highlights, FAQs, etc.) is written specifically
// for the Vivah Puja Instant Kit — passed as props to the shared ProductSEOContent
// component so it only shows Vivah-specific copy on that product's page.
const vivahSeoContent = {
  highlights: [
    'Complete Puja Samagri Kit',
    'Ready to Use',
    'Suitable for Hindu Wedding Ceremonies',
    'Fresh & Carefully Packed'
  ],
  whyChoosePoints: [
    'Includes essential Vivah Puja samagri',
    'Saves preparation time before the ceremony',
    'Suitable for weddings at home, temples, and wedding venues',
    'Carefully packed for convenience',
    'Ready-to-use kit for a hassle-free experience',
    'Helps ensure all essential puja items are available before the ceremony'
  ],
  audience: [
    'Families performing Hindu wedding ceremonies',
    'Couples preparing for traditional Vivah rituals',
    'Priests conducting marriage ceremonies',
    'Anyone looking for a ready-to-use Vivah Puja Kit'
  ],
  howToUseSteps: [
    'Open the kit before the ceremony.',
    'Check all the included puja items.',
    'Arrange the puja samagri as guided by your priest.',
    'Perform the Vivah rituals according to tradition.',
    'Complete the ceremony using the items provided in the kit.'
  ],
  faqs: [
    {
      q: 'What is included in the Vivah Puja Instant Kit?',
      a: 'The kit contains essential puja samagri commonly required for traditional Hindu wedding ceremonies. The exact contents may vary depending on regional customs and traditions.'
    },
    {
      q: 'Is this Vivah Puja Kit suitable for home weddings?',
      a: 'Yes. The kit is suitable for wedding ceremonies performed at home, temples, banquet halls, and other wedding venues.'
    },
    {
      q: 'Can I order the Vivah Puja Instant Kit before my wedding date?',
      a: 'Yes. We recommend placing your order in advance to ensure the kit is delivered before your scheduled wedding ceremony.'
    },
    {
      q: 'Are the puja items packed safely?',
      a: 'Yes. All puja items are carefully packed to maintain their quality during storage and delivery.'
    },
    {
      q: 'Does this product include Pandit booking?',
      a: 'No. This product includes only the required puja materials. If you also need a priest for your wedding ceremony, you can book a Pandit through Adhyatmah.'
    },
    {
      q: 'Can I customize the Vivah Puja Instant Kit?',
      a: 'Customization may be available for selected products. Please contact our support team before placing your order to discuss your specific requirements.'
    }
  ]
};

// This SEO content block's copy (highlights, FAQs, etc.) is written specifically
// for the Dhanteras Puja Instant Kit — passed as props to the shared ProductSEOContent
// component so it only shows Dhanteras-specific copy on that product's page.
const dhanterasSeoContent = {
  highlights: [
    'Ready-to-Use Dhanteras Puja Instant Kit',
    'Essential Puja Samagri Included',
    'Suitable for Home Puja',
    'Carefully Packed',
    'Ideal for Lakshmi, Ganesha & Kuber Puja',
    'Convenient for Festival Preparations'
  ],
  whyChoosePoints: [
    'Includes the essential puja samagri required for Dhanteras rituals.',
    'Saves time by reducing last-minute festival preparations.',
    'Ready to use for home puja and family celebrations.',
    'Carefully packed for a smooth and organised puja experience.',
    'Suitable for both first-time and regular devotees.',
    'Helps you perform the rituals with ease and devotion.'
  ],
  audience: [
    'Families celebrating Dhanteras at home',
    'Devotees performing Lakshmi, Ganesha & Kuber Puja',
    'Anyone looking for a ready-to-use Dhanteras Puja Kit',
    'First-time devotees',
    'Individuals looking for a thoughtful festive gift'
  ],
  howToUseSteps: [
    'Open the kit and check the included puja items.',
    "Arrange the puja samagri according to your family tradition or your priest's guidance.",
    'Prepare the altar with Maa Lakshmi, Lord Ganesha, and Lord Kuber.',
    'Perform the puja using the included samagri.',
    'Complete the rituals with aarti and seek blessings for prosperity and good fortune.'
  ],
  faqs: [
    {
      q: 'What is included in the Dhanteras Puja Instant Kit?',
      a: 'The kit contains the essential puja samagri required for performing Dhanteras Puja at home. Please refer to the Product Details section above for the complete list of included items.'
    },
    {
      q: 'Is this kit suitable for Lakshmi, Ganesha, and Kuber Puja?',
      a: 'Yes. This kit is specially prepared for performing the traditional worship of Maa Lakshmi, Lord Ganesha, and Lord Kuber during Dhanteras.'
    },
    {
      q: 'Can I perform Dhanteras Puja at home using this kit?',
      a: 'Yes. The kit is designed for home use and includes the essential puja items commonly required to perform the rituals conveniently.'
    },
    {
      q: 'Does this product include Pandit Booking?',
      a: 'No. This product includes only the puja samagri. If required, you can book a Verified Pandit separately through Adhyatmah.'
    },
    {
      q: 'Is this kit suitable for gifting during Dhanteras?',
      a: 'Yes. It is a thoughtful and convenient choice for gifting family members, relatives, friends, or anyone celebrating Dhanteras.'
    },
    {
      q: 'When should I order the Dhanteras Puja Instant Kit?',
      a: 'We recommend ordering the kit a few days before Dhanteras to help ensure timely delivery and avoid last-minute festival preparations.'
    }
  ]
};

// This SEO content block's copy is written specifically for the plain
// "Dhanteras Puja Kit" (not the Instant Kit) — passed as props to the shared
// ProductSEOContent component so it only shows this copy on that product's page.
const dhanterasKitSeoContent = {
  highlights: [
    'Complete Dhanteras Puja Samagri',
    'Ready-to-Use Puja Kit',
    'Suitable for Home Puja',
    'Carefully Packed Essentials',
    'Ideal for Lakshmi, Ganesha & Kuber Puja',
    'Easy & Convenient to Use'
  ],
  whyChoosePoints: [
    'Includes essential puja samagri required for Dhanteras rituals.',
    'Saves time by eliminating the need to purchase individual puja items.',
    'Carefully packed for a convenient and organised puja experience.',
    'Suitable for both first-time devotees and experienced worshippers.',
    'Ideal for home celebrations and festive preparations.',
    'Helps you perform the rituals with ease and devotion.'
  ],
  audience: [
    'Families celebrating Dhanteras at home',
    'Devotees performing Lakshmi, Ganesha & Kuber Puja',
    'Anyone looking for a complete Dhanteras Puja Kit',
    'First-time devotees looking for a ready-to-use puja kit',
    'Individuals looking for a thoughtful festive gift'
  ],
  howToUseSteps: [
    'Open the kit and check all the included puja items.',
    "Arrange the puja samagri according to your family tradition or your priest's guidance.",
    'Prepare the altar with Maa Lakshmi, Lord Ganesha, and Lord Kuber.',
    'Perform the puja using the included samagri.',
    'Complete the rituals with aarti and seek blessings for prosperity and good fortune.'
  ],
  faqs: [
    {
      q: 'What is included in the Dhanteras Puja Kit?',
      a: 'The kit contains the essential puja samagri required for performing traditional Dhanteras Puja. Please refer to the Product Details section above for the complete list of included items.'
    },
    {
      q: 'Is this kit suitable for Lakshmi, Ganesha, and Kuber Puja?',
      a: 'Yes. This kit is specially curated for the traditional worship of Maa Lakshmi, Lord Ganesha, and Lord Kuber during Dhanteras.'
    },
    {
      q: 'Can I perform Dhanteras Puja at home with this kit?',
      a: 'Yes. The kit is designed for home ceremonies and includes the essential items required to perform the puja conveniently.'
    },
    {
      q: 'Does this product include Pandit Booking?',
      a: 'No. This product includes only the puja samagri. If required, you can book a Verified Pandit separately through Adhyatmah.'
    },
    {
      q: 'Is this kit suitable for gifting during Diwali?',
      a: 'Yes. It is a convenient choice for families and devotees who wish to gift a complete puja kit during the festive season.'
    },
    {
      q: 'When should I order the Dhanteras Puja Kit?',
      a: 'We recommend placing your order a few days before Dhanteras to help ensure timely delivery and a hassle-free festival experience.'
    }
  ]
};

// This SEO content block's copy is written specifically for the plain
// "Rudrabhishek Puja Kit" (not the Instant Kit) — passed as props to the shared
// ProductSEOContent component so it only shows this copy on that product's page.
const rudrabhishekKitSeoContent = {
  highlights: [
    'Complete Rudrabhishek Puja Samagri',
    'Suitable for Home & Temple Worship',
    'Ideal for Sawan Somwar & Mahashivratri',
    'Carefully Packed Essentials',
    'Suitable for Traditional Shiva Worship',
    'Easy to Use'
  ],
  whyChoosePoints: [
    'Includes the essential samagri commonly required for Rudrabhishek Puja.',
    'Saves time by reducing the need to arrange individual puja items.',
    'Suitable for home ceremonies as well as temple rituals.',
    'Carefully packed for a convenient puja experience.',
    'Ideal for Sawan Somwar, Mahashivratri, Pradosh Vrat, and other Shiva worship.',
    'Helps devotees perform the rituals with ease and devotion.'
  ],
  audience: [
    'Families performing Rudrabhishek at home',
    'Devotees observing Sawan Somwar Vrat',
    'Shiva devotees celebrating Mahashivratri',
    'Anyone looking for a complete Rudrabhishek Puja Kit',
    'First-time devotees seeking a ready-to-use solution'
  ],
  howToUseSteps: [
    'Open the kit and check all the included puja items.',
    "Arrange the samagri according to your family tradition or your priest's guidance.",
    'Prepare the Shivling and the puja area.',
    'Perform the Rudrabhishek using the included samagri.',
    "Complete the puja with aarti and seek Lord Shiva's blessings."
  ],
  faqs: [
    {
      q: 'What is included in the Rudrabhishek Puja Kit?',
      a: 'The kit contains the essential puja samagri commonly required for performing a traditional Rudrabhishek Puja. Please refer to the Product Details section for the complete list of included items.'
    },
    {
      q: 'Is this kit suitable for home Rudrabhishek Puja?',
      a: 'Yes. The kit is suitable for performing Rudrabhishek Puja at home as well as in temples.'
    },
    {
      q: 'Can I use this kit during Sawan Somwar and Mahashivratri?',
      a: 'Yes. The Rudrabhishek Puja Kit is suitable for Sawan Somwar, Mahashivratri, Pradosh Vrat, and other occasions dedicated to Lord Shiva.'
    },
    {
      q: 'Does this product include Pandit Booking?',
      a: 'No. This product includes only the puja samagri. If required, you can book a Verified Pandit separately through Adhyatmah.'
    },
    {
      q: 'Is this kit suitable for first-time devotees?',
      a: "Yes. Whether you're performing Rudrabhishek for the first time or regularly observe Shiva Puja, this kit helps make the ritual simple and convenient."
    },
    {
      q: 'When should I order the Rudrabhishek Puja Kit?',
      a: 'We recommend placing your order a few days before your planned puja or festival, especially during Sawan and Mahashivratri, to help ensure timely delivery.'
    }
  ]
};

// This SEO content block's copy is written specifically for the
// "Rudrabhishek Puja Instant Kit" — passed as props to the shared
// ProductSEOContent component so it only shows this copy on that product's page.
const rudrabhishekInstantKitSeoContent = {
  highlights: [
    'Ready-to-Use Rudrabhishek Puja Kit',
    'Essential Shiva Puja Samagri',
    'Suitable for Home & Temple Worship',
    'Ideal for Sawan Somwar & Mahashivratri',
    'Carefully Packed Essentials',
    'Easy to Carry & Use'
  ],
  whyChoosePoints: [
    'Includes the essential puja samagri required for Rudrabhishek Puja.',
    'Saves time by eliminating the need to arrange puja items separately.',
    'Ready-to-use kit for quick and convenient preparations.',
    'Carefully packed for a smooth puja experience.',
    'Suitable for home worship, temple rituals, and travel.',
    'Helps devotees perform Shiva Puja with ease and devotion.'
  ],
  audience: [
    'Devotees performing Rudrabhishek Puja',
    'Families observing Sawan Somwar',
    'Shiva devotees celebrating Mahashivratri',
    'Anyone looking for a ready-to-use Rudrabhishek Puja Kit',
    'Travellers or devotees who prefer a compact puja solution'
  ],
  howToUseSteps: [
    'Open the Instant Kit and check the included puja items.',
    "Arrange the samagri according to your family tradition or your priest's guidance.",
    'Prepare the Shivling and the puja area.',
    'Perform the Rudrabhishek using the included puja materials.',
    "Complete the puja with aarti and seek Lord Shiva's blessings."
  ],
  faqs: [
    {
      q: 'What is included in the Rudrabhishek Puja Instant Kit?',
      a: 'The kit contains the essential puja samagri required for performing a traditional Rudrabhishek Puja. Please refer to the Product Details section for the complete list of included items.'
    },
    {
      q: 'What is the difference between the Rudrabhishek Puja Kit and the Instant Kit?',
      a: 'The Rudrabhishek Puja Instant Kit is designed for quick and convenient puja preparations with essential items, while the Rudrabhishek Puja Kit includes a more comprehensive collection of puja samagri.'
    },
    {
      q: 'Is this Instant Kit suitable for Sawan Somwar and Mahashivratri?',
      a: 'Yes. This kit is suitable for Sawan Somwar, Mahashivratri, Pradosh Vrat, and other occasions dedicated to Lord Shiva.'
    },
    {
      q: 'Does this product include Pandit Booking?',
      a: 'No. This product includes only the puja samagri. If required, you can book a Verified Pandit separately through Adhyatmah.'
    },
    {
      q: 'Is this kit suitable for beginners?',
      a: 'Yes. The Instant Kit is suitable for both first-time devotees and those who regularly perform Rudrabhishek Puja.'
    },
    {
      q: 'When should I order the Rudrabhishek Puja Instant Kit?',
      a: 'We recommend placing your order a few days before your planned puja or festival, especially during Sawan and Mahashivratri, to help ensure timely delivery.'
    }
  ]
};

// ✅ Generate all static paths at build
export async function generateStaticParams() {
  try {
    if (!baseUrl) return [];
    const res = await fetch(`${baseUrl}/api/products-slugs`, {
      next: { revalidate: 3600 } // Cache slug list for 1 hour
    });

    if (!res.ok) return [];

    const { data } = await res.json();

    return data?.map((product) => ({ slug: product.slug })) || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('generateStaticParams: failed to fetch products-slugs', err);
    return [];
  }
}

// ✅ Generate metadata per product
export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    if (!baseUrl) return {};
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: 'force-cache' // Prefer cached
    });

    if (!res.ok) return {};

    const { data: product } = await res.json();

    if (!product) return {};

    const images = product.images || [];

    return {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription,
      keywords: product.tags || [],
      alternates: {
        canonical: `https://www.adhyatmah.com/product/${slug}`
      },
      openGraph: {
        title: product.name,
        description: product.metaDescription,
        images: images.map((v) => ({ url: v.url }))
      }
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('generateMetadata: failed to fetch product', err);
    return {};
  }
}

// ✅ Main page component
export default async function ProductDetail({ params }) {
  const { slug } = await params;
  try {
    if (!baseUrl) return notFound();

    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    if (!res.ok) return notFound();

    const response = await res.json();

    if (!response?.success || !response?.data) return notFound();

    const { data, totalRating, totalReviews, brand, category } = response;
    const isSimpleProduct = data?.type === 'simple';
    // This SEO content block's copy (highlights, FAQs, etc.) is written specifically
    // for the Namkaran Puja Kit — only show it on that product, not on every product page.
    const isNamkaranKit = /namkaran/i.test(slug || '') || /namkaran/i.test(data?.name || '');
    // Same idea as isNamkaranKit above, but for the Vivah Puja Instant Kit specifically —
    // must match BOTH "vivah" and "instant" so it doesn't also trigger on other
    // Vivah products (e.g. the plain "Vivah Puja Kit", slug vivah-puja-kit).
    const isVivahKit =
      (/vivah/i.test(slug || '') && /instant/i.test(slug || '')) ||
      (/vivah/i.test(data?.name || '') && /instant/i.test(data?.name || ''));
    // Same idea, but for the Dhanteras Puja Instant Kit — must match BOTH
    // "dhanteras" and "instant" so it doesn't also trigger on the plain
    // "Dhanteras Puja Kit" (slug dhanteras-puja-kit).
    const isDhanterasKit =
      (/dhanteras/i.test(slug || '') && /instant/i.test(slug || '')) ||
      (/dhanteras/i.test(data?.name || '') && /instant/i.test(data?.name || ''));
    // The plain "Dhanteras Puja Kit" (no "instant" in slug/name) — separate copy
    // from the Instant Kit above.
    const isDhanterasPlainKit =
      (/dhanteras/i.test(slug || '') && !/instant/i.test(slug || '')) ||
      (/dhanteras/i.test(data?.name || '') && !/instant/i.test(data?.name || ''));
    // The plain "Rudrabhishek Puja Kit" (no "instant" in slug/name).
    const isRudrabhishekKit =
      (/rudrabhishek/i.test(slug || '') && !/instant/i.test(slug || '')) ||
      (/rudrabhishek/i.test(data?.name || '') && !/instant/i.test(data?.name || ''));
    // The "Rudrabhishek Puja Instant Kit" — must match BOTH "rudrabhishek" and
    // "instant" so it doesn't also trigger on the plain Rudrabhishek Puja Kit.
    const isRudrabhishekInstantKit =
      (/rudrabhishek/i.test(slug || '') && /instant/i.test(slug || '')) ||
      (/rudrabhishek/i.test(data?.name || '') && /instant/i.test(data?.name || ''));
    try {
      return (
        <Box>
          <Container maxWidth="xl">
            <Stack direction={'column'} gap={3}>
              <HeaderBreadcrumbs
                heading="Product Details"
                links={[{ name: 'Home', href: '/' }, { name: 'Products', href: '/products' }, { name: data?.name }]}
              />

              <ProductDetails
                data={data}
                brand={brand}
                slug={slug}
                category={category}
                totalRating={totalRating}
                totalReviews={totalReviews}
                isSimpleProduct={isSimpleProduct}
              />
              <ProductContentCard content={data.content} name={data.name} />

              <ProductDetailTabs
                product={{ description: data.content, _id: data._id }}
                totalRating={totalRating}
                totalReviews={totalReviews}
              />

              <ProductAdditionalInfo />
              {isNamkaranKit && <ProductSEOContent />}
              {isVivahKit && <ProductSEOContent {...vivahSeoContent} />}
              {isDhanterasKit && <ProductSEOContent {...dhanterasSeoContent} />}
              {isDhanterasPlainKit && <ProductSEOContent {...dhanterasKitSeoContent} />}
              {isRudrabhishekKit && <ProductSEOContent {...rudrabhishekKitSeoContent} />}
              {isRudrabhishekInstantKit && <ProductSEOContent {...rudrabhishekInstantKitSeoContent} />}

              <RelatedProductsCarousel id={data._id} category={category?.slug} />
            </Stack>
          </Container>
        </Box>
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('ProductDetail: render failed', err);
      return notFound();
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('ProductDetail: failed to fetch product data', err);
    return notFound();
  }
}