'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useEmblaCarousel from 'embla-carousel-react';

import { Box, Paper, useMediaQuery, Button, Stack } from '@mui/material';
import { IoArrowForward } from 'react-icons/io5';

import ProductCard from 'src/components/cards/product';

function ProductsCarousel({ data, isLoading, query, desktopSlides = 4 }) {
  const isLarge = useMediaQuery('(min-width:1200px)');
  const isDesktop = useMediaQuery('(min-width:900px)');
  const isTablet = useMediaQuery('(min-width:600px)');
  const isMobile = useMediaQuery('(max-width:600px)');

  const slidesToShow = isLarge ? desktopSlides : isDesktop ? 3 : isTablet ? 2 : isMobile ? 2 : desktopSlides;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: slidesToShow
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const handleSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', handleSelect);
    handleSelect();
  }, [emblaApi]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const renderSlides = () =>
    (isLoading ? Array.from(new Array(slidesToShow)) : data).map((item, index) => (
      <Box
        key={index}
        sx={{
          flex: `0 0 ${100 / slidesToShow}%`,
          minWidth: 0,
          px: 1,
          pb: 1,
          boxSizing: 'border-box'
        }}
      >
        <ProductCard loading={isLoading} product={!isLoading ? item : null} />
      </Box>
    ));

  return (
    <Paper elevation={0} sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <Box
        ref={emblaRef}
        sx={{
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex' }}>{renderSlides()}</Box>
      </Box>

      <Stack direction="row" justifyContent="center" alignItems="center" mt={3}>
        {query && (
          <Button
            variant="outlined"
            color="secondary"
            endIcon={<IoArrowForward />}
            component={Link}
            href={`/products` + query}
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
        )}
      </Stack>
    </Paper>
  );
}

ProductsCarousel.propTypes = {
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default ProductsCarousel;