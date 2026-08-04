'use client';

import PropTypes from 'prop-types';
import Link from 'next/link';
import { styled, alpha } from '@mui/material/styles';
import { Box, Typography, Card, Skeleton, Stack, Button } from '@mui/material';
import { MdEdit } from 'react-icons/md';
import BlurImageAvatar from '@/components/avatar';
import { fDate } from '@/utils/format-time';

const RootStyle = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: theme.palette.primary.main,
  '&:before': {
    content: "''",
    position: 'absolute',
    top: '-23%',
    left: '20%',
    transform: 'translateX(-50%)',
    backgroundColor: alpha(theme.palette.primary.light, 0.5),
    height: 130,
    width: 130,
    borderRadius: '100px',
    zIndex: 0
  },
  '&:after': {
    content: "''",
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '-5%',
    backgroundColor: alpha(theme.palette.primary.light, 0.5),
    height: 130,
    width: 130,
    borderRadius: '100px',
    zIndex: 0
  }
}));

const InfoStyle = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'left'
  }
}));

export default function AdminUserProfileCard({ user, isLoading }) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  // `cover.url` is the up-to-date profile photo (same field the vendors/users
  // list uses). `image` is a legacy field used elsewhere (e.g. booking
  // snapshots) and can be stale, so it must not take priority here — that
  // was causing the list and detail views to show different photos for the
  // same vendor.
  const avatarSrc = user?.cover?.url || user?.image || '/images/default-avatar.png';
  const shopSlug = user?.shop?.slug;

  return (
    <RootStyle>
      {!isLoading && shopSlug && (
        <Button
          component={Link}
          href={`/admin/shops/edit/${shopSlug}`}
          startIcon={<MdEdit />}
          variant="contained"
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2,
            bgcolor: 'common.white',
            color: 'primary.main',
            '&:hover': { bgcolor: 'common.white', opacity: 0.9 }
          }}
        >
          Edit Profile
        </Button>
      )}
      <InfoStyle>
        {isLoading ? (
          <Skeleton variant="circular" width={128} height={128} />
        ) : (
          <BlurImageAvatar
            src={avatarSrc}
            alt={fullName}
            sx={{
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: 'common.white',
              width: { xs: 96, md: 128 },
              height: { xs: 96, md: 128 }
            }}
          />
        )}

        <Stack
          spacing={0.5}
          sx={{
            mt: { xs: 2, md: 0 },
            ml: { md: 3 },
            color: 'common.white'
          }}
        >
          <Typography variant="h4">
            {isLoading ? <Skeleton variant="text" width={220} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} /> : fullName}
          </Typography>
          <Typography sx={{ opacity: 0.9 }}>
            {isLoading ? <Skeleton variant="text" width={200} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} /> : user?.email}
          </Typography>
          <Typography sx={{ opacity: 0.85 }}>
            {isLoading ? (
              <Skeleton variant="text" width={160} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            ) : (
              user?.phone || '—'
            )}
          </Typography>
          {user?.createdAt && (
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Registered: {fDate(user.createdAt)}
            </Typography>
          )}
        </Stack>
      </InfoStyle>
    </RootStyle>
  );
}

AdminUserProfileCard.propTypes = {
  user: PropTypes.object,
  isLoading: PropTypes.bool
};