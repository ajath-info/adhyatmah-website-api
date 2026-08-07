'use client';
import { Suspense } from 'react';

import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import VendorCardLarge from 'src/components/cards/vendor/vendor-card-large';
import * as api from 'src/services';

function PoojaServicePanditsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const serviceId = params.serviceId;
  const serviceName = searchParams.get('name') || '';

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['get-vendors'],
    queryFn: () => api.getAllPandit()
  });

  const vendors = data?.payload?.vendors || [];

  const filteredVendors = useMemo(() => {
    const normalizedQueryName = serviceName.trim().toLowerCase();

    return vendors.filter((vendor) =>
      (vendor?.services || []).some((svc) => {
        const svcId = String(svc?.id || svc?._id || '');
        const matchesId = svcId && svcId === String(serviceId);

        const svcName = String(svc?.poojaType || svc?.name || '').toLowerCase();
        const matchesName = normalizedQueryName && svcName.includes(normalizedQueryName);

        return matchesId || matchesName;
      })
    );
  }, [vendors, serviceId, serviceName]);

  const resolveMatchedService = (vendor) => {
    const normalizedQueryName = serviceName.trim().toLowerCase();
    return (vendor?.services || []).find((svc) => {
      const svcId = String(svc?.id || svc?._id || '');
      const matchesId = svcId && svcId === String(serviceId);

      const svcName = String(svc?.poojaType || svc?.name || '').toLowerCase();
      const matchesName = normalizedQueryName && svcName.includes(normalizedQueryName);

      return matchesId || matchesName;
    });
  };

  return (
    <Container maxWidth="xl">
      <Stack sx={{ gap: 3 }}>
        <HeaderBreadcrumbs
          heading={serviceName ? `${serviceName} Pandits` : 'Pooja Service Pandits'}
          links={[
            { name: 'Home', href: '/' },
            { name: 'Pooja Services', href: '/offline-puja-services' },
            { name: serviceName || 'Service' }
          ]}
        />

        <Box>
          <Grid container spacing={2} justifyContent="start" alignItems="center" mb={3}>
            {(isLoading ? Array.from(new Array(12)) : filteredVendors).map((vendor, index) => {
              const matchedService = !isLoading && vendor ? resolveMatchedService(vendor) : null;
              const vendorServiceId = matchedService?.id || matchedService?._id;
              // `?from=service` marks this booking as having started from the
              // "Pooja Services" browse page, so the shared booking page applies
              // the Service coupon module instead of the Pandit one.
              const bookingHref =
                !isLoading && vendor
                  ? (vendorServiceId ? `/vendors/${vendor.id}/services/${vendorServiceId}?from=service` : `/vendors/${vendor.id}`)
                  : undefined;

              return (
                <React.Fragment key={vendor?.id || index}>
                  <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
                    <VendorCardLarge
                      vendor={vendor}
                      isLoading={isLoading}
                      singleActionButton
                      singleActionLabel="View Details & Book"
                      singleActionHref={bookingHref}
                    />
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>

          {!isLoading && !Boolean(filteredVendors.length) && (
            <Typography variant="h3" color="error.main" mb={3} textAlign="center">
              No Pandits found for this pooja service
            </Typography>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function PoojaServicePanditsPageSuspenseWrapper(props) {
  return (
    <Suspense fallback={null}>
      <PoojaServicePanditsPage {...props} />
    </Suspense>
  );
}