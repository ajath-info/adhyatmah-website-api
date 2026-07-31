'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';

import { Tabs, Tab, Box } from '@mui/material';

import AdminUserProfileCard from './admin-user-profile-card';
import VendorProfileDetails from './vendor-profile-details';
import UserBookingHistory from './user-booking-history';
import PoojaServicesTab from './pooja-services-tab';

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
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              aria-label="vendor details tabs"
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Vendor Details" id="vendor-tab-0" aria-controls="vendor-tabpanel-0" />
              <Tab label="Pooja Services" id="vendor-tab-1" aria-controls="vendor-tabpanel-1" />
              <Tab label="Booking History" id="vendor-tab-2" aria-controls="vendor-tabpanel-2" />
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
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <UserBookingHistory userId={id} isVendorView={false} />
        </Box>
      )}
    </div>
  );
}
