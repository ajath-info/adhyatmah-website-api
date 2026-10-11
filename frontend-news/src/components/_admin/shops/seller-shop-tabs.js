'use client';

import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Box, Stack } from '@mui/material';

import SellerShopDetails from './seller-shop-details';
import ShopProductsTab from './shop-products-tab';
import ShopOrdersTab from './shop-orders-tab';
import ShopDetail from './shop-details';
import ShopIcomeList from './shop-income';

function TabPanel({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index} id={`seller-shop-tabpanel-${index}`} aria-labelledby={`seller-shop-tab-${index}`}>
            <Box sx={{ pt: 3 }}>{children}</Box>
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    value: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired
};

export default function SellerShopTabs({ shop, isLoading, slug, dataMain, shopId, count, onUpdatePayment }) {
    const [tabValue, setTabValue] = useState(0);

    // Same indicator re-measure fix used by the Pandit "Vendor Details" tabs
    // (src/components/_admin/users/user-details.js) — the theme's MuiTab
    // margin is applied slightly after MUI first measures tab positions, so
    // the orange indicator bar starts out misaligned without this.
    const tabsActionRef = useRef(null);
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            tabsActionRef.current?.updateIndicator();
        });
        return () => cancelAnimationFrame(frame);
    }, [tabValue]);

    return (
        <Box sx={{ width: '100%', mt: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    action={tabsActionRef}
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    aria-label="seller shop details tabs"
                    textColor="primary"
                    indicatorColor="primary"
                    variant="scrollable"
                    scrollButtons={false}
                >
                    <Tab label="Shop Details" id="seller-shop-tab-0" aria-controls="seller-shop-tabpanel-0" />
                    <Tab label="Products" id="seller-shop-tab-1" aria-controls="seller-shop-tabpanel-1" />
                    <Tab label="Orders" id="seller-shop-tab-2" aria-controls="seller-shop-tabpanel-2" />
                    <Tab label="Payments" id="seller-shop-tab-3" aria-controls="seller-shop-tabpanel-3" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <SellerShopDetails shop={shop} isLoading={isLoading} slug={slug} embedded />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ShopProductsTab slug={slug} embedded />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <ShopOrdersTab slug={slug} embedded />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
                <Stack gap={2}>
                    <ShopDetail data={dataMain} isLoading={isLoading} />
                    <ShopIcomeList slug={slug} shopId={shopId} onUpdatePayment={onUpdatePayment} count={count} />
                </Stack>
            </TabPanel>
        </Box>
    );
}

SellerShopTabs.propTypes = {
    shop: PropTypes.object,
    isLoading: PropTypes.bool,
    slug: PropTypes.string,
    dataMain: PropTypes.array,
    shopId: PropTypes.string,
    count: PropTypes.number,
    onUpdatePayment: PropTypes.func
};