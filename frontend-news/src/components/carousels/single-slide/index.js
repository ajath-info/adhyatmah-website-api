'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Link from 'next/link';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import {
  Box,
  Card,
  Stack,
  Typography,
  LinearProgress
} from '@mui/material';


const AUTOPLAY_DELAY = 5000;

/* ------------------------------------------------------------------ */
/* Carousel Item */
/* ------------------------------------------------------------------ */
function CarouselItem({ item, isFirst }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 125, sm: 225, md: 300, lg: 600 },
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        display: 'block'
      }}
      {...(item?.link && {
        component: Link,
        href: item.link
      })}
    >
      <Image
        // Only the first/visible slide should preload eagerly — marking every
        // slide as priority forces the browser to fetch all of them at once,
        // competing for bandwidth with the actual LCP image and slowing it down.
        priority={isFirst}
        loading={isFirst ? undefined : 'lazy'}
        src={item.image.url}
        alt="banner"
        fill
        sizes="100vw"
        draggable={false}
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
      />
    </Box>
  );
}

CarouselItem.propTypes = {
  item: PropTypes.shape({
    image: PropTypes.shape({
      url: PropTypes.string.isRequired,
      _id: PropTypes.string.isRequired
    }).isRequired,
    link: PropTypes.string
  }).isRequired,
  isFirst: PropTypes.bool
};

/* ------------------------------------------------------------------ */
/* Main Carousel */
/* ------------------------------------------------------------------ */
export default function SingleSlideCarousel({ data, onSlideChange }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [
      Autoplay({
        delay: AUTOPLAY_DELAY,
        stopOnInteraction: false,
        // Pause the slide-change (and progress bar) while the cursor is
        // over the banner, and resume automatically the moment it leaves —
        // the currently hovered slide just stays put instead of sliding away.
        stopOnMouseEnter: true
      })
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Kept in a ref (not state) so hovering doesn't re-trigger the progress
  // effect below — it just freezes/unfreezes the same running loop, so the
  // progress bar (and slide) genuinely "hold" on hover and resume exactly
  // where they left off on mouse-leave, in sync with the Autoplay plugin's
  // own stopOnMouseEnter pause.
  const isPausedRef = useRef(false);

  const handleMouseEnter = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  const isEmpty = !data || data.length === 0;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    setProgress(0);
    onSlideChange?.(index);

    const autoplay = emblaApi.plugins()?.autoplay;
    autoplay?.reset();
  }, [emblaApi, onSlideChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  /* Progress animation — freezes while isPausedRef is true (cursor over
     the banner) and continues from the same point once it's false again. */
  useEffect(() => {
    let raf;
    let elapsed = 0;
    let last = Date.now();

    const update = () => {
      const now = Date.now();
      if (!isPausedRef.current) {
        elapsed += now - last;
      }
      last = now;

      const value = Math.min((elapsed / AUTOPLAY_DELAY) * 100, 100);
      setProgress(value);
      if (value < 100) raf = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(raf);
  }, [selectedIndex]);

  return (
    <Card
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        height: { xs: 125, sm: 225, md: 300, lg: 600 }
      }}
    >
      {isEmpty ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            height: '100%'
          }}
        >
          <Typography variant="h4" color="text.secondary">
            Slides are not uploaded yet!
          </Typography>
        </Stack>
      ) : (
        <>
          {/* Embla viewport */}
          <Box ref={emblaRef} sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', height: '100%' }}>
              {data.map((item, index) => (
                <Box
                  key={item.image._id}
                  sx={{
                    flex: '0 0 100%',
                    minWidth: 0,
                    position: 'relative'
                  }}
                >
                  <CarouselItem item={item} isFirst={index === 0} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              width: '100%',
              height: 4,
              position: 'absolute',
              bottom: 0,
              left: 0,
              '& .MuiLinearProgress-bar': {
                transition: 'none'
              }
            }}
          />
        </>
      )}
    </Card>
  );
}

SingleSlideCarousel.propTypes = {
  data: PropTypes.array.isRequired,
  onSlideChange: PropTypes.func
};