'use client';
import React from 'react';
import Link from 'next/link';
import { Button, Container, Grid, Skeleton, Stack, Typography } from '@mui/material';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ComboCard from 'src/components/cards/combo';
import * as api from 'src/services';

const ORANGE = '#E87722';
export default function PujaCombosPage() {
  const [combos, setCombos] = React.useState(undefined); // undefined = loading

  React.useEffect(() => {
    let alive = true;
    api
      .getPujaCombos('limit=50')
      .then((res) => alive && setCombos(Array.isArray(res?.data) ? res.data : []))
      .catch(() => alive && setCombos([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Container maxWidth="xl" sx={{ pb: { xs: 5, md: 7 } }}>
      <HeaderBreadcrumbs
        heading="Puja Combos"
        links={[{ name: 'Home', href: '/' }, { name: 'Puja Combos' }]}
        sx={{ mb: 3 }}
      />

      {combos === undefined ? (
        <Grid container spacing={2}>
          {[...Array(5)].map((_, i) => (
            <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }} key={i}>
              <Skeleton variant="rounded" height={430} sx={{ borderRadius: '22px' }} />
            </Grid>
          ))}
        </Grid>
      ) : combos.length === 0 ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
          <Typography color="text.secondary">Puja Combos are coming soon.</Typography>
          <Button component={Link} href="/" variant="outlined" sx={{ borderRadius: '50px', textTransform: 'none', borderColor: ORANGE, color: ORANGE }}>
            Back to Home
          </Button>
        </Stack>
      ) : (
        <Grid container spacing={2}>
          {combos.map((combo) => (
            <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }} key={combo.id || combo.slug}>
              <ComboCard combo={combo} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}