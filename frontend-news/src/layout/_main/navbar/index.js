'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { sum } from 'lodash';
import { useSelector } from 'react-redux';

// mui
import { alpha } from '@mui/material/styles';
import { Toolbar, Stack, AppBar, useMediaQuery, Container, Badge, Button } from '@mui/material';
import { BiBell } from 'react-icons/bi';
import { HiOutlineShoppingCart } from 'react-icons/hi';

// components
import Logo from '@/components/logo';
import UserSelect from '@/components/select/user-select';
import NavigationMenu from '@/components/_main/navigation-menu';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// dynamic import
const MobileBar = dynamic(() => import('@/layout/_main/mobile-bar'));

export default function Navbar({ branding }) {

  const { isAuthenticated } = useSelector(({ user }) => user);
  const { checkout } = useSelector(({ product }) => product);
  const cartItemsCount = sum((checkout?.cart || []).map((item) => item.quantity));

  const isMobile = useMediaQuery('(max-width:992px)');
  const [hoverBell, setHoverBell] = React.useState(false);
  const [hoverCart, setHoverCart] = React.useState(false);

  return (
    <>
      <AppBar
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          borderRadius: 0,
          bgcolor: (theme) => theme.palette.background.paper,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          display: { md: 'block', xs: 'none' },
          '& .toolbar': {
            justifyContent: 'space-between',
            bgcolor: (theme) => theme.palette.background.paper,
            px: 3,
            py: 1.5,
            minHeight: 88
          }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters className="toolbar">

            {/* Left - Logo */}
            <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
              <Logo branding={branding} />
            </Stack>

            {/* Center - Menu */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{ flex: 1, px: 2 }}
            >
              <NavigationMenu />
            </Stack>

            {/* Right - Language + Bell + Login/Register */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>

              {/* Language Switcher */}
              <Stack
                sx={{
                  width: 'auto',
                  flex: '0 0 auto',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LanguageSwitcher />
              </Stack>

              {/* Bell / Notifications */}
              <Stack
                alignItems="center"
                justifyContent="center"
                onMouseEnter={() => setHoverBell(true)}
                onMouseLeave={() => setHoverBell(false)}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid #F9A34A',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  backgroundColor: hoverBell ? '#F9A34A' : 'transparent'
                }}
              >
                <Badge
                  badgeContent={0}
                  color="error"
                  overlap="circular"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      minWidth: 16,
                      height: 16,
                      top: -2,
                      right: -2
                    }
                  }}
                >
                  <BiBell
                    size={20}
                    color={hoverBell ? '#fff' : '#F9A34A'}
                  />
                </Badge>
              </Stack>

              {/* Cart */}
              <Stack
                component="a"
                href="/cart"
                alignItems="center"
                justifyContent="center"
                onMouseEnter={() => setHoverCart(true)}
                onMouseLeave={() => setHoverCart(false)}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid #F9A34A',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  backgroundColor: hoverCart ? '#F9A34A' : 'transparent'
                }}
              >
                <Badge
                  badgeContent={cartItemsCount}
                  color="error"
                  overlap="circular"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      minWidth: 16,
                      height: 16,
                      top: -2,
                      right: -2
                    }
                  }}
                >
                  <HiOutlineShoppingCart
                    size={20}
                    color={hoverCart ? '#fff' : '#F9A34A'}
                  />
                </Badge>
              </Stack>

              {/* Login / Register Button */}
              {!isAuthenticated ? (
                <Button
                  variant="contained"
                  href="/auth/sign-in"
                  sx={{
                    bgcolor: '#FB8BO5',
                    borderRadius: 6,
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: 'none',
                    boxShadow: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: '#d06a1a',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Sign in
                </Button>
              ) : (
                <UserSelect />
              )}

            </Stack>

          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Top Bar - Logo + Hamburger (menu drawer holds Bell, Cart & Sign in) */}
      <AppBar
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          borderRadius: 0,
          bgcolor: (theme) => theme.palette.background.paper,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          display: { xs: 'block', md: 'none' },
          '& .toolbar': {
            justifyContent: 'space-between',
            bgcolor: (theme) => theme.palette.background.paper,
            px: 2,
            py: 1,
            minHeight: 64
          }
        }}
      >
        <Toolbar disableGutters className="toolbar">

          {/* Left - Logo */}
          <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
            <Logo branding={branding} />
          </Stack>

          {/* Right - Hamburger (Bell, Cart & Sign in now live inside the menu drawer) */}
          <Stack direction="row" alignItems="center" sx={{ flexShrink: 0, mr: 1 }}>
            <NavigationMenu />
          </Stack>

        </Toolbar>
      </AppBar>

      {isMobile && <MobileBar />}
    </>
  );
}