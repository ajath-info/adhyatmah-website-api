'use client';
// react
import React from 'react';
import Link from 'next/link';

// mui
import { Typography, Grid, Stack, Button, Box, Container } from '@mui/material';
// icons
import { IoArrowForward } from 'react-icons/io5';
// component
import VendorCard from 'src/components/cards/vendor';

const ORANGE = '#E87722';

/* ---------------- DECORATIVE ARROW LINE (matches other home sections) ---------------- */
function ArrowLine({ direction = 'left' }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 46 14"
      sx={{
        width: { xs: 26, sm: 36, md: 42 },
        height: 14,
        display: { xs: 'none', sm: 'block' },
        transform: direction === 'right' ? 'scaleX(-1)' : 'none'
      }}
    >
      <line x1="0" y1="7" x2="34" y2="7" stroke={ORANGE} strokeWidth="2" />
      <path d="M28 1.5 L37 7 L28 12.5" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  );
}

export default function VendorComponent({ data }) {
  //console.log("HOME DATA FIRST ITEM:", data?.[0]);
  return (
    <Container maxWidth="xl" disableGutters>
      <Stack gap={3}>
        <Stack alignItems="center" spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1, sm: 1.5 }}>
            <ArrowLine direction="left" />
            <Typography
              sx={{
                fontSize: { xs: 20, sm: 24, md: 26 },
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              Pandit Ji List
            </Typography>
            <ArrowLine direction="right" />
          </Stack>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Our Highest Rated Pandits Where You Can Find Authentic Puja Services
          </Typography>
        </Stack>
        <Grid container spacing={2} justifyContent="left" alignItems="center">
          {data.slice(0, 5).map((vendor, i) => (
            <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }} key={'vendor-' + i}>
              <VendorCard vendor={vendor} isLoading={false} />
            </Grid>
          ))}
          {!Boolean(data?.length) && (
            <Typography variant="h3" color="error.main" textAlign="center">
              No Pandits found
            </Typography>
          )}
        </Grid>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="secondary"
            endIcon={<IoArrowForward />}
            component={Link}
            href={'/book-pandit-online'}
            sx={{
              '& svg': {
                transition: 'transform 0.3s ease' // smooth effect
              },
              '&:hover': {
                svg: { transform: 'translateX(4px)' }
              }
            }}
          >
            View All
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}