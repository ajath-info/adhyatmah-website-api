'use client';

import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Tabs, Tab, Box } from '@mui/material';

import AdminUserProfileCard from './admin-user-profile-card';
import VendorProfileDetails from './vendor-profile-details';
import UserBookingHistory from './user-booking-history';
import UserOrderHistory from './user-order-history';
import PoojaServicesTab from './pooja-services-tab';
import VendorSeoContentTab from './vendor-seo-content-tab';

import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

UserProfile.propTypes = { id: PropTypes.string.isRequired };

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vendor-tabpanel-${index}`}
      aria-labelledby={`vendor-tab-${index}`}
    >
      <Box sx={{ pt: 3 }}>{children}</Box>
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired
};

export default function UserProfile({ id }) {
  const [tabValue, setTabValue] = useState(0);

  // The theme's MuiTab override (src/theme/overrides/tabs.js) adds a
  // marginRight between tabs via emotion's CSS-in-JS. That stylesheet is
  // injected asynchronously, slightly after MUI's Tabs component measures
  // each tab's offsetLeft/offsetWidth to position the orange indicator bar.
  // The result: the indicator gets placed using pre-margin positions, so it
  // ends up shifted left of the label text - worse for tabs further to the
  // right. Explicitly re-running Tabs' own updateIndicator() once after
  // mount (via the official `action` ref MUI exposes) re-measures the tabs
  // after all styles have settled and snaps the indicator back under the
  // correct label.
  const tabsActionRef = useRef(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      tabsActionRef.current?.updateIndicator();
    });
    return () => cancelAnimationFrame(frame);
  }, [tabValue]);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['user-details', id],
    queryFn: () => api.getUserByAdmin(id),
    enabled: !!id,
    retry: false
  });

  const user = data?.user || null;
  const isVendor = user?.role === 'vendor';

  return (
    <div>
      <AdminUserProfileCard user={user} isLoading={isLoading} />

      {isVendor ? (
        <Box sx={{ width: '100%', mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              action={tabsActionRef}
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              aria-label="vendor details tabs"
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons={false}
            >
              <Tab label="Vendor Details" id="vendor-tab-0" aria-controls="vendor-tabpanel-0" />
              <Tab label="Pooja Services" id="vendor-tab-1" aria-controls="vendor-tabpanel-1" />
              <Tab label="Booking History" id="vendor-tab-2" aria-controls="vendor-tabpanel-2" />
              <Tab label="SEO Content" id="vendor-tab-3" aria-controls="vendor-tabpanel-3" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <VendorProfileDetails user={user} isLoading={isLoading} embedded />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <PoojaServicesTab vendorId={id} />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <UserBookingHistory userId={id} isVendorView embedded />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <VendorSeoContentTab user={user} isLoading={isLoading} />
          </TabPanel>
        </Box>
      ) : (
        <Box sx={{ width: '100%', mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              action={tabsActionRef}
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              aria-label="user details tabs"
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons={false}
            >
              <Tab label="Booking History" id="user-tab-0" aria-controls="user-tabpanel-0" />
              <Tab label="Order History" id="user-tab-1" aria-controls="user-tabpanel-1" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <UserBookingHistory userId={id} isVendorView={false} embedded />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <UserOrderHistory userId={id} embedded />
          </TabPanel>
        </Box>
      )}
    </div>
  );
}