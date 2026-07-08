'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';

// mui
import { Tabs, Tab, Box } from '@mui/material';

// components
import Table from 'src/components/table/table';
import OrderList from '@/components/table/rows/order';
import ProfileCover from '@/components/_main/profile/profile-cover';
import PoojaServicesTab from './pooja-services-tab';
import BookingDetailsTab from './booking-details-tab';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

UserProfile.propTypes = { id: PropTypes.string.isRequired };

const TABLE_HEAD = [
  { id: 'name', label: 'Product' },
  { id: 'total', label: 'total' },
  { id: 'inventoryType', label: 'Status' },
  { id: 'price', label: 'Price' },
  { id: 'quantity', label: 'Quantity' },
  { id: 'date', label: 'Date' },
  { id: '', label: 'Actions' }
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserProfile({ id }) {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const [tabValue, setTabValue] = useState(0);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['user-details', id, pageParam],
    queryFn: () => api.getUserByAdmin(`${id}?page=${pageParam || 1}`),
    enabled: !!id,
    retry: false
  });

  // const isVendor = data?.user?.role === 'vendor' || data?.user?.isPandit;
  const isVendor =
    data?.user?.role === 'vendor' ||
    data?.user?.role === 'pandit' ||
    data?.user?.isPandit === true ||
    !!data?.user?.services?.length;


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const user = data?.user || null;
  const orders = data?.orders || null;
  const tableData = { data: orders, count: data?.count };

  return (
    <div>
      <ProfileCover data={user} isLoading={isLoading} />

      {!isVendor ? (
        <Box sx={{ mt: 3 }}>
          <Table headData={TABLE_HEAD} data={tableData} isLoading={isLoading} row={OrderList} isUser />
        </Box>
      ) : (
        <Box sx={{ width: '100%', mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="vendor details tabs"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Pooja Services" />
              <Tab label="Booking Details" />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <PoojaServicesTab vendorId={id} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <BookingDetailsTab vendorId={id} />
          </TabPanel>
        </Box>
      )}
    </div>
  );
}
