'use client';
import React from 'react';
import Link from 'next/link';

// mui
import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';

// icons
import { FaOm } from 'react-icons/fa';

// Scrolls exactly one copy of the content to the left, then loops seamlessly
// (the content is rendered twice, so translating by -50% lands on the same frame).
const scroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

// Edit these lines to change what the bar shows.
const MESSAGES = [
  'ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः',
  'असतो मा सद्गमय तमसो मा ज्योतिर्गमय',
  'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
  'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
  'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्',
  'अतिथि देवो भव',
  'वसुधैव कुटुम्बकम्',
  'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते'
];

function Row({ ariaHidden = false }) {
  return (
    <Box
      aria-hidden={ariaHidden || undefined}
      sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
    >
      {MESSAGES.map((text) => (
        <Box
          key={text}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: { xs: 2.5, md: 4 },
            whiteSpace: 'nowrap'
          }}
        >
          <FaOm size={12} style={{ color: '#FFD27A', flexShrink: 0 }} />
          <span>{text}</span>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Thin promo strip shown above the navbar. It is NOT sticky: it scrolls away
 * with the page, while the existing sticky Navbar keeps sticking to the top.
 * Clicking it opens the combo offers page.
 */
export default function AnnouncementBar() {
  return (
    <Box
      component={Link}
      href="/puja-combos"
      aria-label="View puja combo offers"
      sx={{
        display: 'block',
        overflow: 'hidden',
        textDecoration: 'none',
        color: '#fff',
        background: 'linear-gradient(90deg, #7A1F0B 0%, #B8400E 50%, #7A1F0B 100%)',
        fontSize: { xs: 12, md: 13 },
        fontWeight: 600,
        letterSpacing: 0.2,
        lineHeight: 1,
        py: { xs: 1, md: 1.1 },
        '&:hover .announcement-track': { animationPlayState: 'paused' }
      }}
    >
      <Box
        className="announcement-track"
        sx={{
          display: 'flex',
          width: 'max-content',
          willChange: 'transform',
          animation: `${scroll} 70s linear infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
        }}
      >
        <Row />
        <Row ariaHidden />
      </Box>
    </Box>
  );
}