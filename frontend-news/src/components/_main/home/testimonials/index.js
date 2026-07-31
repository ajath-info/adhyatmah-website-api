'use client';
import React from 'react';
import { alpha, Box, Button, Container, Stack, Typography } from '@mui/material';
import { FaArrowRight, FaQuoteLeft } from 'react-icons/fa';
import TestimonialCarousel from 'src/components/carousels/testimonial';

// Realistic sample reviews used to fill the marquee when there aren't enough
// live reviews yet. Any real reviews passed in via `data` are always shown
// first, and these curated ones simply fill in the rest so the strip never
// looks empty. Short one-line reviews so they always fit inside the card.
const DEFAULT_TESTIMONIALS = [
  {
    rating: 5,
    review: 'Pandit Ji arrived on time and performed our Griha Pravesh perfectly.',
    category: 'Puja Booking',
    user: {
      firstName: 'Priya',
      lastName: 'Sharma',
      city: 'Delhi NCR',
      gender: 'female',
      cover: { url: 'https://randomuser.me/api/portraits/women/44.jpg' }
    }
  },
  // {
  //   rating: 5,
  //   review: 'Kundli matching was explained so clearly, all our doubts were cleared.',
  //   category: 'Kundli & Consultation',
  //   user: {
  //     firstName: 'Rajesh',
  //     lastName: 'Kumar',
  //     city: 'Delhi NCR',
  //     gender: 'male',
  //     cover: { url: 'https://randomuser.me/api/portraits/men/32.jpg' }
  //   }
  // },
  {
    rating: 4,
    review: 'Watched the Online Puja live for my parents, felt truly connected.',
    category: 'Online Puja',
    user: {
      firstName: 'Anjali',
      lastName: 'Verma',
      city: 'Delhi NCR',
      gender: 'female',
      cover: { url: 'https://randomuser.me/api/portraits/women/68.jpg' }
    }
  },
  {
    rating: 5,
    review: 'Very knowledgeable pandit for our Satyanarayan Puja, booked in minutes.',
    category: 'Pandit Ji',
    user: {
      firstName: 'Suresh',
      lastName: 'Iyer',
      city: 'Delhi NCR',
      gender: 'male',
      cover: { url: 'https://randomuser.me/api/portraits/men/56.jpg' }
    }
  },
  {
    rating: 5,
    review: 'Puja samagri kit was fresh, authentic, and neatly labelled.',
    category: 'Spiritual E-Commerce',
    user: {
      firstName: 'Meera',
      lastName: 'Nair',
      city: 'Delhi NCR',
      gender: 'female',
      cover: { url: 'https://randomuser.me/api/portraits/women/21.jpg' }
    }
  },
  {
    rating: 4,
    review: 'Easy to schedule for our muhurat, got timely WhatsApp reminders.',
    category: 'Puja Booking',
    user: {
      firstName: 'Vikram',
      lastName: 'Singh',
      city: 'Delhi NCR',
      gender: 'male',
      cover: { url: 'https://randomuser.me/api/portraits/men/12.jpg' }
    }
  },
  // {
  //   rating: 5,
  //   review: 'Astrologer gave an honest reading and never felt rushed.',
  //   category: 'Kundli & Consultation',
  //   user: {
  //     firstName: 'Neha',
  //     lastName: 'Gupta',
  //     city: 'Delhi NCR',
  //     gender: 'female',
  //     cover: { url: 'https://randomuser.me/api/portraits/women/33.jpg' }
  //   }
  // },
  {
    rating: 5,
    review: 'Whole family joined the live stream puja, very well organised.',
    category: 'Online Puja',
    user: {
      firstName: 'Kavita',
      lastName: 'Joshi',
      city: 'Delhi NCR',
      gender: 'female',
      cover: { url: 'https://randomuser.me/api/portraits/women/52.jpg' }
    }
  },
  {
    rating: 4,
    review: 'Pandit ji knew every ritual in detail, guided us well after too.',
    category: 'Pandit Ji',
    user: {
      firstName: 'Arvind',
      lastName: 'kumar',
      city: 'Delhi NCR',
      gender: 'male',
      cover: { url: 'https://randomuser.me/api/portraits/men/77.jpg' }
    }
  },
  {
    rating: 5,
    review: 'Rudraksha mala was authentic quality, delivered really quickly.',
    category: 'Spiritual E-Commerce',
    user: {
      firstName: 'Sneha',
      lastName: 'Sharma',
      city: 'Delhi NCR',
      gender: 'female',
      cover: { url: 'https://randomuser.me/api/portraits/women/15.jpg' }
    }
  }
];

export default function Testimonials({ data }) {
  // Always show real reviews first (if any), then fill in with curated
  // reviews so the marquee never looks sparse or blank.
  const testimonials = data?.length ? [...data, ...DEFAULT_TESTIMONIALS] : DEFAULT_TESTIMONIALS;

  if (!testimonials?.length) return null;

  return (
    <Box
      sx={{
        width: '100%',
        py: { xs: 6, md: 8 },
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06)
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 4 }}
          alignItems="center"
        >
          {/* ---------------- Left feature card ---------------- */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              flex: { xs: '1 1 auto', md: '0 0 400px' },
              width: { xs: '100%', md: 400 },
              px: 4,
              py: 5,
              bgcolor: 'primary.main'
            }}
          >
            {/* decorative mandala / lotus flourish */}
            <Box
              component="svg"
              viewBox="0 0 300 300"
              sx={{
                position: 'absolute',
                top: '50%',
                right: -70,
                transform: 'translateY(-50%)',
                width: 280,
                height: 280,
                opacity: 0.16,
                pointerEvents: 'none'
              }}
            >
              <g fill="none" stroke="white" strokeWidth="1.2">
                <circle cx="150" cy="150" r="130" strokeDasharray="2 6" />
                <circle cx="150" cy="150" r="95" />
                <circle cx="150" cy="150" r="55" strokeDasharray="2 6" />
              </g>
              <g fill="white">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ellipse
                    key={i}
                    cx="150"
                    cy="70"
                    rx="14"
                    ry="34"
                    opacity="0.5"
                    transform={`rotate(${i * 30} 150 150)`}
                  />
                ))}
              </g>
              <circle cx="150" cy="150" r="10" fill="white" opacity="0.6" />
            </Box>

            <Stack spacing={2.25} alignItems="flex-start" sx={{ position: 'relative', zIndex: 1 }}>
              <FaQuoteLeft size={34} color={alpha('#fff', 0.9)} style={{ opacity: 0.9 }} />

              <Typography variant="h4" sx={{ color: 'common.white', fontWeight: 700 }}>
                What Our Devotees Say
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: (theme) => alpha(theme.palette.common.white, 0.85) }}
              >
                Real experiences from devotees who trust Adhyatmah.
              </Typography>

              <Button
                variant="contained"
                endIcon={<FaArrowRight size={13} />}
                sx={{
                  mt: 1,
                  bgcolor: 'common.white',
                  color: 'primary.main',
                  fontWeight: 700,
                  borderRadius: 10,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.common.white, 0.9)
                  }
                }}
              >
                View All Reviews
              </Button>
            </Stack>
          </Box>

          {/* ---------------- Moving small cards ---------------- */}
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <TestimonialCarousel data={testimonials} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}