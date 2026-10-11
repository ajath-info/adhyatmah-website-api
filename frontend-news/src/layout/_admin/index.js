'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'src/redux';
import { toggleSidebar } from 'src/redux/slices/settings';

// mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

// components
import DashboardAppbar from './topbar';
import DashboardSidebar from './sidebar';
import { useSelector } from 'react-redux';

// styles
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar
}));

export default function MiniDrawer({ children, branding }) {
  const { openSidebar } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  // Hydration fix: `openSidebar` comes from redux-persist (localStorage), which
  // the server can never see. The server always renders with the slice's
  // default (`false`), so if a returning visitor's browser rehydrates it to
  // `true` before/at the first client render, the sidebar's open-dependent
  // markup (aria-labels, arrow icon, extra chevrons) mismatches the server
  // HTML and React throws a hydration error. Rendering with the same default
  // as the server until after mount avoids the mismatch, then the real
  // persisted preference kicks in on the next render.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const open = mounted ? openSidebar : false;

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <DashboardAppbar branding={branding} open={open} handleDrawerToggle={handleDrawerToggle} />

      <DashboardSidebar handleDrawerToggle={handleDrawerToggle} open={open} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, position: 'relative', overflow: 'hidden' }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
MiniDrawer.propTypes = {
  children: PropTypes.node.isRequired
};