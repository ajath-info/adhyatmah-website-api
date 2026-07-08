'use client';

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from '@bprogress/next';

import { Typography, Card, Box, Skeleton, Stack, Button, Rating, Chip, Modal, Backdrop, Fade, IconButton } from '@mui/material';

import Image from '@/components/blur-image';
import DefaultImage from 'public/images/default-avatar.png';

import { FiEye, FiMapPin, FiZoomIn, FiX } from 'react-icons/fi';
import { MdOutlineWorkOutline } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';

const createVendorSlug = (vendor) => {
  const firstName = vendor?.firstName || '';
  const lastName = vendor?.lastName || '';
  const fullName = `${firstName}-${lastName}`;

  const cleanedSlug = fullName
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!cleanedSlug) {
    return `pandit-${vendor?.id || vendor?._id}`;
  }

  return cleanedSlug;
};

// ── IMAGE ZOOM MODAL ──────────────────────────────────────────────────────────
function ImageZoomModal({ open, onClose, src, name }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: {
            backgroundColor: 'rgba(15, 8, 2, 0.85)',
            backdropFilter: 'blur(8px)'
          }
        }
      }}
    >
      <Fade in={open} timeout={300}>
        <Box
          onClick={onClose}
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            p: 2
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                background: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.1)'
              },
              transition: 'all .2s ease'
            }}
          >
            <FiX size={20} />
          </IconButton>

          {/* Image Container */}
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '3px solid rgba(245,137,26,0.6)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 380,
              height: 380,
              background: '#1a0f06',
              animation: 'zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <Image
              alt={name || 'Pandit'}
              src={src || DefaultImage}
              fill
              style={{ objectFit: 'cover' }}
            />

            {/* Name overlay at bottom */}
            {name && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(20,8,0,0.9) 0%, transparent 100%)',
                  px: 2.5,
                  py: 2,
                  textAlign: 'center'
                }}
              >
                <Typography
                  sx={{
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 0.3
                  }}
                >
                  {name}
                </Typography>
                <Typography
                  sx={{
                    color: '#f59e0b',
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    mt: 0.3
                  }}
                >
                  Pandit Ji
                </Typography>
              </Box>
            )}
          </Box>

          {/* Hint text */}
          <Typography
            sx={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12,
              letterSpacing: 0.5,
              whiteSpace: 'nowrap'
            }}
          >
            Click anywhere to close
          </Typography>

          <style>{`
            @keyframes zoomIn {
              from { opacity: 0; transform: scale(0.7); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </Box>
      </Fade>
    </Modal>
  );
}

// ── VENDOR CARD ───────────────────────────────────────────────────────────────
export default function VendorCard({
  vendor,
  isLoading,
  singleActionButton = false,
  singleActionLabel = 'View Details & Book',
  singleActionHref
}) {
  const router = useRouter();
  const baseUrl = '/';

  const [zoomOpen, setZoomOpen] = useState(false);

  const handleAvatarClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setZoomOpen(true);
  }, [isLoading]);

  const handleZoomClose = useCallback(() => setZoomOpen(false), []);

  const rating = vendor?.rating || 4.5;

  const randomViews = vendor?.views || Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
  const views = randomViews >= 1000 ? (randomViews / 1000).toFixed(1) + 'K' : randomViews;

  const langLabel = vendor?.language?.[0]
    ? vendor.language[0].charAt(0).toUpperCase() + vendor.language[0].slice(1)
    : 'Hindi';

  const languages = vendor?.language?.slice(0, 5) || [];
  const extraCount = vendor?.language?.length > 5 ? vendor.language.length - 5 : 0;
  const formatLang = (lang) => lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();

  const vendorFullName = `${vendor?.firstName || ''} ${vendor?.lastName || ''}`.trim();

  const metaItems = [
    { icon: <FiMapPin size={14} />, label: vendor?.city || '-' },
    { icon: <MdOutlineWorkOutline size={14} />, label: `${vendor?.experience || 0} Years` },
    {
      icon: (
        <Typography sx={{ fontSize: 14, fontWeight: 900, color: '#6b5a4a', lineHeight: 1, WebkitTextStroke: '0.5px #6b5a4a' }}>
          ॐ
        </Typography>
      ),
      label: `${vendor?.services?.length || 0} Types of pooja`
    }
  ];

  return (
    <>
      {/* ── ZOOM MODAL ── */}
      <ImageZoomModal
        open={zoomOpen}
        onClose={handleZoomClose}
        src={vendor?.image?.url || DefaultImage}
        name={vendorFullName || null}
      />

      <Card
        sx={{
          borderRadius: '28px',
          overflow: 'hidden',
          position: 'relative',
          background: '#fff7ed',
          border: '1px solid #f1e3d3',
          transition: 'all .25s ease',
          boxShadow: '0 8px 40px rgba(200,100,0,0.10)',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 16px 30px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* ── TOP ORANGE BAR ── */}
        <Box
          sx={{
            height: 120,
            background: '#f5891a',
            borderRadius: '0 0 50% 50% / 0 0 38px 38px',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* VIEWS BADGE */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(0,0,0,0.32)',
              borderRadius: '20px',
              px: 1.2,
              py: 0.6,
              zIndex: 10
            }}
          >
            <FiEye size={13} color="#fff" />
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
              {views}
            </Typography>
          </Stack>

          {/* CORNER SHAPE */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: -1,
              width: 150,
              height: 150,
              overflow: 'hidden',
              borderRadius: '0 24px 0 0',
              pointerEvents: 'none'
            }}
          >
            <svg
              width="150"
              height="150"
              viewBox="5 0 70 290"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{ display: 'block' }}
            >
              <defs>
                <linearGradient id="cornerGrad" x1="0%" y1="0%" x2="10%" y2="10%">
                  <stop offset="100%" style={{ stopColor: '#748e9f', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                d="M 160,0 L 0,0 C 30,0 10,55 40,75 C 70,95 55,140 160,160 Z"
                fill="url(#cornerGrad)"
              />
            </svg>
          </Box>

          {/* LANG LABEL */}
          <Typography
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: 11,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: 0.6,
              lineHeight: 1.5,
              zIndex: 6
            }}
          >
            {langLabel} Pandit
          </Typography>
        </Box>

        {/* ── AVATAR ── */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-52px', position: 'relative', zIndex: 20 }}>
          {isLoading ? (
            <Skeleton variant="circular" width={104} height={104} />
          ) : (
            <Box
              onClick={handleAvatarClick}
              sx={{
                width: 104,
                height: 104,
                borderRadius: '50%',
                border: '4px solid #fff',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                background: '#e8e0d8',
                position: 'relative',
                cursor: 'zoom-in',
                // Zoom-in overlay on hover
                '&:hover .zoom-overlay': {
                  opacity: 1
                },
                '&:hover img': {
                  transform: 'scale(1.08)'
                }
              }}
            >
              <Image
                alt="vendor"
                src={vendor?.image?.url || DefaultImage}
                width={104}
                height={104}
                style={{
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  display: 'block'
                }}
              />

              {/* Hover overlay with zoom icon */}
              <Box
                className="zoom-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'rgba(245,137,26,0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.25s ease',
                  backdropFilter: 'blur(1px)'
                }}
              >
                <FiZoomIn size={26} color="#fff" strokeWidth={2.5} />
              </Box>
            </Box>
          )}
        </Box>

        {/* ── BODY ── */}
        <Box sx={{ px: 2.5, pb: 3.5, textAlign: 'center' }}>

          {/* NAME */}
          <Typography
            {...(!isLoading && { component: Link, href: baseUrl + createVendorSlug(vendor) })}
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: '#2d1a0e',
              mt: 1.5,
              display: 'block',
              cursor: 'pointer',
              textDecoration: 'none',
              lineHeight: 1.3
            }}
          >
            {isLoading ? <Skeleton width={160} sx={{ mx: 'auto' }} /> : vendorFullName}
          </Typography>

          {/* ROLE BADGE */}
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              mt: 1,
              background: '#fff3e0',
              border: '1.5px solid #ffcc80',
              color: '#e65100',
              fontSize: 11,
              fontWeight: 600,
              px: 2.2,
              py: 0.6,
              borderRadius: '8px',
              letterSpacing: 0.5
            }}
          >
            {vendor?.about || 'Pandit Ji'}
          </Box>

          {/* ── META INFO ── */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mt: 2, mb: 1 }}
          >
            {isLoading ? (
              <Skeleton width="80%" sx={{ mx: 'auto' }} />
            ) : (
              metaItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ px: 1 }}
                  >
                    <Box sx={{ color: '#6b5a4a', display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#6b5a4a' }}>
                      {item.label}
                    </Typography>
                  </Stack>
                  {idx < metaItems.length - 1 && (
                    <Typography sx={{ color: '#c8a98d', fontSize: 16, lineHeight: 1 }}>|</Typography>
                  )}
                </React.Fragment>
              ))
            )}
          </Stack>

          {/* LANGUAGE TAGS */}
          <Stack direction="row" justifyContent="center" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : languages.length > 0 ? (
              <>
                {languages.map((lang, index) => (
                  <Chip
                    key={index}
                    label={formatLang(lang)}
                    size="small"
                    sx={{
                      borderRadius: '50px',
                      fontSize: 13,
                      background: 'transparent',
                      border: '1.5px solid #f59e0b',
                      color: '#1a1208',
                      px: 0.5,
                      '&:hover': { background: '#f59e0b', color: '#fff' },
                      transition: 'background .2s, color .2s'
                    }}
                  />
                ))}
                {extraCount > 0 && (
                  <Chip
                    label={`+${extraCount}`}
                    size="small"
                    sx={{ borderRadius: '50px', fontSize: 13, background: '#f5eadc', border: '1px dashed #c8a98d' }}
                  />
                )}
              </>
            ) : (
              <Typography fontSize={12}>-</Typography>
            )}
          </Stack>

          {/* RATING */}
          {!isLoading && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mt: 1.5 }}>
              <Rating value={rating} precision={0.5} readOnly size="small" sx={{ color: '#f59e0b' }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1208' }}>{rating}</Typography>
            </Stack>
          )}

          {/* BUTTONS */}
          <Stack direction="row" spacing={1.2} sx={{ mt: 2.5 }}>
            {isLoading ? (
              <Skeleton width="100%" height={46} sx={{ borderRadius: '50px' }} />
            ) : singleActionButton ? (
              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  router.push(
                    singleActionHref ||
                    (baseUrl + createVendorSlug(vendor))
                  )
                }
                sx={{
                  borderRadius: '50px',
                  textTransform: 'none',
                  background: '#f5891a',
                  fontWeight: 700,
                  fontSize: 13,
                  py: 1.2,
                  boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                  '&:hover': {
                    background: '#e08a00',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 22px rgba(245,158,11,0.45)'
                  }
                }}
              >
                {singleActionLabel}
              </Button>
            ) : (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push(baseUrl + createVendorSlug(vendor))}
                  sx={{
                    borderRadius: '50px',
                    textTransform: 'none',
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    color: '#fb8b05',
                    fontWeight: 600,
                    fontSize: 13,
                    py: 1.2,
                    '&:hover': {
                      borderColor: '#f59e0b',
                      borderWidth: 2,
                      background: '#fff3d6',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  View Profile
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AiOutlineUser />}
                  onClick={() => router.push(baseUrl + createVendorSlug(vendor))}
                  sx={{
                    borderRadius: '50px',
                    textTransform: 'none',
                    background: '#f5891a',
                    fontWeight: 700,
                    fontSize: 13,
                    py: 1.2,
                    boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                    '&:hover': {
                      background: '#e08a00',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 22px rgba(245,158,11,0.45)'
                    }
                  }}
                >
                  Book Pooja
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Card>
    </>
  );
}

VendorCard.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  singleActionButton: PropTypes.bool,
  singleActionHref: PropTypes.string,
  singleActionLabel: PropTypes.string,
  vendor: PropTypes.object
};


