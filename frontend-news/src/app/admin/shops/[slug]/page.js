'use client';
import React, { use } from 'react';
import PropTypes from 'prop-types';

// mui

// components
import ShopDetailCover from '@/components/_admin/shops/shop-detail-cover';
import ShopDetail from '@/components/_admin/shops/shop-details';
import ShopIcomeList from '../../../../components/_admin/shops/shop-income';
// Pandit shops: same component the admin "Vendor Details" page uses (avatar
// card + Edit Details + Vendor Details/Pooja Services/Booking History/SEO
// Content tabs). Reusing it here (keyed off the shop's owning vendor) gives
// the Shop page the identical details + edit experience without duplicating
// that UI.
import UserProfile from '@/components/_admin/users/user-details';
// Seller ("Sell Products") shops: tabbed Shop Details / Products / Orders,
// styled like the Pandit "Vendor Details" tabs above (UserProfile) instead
// of the separate SEO/Pooja/Booking tabs Pandits have, since a seller shop
// has none of that.
import SellerShopTabs from '@/components/_admin/shops/seller-shop-tabs';

// icons
import { FaGifts } from 'react-icons/fa6';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { TbChartArrowsVertical } from 'react-icons/tb';
import { FaWallet } from 'react-icons/fa6';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';
import { useTheme, Stack } from '@mui/material';

Page.propTypes = { params: PropTypes.object.isRequired };

export default function Page(props) {
  const params = use(props.params);

  const { slug } = params;

  const theme = useTheme();

  const [count, setCount] = React.useState(0);
  const { data, isPending: isLoading } = useQuery({
    queryKey: ['shop-by-admin', slug, count],
    queryFn: () => api.getShopDetailsByAdmin(slug)
  });

  // Seller ("Sell Products") shops are created through a lightweight form
  // that never asks for Government ID / Proof of Address — those only
  // exist for the Pandit "Become a Pandit" flow. Showing empty download
  // links for seller shops was misleading, so swap them for the contact
  // details that flow actually does collect.
  const isSellerShop = data?.data?.shopType === 'seller';

  const dataMain = [
    { name: 'Total Income', items: data?.totalEarnings, color: theme.palette.error.main, icon: <FaWallet size={30} /> },
    {
      name: 'Total Commission',
      items: data?.totalCommission,
      color: theme.palette.success.main,
      icon: <TbChartArrowsVertical size={30} />
    },

    {
      name: 'Total Orders',
      items: data?.totalOrders,
      color: theme.palette.secondary.main,
      icon: <HiOutlineClipboardList size={30} />
    },

    {
      name: 'Total Products',
      items: data?.totalProducts,
      color: theme.palette.primary.main,
      icon: <FaGifts size={30} />
    },

    ...(isSellerShop
      ? [
        {
          name: 'Contact Email',
          items: data?.data?.shopEmail || data?.data?.email || '—',
          color: theme.palette.primary.main,
          icon: <FaGifts size={30} />
        },
        {
          name: 'Contact Phone',
          items: data?.data?.shopPhone || data?.data?.phone || '—',
          color: theme.palette.primary.main,
          icon: <FaGifts size={30} />
        }
      ]
      : [
        {
          name: 'Government ID',
          url: data?.data?.identityVerification?.governmentId?.url,
          isDoc: true,
          color: theme.palette.primary.main,
          icon: <FaGifts size={30} />
        },
        {
          name: 'Proof Of Address',
          url: data?.data?.identityVerification?.proofOfAddress?.url,
          isDoc: true,
          color: theme.palette.primary.main,
          icon: <FaGifts size={30} />
        }
      ])
  ];
  // The vendor who owns this shop — Shop.vendor is a plain User _id (not
  // populated by the backend), which is exactly what UserProfile needs.
  const vendorId = data?.data?.vendor;

  return (
    <Stack gap={2}>
      <ShopDetailCover data={data?.data} isLoading={isLoading} compact fallbackAvatar={data?.vendorCover} />
      {isLoading ? (
        // Shop type isn't known yet (isSellerShop defaults to false while
        // `data` is undefined) — show a neutral loading placeholder instead
        // of guessing the pandit branch every time.
        <ShopDetail data={dataMain} docsData={data} isLoading={isLoading} />
      ) : isSellerShop ? (
        <SellerShopTabs
          shop={data?.data}
          isLoading={isLoading}
          slug={slug}
          dataMain={dataMain}
          shopId={data?.data?._id}
          count={count}
          onUpdatePayment={() => setCount((prev) => prev + 1)}
        />
      ) : (
        <>
          {vendorId && <UserProfile id={vendorId} />}
          <ShopDetail data={dataMain} docsData={data} isLoading={isLoading} />
          <ShopIcomeList slug={slug} shopId={data?.data?._id} onUpdatePayment={() => setCount((prev) => prev + 1)} count={count} />
        </>
      )}
    </Stack>
  );
}