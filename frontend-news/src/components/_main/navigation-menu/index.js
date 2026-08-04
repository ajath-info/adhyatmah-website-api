'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { sum } from 'lodash';
import { useSelector } from 'react-redux';

// MUI
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Paper,
  Fade,
  Badge
} from '@mui/material';

import { FiMenu, FiChevronDown } from 'react-icons/fi';
import { BiBell } from 'react-icons/bi';
import { HiOutlineShoppingCart } from 'react-icons/hi';

// components
import UserSelect from '@/components/select/user-select';

// Theme
import { useTheme } from '@mui/material/styles';

/* ---------------- DATA ---------------- */
/* Each item can optionally have a `children` array for a dropdown */

const NAVIGATION_ITEMS = [
  {
    label: 'Home',
    href: '/'
  },
  {
    label: 'Pandit Ji',
    href: '/book-pandit-online',
    children: [
      { label: 'Find Pandit Ji', href: '/book-pandit-online' },
      { label: 'Become a Pandit Ji', href: '/create-shop' }
    ]
  },

  {
    label: 'Puja Booking',
    href: '/offline-puja-services',
    children: [
      { label: 'Book Offline Puja', href: '/offline-puja-services' },
      { label: 'Book Online Puja', href: '/online-puja-services' }
    ]
  },

  // {
  //   label: 'Online Puja',
  //   href: '/online-puja-services',
  //   children: [
  //     { label: 'All Online Pujas', href: '/online-puja-services' }
  //   ]
  // },
  
  {
    label: 'Spiritual E-Commerce',
    href: '/puja-products-online-store',
    children: [
      { label: 'All Products', href: '/puja-products-online-store' },
      { label: 'Brands', href: '/puja-product-brands-online' }
    ]
  },
  {
    label: 'Panchang & Muhurat',
    href: '/panchang-muhurat',
    children: [
      { label: 'Panchang & Muhurat', href: '/panchang-muhurat' }
    ]
  },
  {
    label: 'Blogs',
    href: '/blogs'
  }
];

/* ---------------- COMPONENT ---------------- */

export default function NavigationMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { isAuthenticated } = useSelector(({ user }) => user);
  const { checkout } = useSelector(({ product }) => product);
  const cartItemsCount = sum((checkout?.cart || []).map((item) => item.quantity));

  // Same fix as navbar: server always renders logged-out, client can restore
  // auth state instantly from redux-persist -> mismatch. Gate on mount.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const showAuthenticatedUI = mounted && isAuthenticated;

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openSubMenus, setOpenSubMenus] = React.useState({});
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  const navigate = (href) => {
    router.push(href);
    setMobileOpen(false);
  };

  const toggleSubMenu = (label) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  /* ---------------- MOBILE DRAWER ---------------- */

  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileOpen}
      onClose={toggleMobile}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          bgcolor: 'background.paper'
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            Menu
          </Typography>

          {/* Bell + Cart */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid #F9A34A',
                cursor: 'pointer'
              }}
            >
              <Badge
                badgeContent={0}
                color="error"
                overlap="circular"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    minWidth: 14,
                    height: 14,
                    top: -2,
                    right: -2
                  }
                }}
              >
                <BiBell size={18} color="#F9A34A" />
              </Badge>
            </Stack>

            <Stack
              component="a"
              href="/cart"
              onClick={() => setMobileOpen(false)}
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid #F9A34A',
                cursor: 'pointer'
              }}
            >
              <Badge
                badgeContent={cartItemsCount}
                color="error"
                overlap="circular"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    minWidth: 14,
                    height: 14,
                    top: -2,
                    right: -2
                  }
                }}
              >
                <HiOutlineShoppingCart size={18} color="#F9A34A" />
              </Badge>
            </Stack>
          </Stack>
        </Stack>

        {/* Login / Register or User */}
        {!showAuthenticatedUI ? (
          <Button
            fullWidth
            variant="contained"
            href="/auth/sign-in"
            onClick={() => setMobileOpen(false)}
            sx={{
              bgcolor: '#fb8b05',
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
      </Box>

      <List disablePadding>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const hasChildren = Boolean(item.children?.length);
          const isOpen = openSubMenus[item.label];

          return (
            <React.Fragment key={item.label}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() =>
                    hasChildren ? toggleSubMenu(item.label) : navigate(item.href)
                  }
                  sx={{
                    py: 1.75,
                    px: 3,
                    fontWeight: isActive ? 800 : 600,
                    letterSpacing: 1,
                    bgcolor: isActive ? '#fb8b05' : 'transparent',
                    color: isActive ? '#ffffff' : 'text.primary',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: '#fb8b05',
                      color: '#ffffff'
                    }
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 800 : 600,
                      color: 'inherit'
                    }}
                  />
                  {hasChildren && (
                    <FiChevronDown
                      size={16}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease'
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>

              {hasChildren && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.label} disablePadding>
                        <ListItemButton
                          onClick={() => navigate(child.href)}
                          sx={{
                            py: 1.25,
                            pl: 5,
                            pr: 3,
                            fontWeight: 500,
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'rgba(251, 139, 5, 0.08)',
                              color: '#fb8b05'
                            }
                          }}
                        >
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{ fontSize: 14 }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Drawer>
  );

  /* ---------------- DESKTOP MENU ---------------- */

  const DesktopNavItem = ({ item }) => {
    const [open, setOpen] = React.useState(false);
    const isActive = pathname === item.href;
    const hasChildren = Boolean(item.children?.length);

    const handleOpen = () => {
      if (hasChildren) setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleSelect = (href) => {
      handleClose();
      router.push(href);
    };

    return (
      <Box
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        sx={{ display: 'inline-block', position: 'relative' }}
      >
        <Button
          component={Link}
          href={item.href}
          onClick={(e) => {
            if (hasChildren) e.preventDefault();
          }}
          endIcon={
            hasChildren ? (
              <FiChevronDown
                size={14}
                style={{
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease'
                }}
              />
            ) : null
          }
          sx={{
            px: { xs: 1, md: 1.25, lg: 2 },
            py: 1.5,
            minWidth: 'auto',
            fontSize: { xs: 12.5, md: 13, lg: 14 },
            fontWeight: isActive ? 800 : 600,
            letterSpacing: '0.3px',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 8,
            color: isActive ? '#ffffff' : 'text.primary',
            zIndex: 0,
            '& .MuiButton-endIcon': { ml: 0.25 },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundColor: '#fb8b05',
              borderRadius: 8,
              transform: isActive || open ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.35s ease',
              zIndex: -1
            },
            '&:hover::before': {
              transform: 'translateX(0)'
            },
            '&:hover': {
              color: '#ffffff'
            }
          }}
        >
          {item.label}
        </Button>

        {hasChildren && (
          <Fade in={open}>
            <Paper
              elevation={0}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                mt: 0.5,
                minWidth: 220,
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                py: 1,
                zIndex: 1300,
                // Extra invisible padding bridges the gap between the
                // button and the dropdown so onMouseLeave doesn't fire
                // while the cursor is travelling down to it.
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -8,
                  left: 0,
                  right: 0,
                  height: 8
                }
              }}
            >
              {item.children.map((child) => (
                <Box
                  key={child.label}
                  onClick={() => handleSelect(child.href)}
                  sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    py: 1,
                    px: 2.5,
                    cursor: 'pointer',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'rgba(251, 139, 5, 0.08)',
                      color: '#fb8b05'
                    }
                  }}
                >
                  {child.label}
                </Box>
              ))}
            </Paper>
          </Fade>
        )}
      </Box>
    );
  };

  const DesktopNavigation = () => (
    <Stack direction="row" alignItems="center" spacing={0} sx={{ flexWrap: 'nowrap' }}>
      {NAVIGATION_ITEMS.map((item) => (
        <DesktopNavItem key={item.label} item={item} />
      ))}
    </Stack>
  );

  /* ---------------- RENDER ---------------- */

  return (
    <>
      {isMobile && (
        <IconButton onClick={toggleMobile}>
          <FiMenu size={20} />
        </IconButton>
      )}

      {!isMobile && <DesktopNavigation />}

      {isMobile && <MobileDrawer />}
    </>
  );
}