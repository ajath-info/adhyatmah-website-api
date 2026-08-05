'use client';
import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

// mui
import { Box, Button, IconButton, Stack, useMediaQuery, Popover, alpha } from '@mui/material';

// icons
import { RxDashboard } from 'react-icons/rx';
import { FaAngleDown } from 'react-icons/fa6';
import { FaOm } from 'react-icons/fa';

// components
import SearchEnhanced from '@/components/widgets/search-enhanced';
import NestedList from '@/components/lists/desktop-menu-list';

// Theme
import { useTheme } from '@mui/material/styles';

export default function SecondaryHeader({ categories = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();

  // 🙏 Hide "Become a Pandit Ji" for ANY logged-in user (customer, pandit/vendor, or admin);
  // show it only to logged-out guests.
  const { isAuthenticated } = useSelector(({ user }) => user);

  // Same fix already used in navbar/navigation-menu: the server always renders
  // logged-out (it has no access to the auth token in localStorage/redux-persist),
  // so `isAuthenticated` can briefly disagree with the server HTML on first paint.
  // Gate on mount so this button starts in the same "visible" state as the server,
  // then correctly hides once the real auth state is confirmed on the client.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const showAuthenticatedUI = mounted && isAuthenticated;

  /* ---------------- ActionBar Category Button ---------------- */
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Don't show the search bar / categories bar on auth pages
  // (sign-in, sign-up, forget-password, verify-otp, reset-password, etc.)
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <Box sx={{ top: { xs: 56, md: 64 }, zIndex: 998, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box
        sx={{
          maxWidth: '1383px',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3
        }}
      >
        {/* 🔥 ActionBar Categories Button */}
        {!isMobile && (
          <>
            <Stack>
              <IconButton
                onClick={handleClick}
                aria-label="Categories"
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  color: '#fff',
                  bgcolor: '#Fb8B05',
                  boxShadow: '0 3px 10px rgba(232,119,34,0.35)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: '#C5651D',
                    boxShadow: '0 5px 16px rgba(232,119,34,0.45)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <RxDashboard size={20} />
              </IconButton>

              <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left'
                }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      borderRadius: 3,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.14)'
                    }
                  }
                }}
              >
                <NestedList data={categories} onClose={handleClose} />
              </Popover>
            </Stack>
          </>
        )}

        {/* 🔍 Search */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <SearchEnhanced />
        </Box>

        {/* 🙏 Become a Pandit Ji — hidden (but space reserved) for any logged-in user,
             so the search bar's width never shifts on login/logout */}
        {!isMobile && (
          <Button
            component={Link}
            href="/create-shop"
            variant="contained"
            disableElevation
            sx={{
              flexShrink: 0,
              borderRadius: 50,
              height: 50,
              py: 0,
              px: { md: 2.5, lg: 3.25 },
              fontWeight: 700,
              fontSize: { md: 13.5, lg: 14.5 },
              letterSpacing: 0.3,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              color: '#fff',
              bgcolor: '#E87722',
              boxShadow: '0 3px 10px rgba(232,119,34,0.35)',
              transition: 'all 0.25s ease',
              visibility: showAuthenticatedUI ? 'hidden' : 'visible',
              pointerEvents: showAuthenticatedUI ? 'none' : 'auto',
              '&:hover': {
                bgcolor: '#C5651D',
                boxShadow: '0 5px 16px rgba(232,119,34,0.45)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              }
            }}
            startIcon={<FaOm size={16} />}
          >
              Free Registration (For Pandit Ji)
          </Button>
        )}
      </Box>
    </Box>
  );
}

SecondaryHeader.propTypes = {
  categories: PropTypes.array.isRequired
};