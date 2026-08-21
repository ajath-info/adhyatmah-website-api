'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

// mui
import {
  Box,
  TextField,
  Button,
  Menu,
  MenuItem,
  Typography,
  InputAdornment,
  Paper,
  Stack,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import { IoSearchOutline } from 'react-icons/io5';
import { HiChevronDown } from 'react-icons/hi2';
import { GiPrayer } from 'react-icons/gi';
import { MdOutlineSpa } from 'react-icons/md';
import { HiOutlineShoppingBag } from 'react-icons/hi2';

import { searchPanditsByName, getHomepagePoojaServicesAll, search as searchProductsApi } from '@/services';

const COLLECTION_OPTIONS = [
  { value: 'all', label: 'All Collection' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'books', label: 'Books' },
  { value: 'festivals', label: 'Festival Collection' },
  { value: 'new-arrivals', label: 'New Arrivals' },
  { value: 'bestsellers', label: 'Bestsellers' }
];

export default function SearchEnhanced() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCollection, setSelectedCollection] = React.useState('all');
  const [collectionAnchor, setCollectionAnchor] = React.useState(null);
  const collectionOpen = Boolean(collectionAnchor);

  // ---- Pandit Ji / Puja Service suggestions (new, additive) ----
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = React.useState(false);
  const [panditResults, setPanditResults] = React.useState([]);
  const [serviceResults, setServiceResults] = React.useState([]);
  const [productResults, setProductResults] = React.useState([]);
  const allServicesCacheRef = React.useRef(null); // caches full active service list, fetched once
  const debounceRef = React.useRef(null);
  const requestIdRef = React.useRef(0);

  const fetchAllServicesOnce = React.useCallback(async () => {
    if (allServicesCacheRef.current) return allServicesCacheRef.current;
    try {
      const res = await getHomepagePoojaServicesAll('page=1&limit=100');
      const list = res?.data || res?.payload?.services || [];
      allServicesCacheRef.current = list;
      return list;
    } catch (error) {
      console.error('Service list fetch error:', error);
      return [];
    }
  }, []);

  const runSuggestionSearch = React.useCallback(
    async (query) => {
      const currentRequestId = ++requestIdRef.current;
      setSuggestionsLoading(true);
      try {
        const [panditRes, allServices, productRes] = await Promise.all([
          searchPanditsByName(query).catch((error) => {
            console.error('Pandit search error:', error);
            return null;
          }),
          fetchAllServicesOnce(),
          searchProductsApi({ query, first: 5 }).catch((error) => {
            console.error('Product search error:', error);
            return null;
          })
        ]);

        // Ignore stale responses (older than the latest keystroke)
        if (currentRequestId !== requestIdRef.current) return;

        const pandits = panditRes?.payload?.vendors || [];
        const lowerQuery = query.toLowerCase();
        const matchedServices = (allServices || [])
          .filter((service) => service?.name?.toLowerCase().includes(lowerQuery))
          .slice(0, 5);

        // Same Shopify-style -> internal transform used by the existing
        // header search dialog (components/dialog/search.js), so field
        // names line up with what the rest of the app already expects.
        const rawProducts = productRes?.payload?.results || [];
        const matchedProducts = rawProducts.slice(0, 5).map((product) => ({
          id: product._id || product.id,
          name: product.name || product.title,
          slug: product.slug || product.handle,
          image: product.image?.url || product.featuredImage?.url || '',
          salePrice: product.salePrice || parseFloat(product.priceRange?.minVariantPrice?.amount) || 0
        }));

        setPanditResults(pandits.slice(0, 5));
        setServiceResults(matchedServices);
        setProductResults(matchedProducts);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setSuggestionsLoading(false);
        }
      }
    },
    [fetchAllServicesOnce]
  );

  const handleQueryChange = (value) => {
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestionsOpen(false);
      setPanditResults([]);
      setServiceResults([]);
      setProductResults([]);
      return;
    }

    setSuggestionsOpen(true);
    debounceRef.current = setTimeout(() => {
      runSuggestionSearch(trimmed);
    }, 300);
  };

  const handlePanditSelect = (vendor) => {
    setSuggestionsOpen(false);
    if (vendor?.slug) {
      router.push(`/${vendor.slug}`);
    }
  };

  const handleServiceSelect = (service) => {
    setSuggestionsOpen(false);
    if (service?.id) {
      router.push(`/offline-puja-services/${service.id}?name=${encodeURIComponent(service.name || '')}`);
    }
  };

  const handleProductSelect = (product) => {
    setSuggestionsOpen(false);
    if (product?.slug) {
      router.push(`/product/${product.slug}`);
    }
  };

  const hasSuggestions = panditResults.length > 0 || serviceResults.length > 0 || productResults.length > 0;

  const handleCollectionClick = (event) => {
    setCollectionAnchor(event.currentTarget);
  };

  const handleCollectionClose = (collectionValue = null) => {
    if (collectionValue) {
      setSelectedCollection(collectionValue);
    }
    setCollectionAnchor(null);
  };

  const handleSearch = async () => {
    setSuggestionsOpen(false);
    if (searchQuery.trim()) {
      try {
        // Use the correct API endpoint with GET method
        const params = new URLSearchParams({
          q: searchQuery.trim()
        });

        if (selectedCollection !== 'all') {
          params.append('collection', selectedCollection);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`);

        if (response.ok) {
          // API call successful, redirect to products page
          router.push(`/products?${params.toString()}`);
        } else {
          // API call failed, still redirect
          router.push(`/products?${params.toString()}`);
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to simple navigation even if API fails
        const params = new URLSearchParams({
          q: searchQuery.trim()
        });

        if (selectedCollection !== 'all') {
          params.append('collection', selectedCollection);
        }

        router.push(`/products?${params.toString()}`);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const selectedCollectionLabel =
    COLLECTION_OPTIONS.find((option) => option.value === selectedCollection)?.label || 'All Collection';

  return (
    <ClickAwayListener onClickAway={() => setSuggestionsOpen(false)}>
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 850 }}>
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        border: '1.5px solid',
        borderColor: 'divider',
        borderRadius: 50,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        width: '100%',
        maxWidth: 850,
        transition: 'all 0.25s ease',
        boxShadow: (theme) => `0 2px 10px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(232,119,34,0.06)'}`,
        '&:focus-within': {
          borderColor: '#FB8B05',
          boxShadow: '0 4px 16px rgba(232,119,34,0.18)'
        }
      }}
    >
      {/* Collection Dropdown */}

      <Menu anchorEl={collectionAnchor} open={collectionOpen} onClose={() => handleCollectionClose()}>
        {COLLECTION_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleCollectionClose(option.value)}
            selected={selectedCollection === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Search Input */}
      <TextField
        px={5}
        variant="outlined"
        placeholder="Search Pandit Ji, Puja Services or Products"
        value={searchQuery}
        onChange={(e) => handleQueryChange(e.target.value)}
        onFocus={() => {
          if (searchQuery.trim().length >= 2) setSuggestionsOpen(true);
        }}
        onKeyPress={handleKeyPress}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            border: 'none',
            '& fieldset': {
              border: 'none'
            },
            '&:hover fieldset': {
              border: 'none'
            },
            '&.Mui-focused fieldset': {
              border: 'none'
            }
          },
          '& .MuiInputBase-input': {
            padding: '18px 8px',
            fontSize: '1rem',
            color: 'text.primary',
            '&::placeholder': {
              color: 'text.secondary',
              opacity: 1
            }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box sx={{ color: '#FB8B05', ml: 2, display: 'flex' }}>
                <IoSearchOutline size={22} />
              </Box>
            </InputAdornment>
          )
        }}
      />
      {/* <Button
        onClick={handleCollectionClick}
        endIcon={<HiChevronDown />}
        sx={{
          minWidth: 140,
          height: '56px',
          marginRight: 2,
          borderRadius: 0,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'grey.50',
          color: 'text.secondary',
          fontSize: '0.875rem',
          fontWeight: 500,
          '&:hover': {
            bgcolor: 'grey.100'
          }
        }}
      >
        {selectedCollectionLabel}
      </Button> */}
      {/* Search Button */}
      <Button
        onClick={handleSearch}
        variant="contained"
        sx={{
          height: 50,
          width: 50,
          minWidth: 50,
          my: 0.75,
          mr: 0.75,
          p: 0,
          borderRadius: '50%',
          bgcolor: '#FB8B05',
          color: 'white',
          boxShadow: '0 3px 10px rgba(232,119,34,0.35)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#E07D04',
            boxShadow: '0 4px 14px rgba(232,119,34,0.45)',
            transform: 'scale(1.05)'
          },
          '&:active': {
            transform: 'scale(0.97)'
          }
        }}
      >
        <IoSearchOutline size={21} />
      </Button>
    </Paper>

    {/* Pandit Ji / Puja Service suggestions dropdown - additive, doesn't affect product search flow */}
    {suggestionsOpen && (
      <Paper
        elevation={6}
        sx={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          zIndex: 20,
          borderRadius: 3,
          overflow: 'hidden',
          maxHeight: 420,
          overflowY: 'auto'
        }}
      >
        {suggestionsLoading && (
          <Stack alignItems="center" justifyContent="center" py={3}>
            <CircularProgress size={22} sx={{ color: '#FB8B05' }} />
          </Stack>
        )}

        {!suggestionsLoading && !hasSuggestions && (
          <Box sx={{ py: 3, px: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No matching Pandit Ji, Puja service or Product found
            </Typography>
          </Box>
        )}

        {!suggestionsLoading && panditResults.length > 0 && (
          <>
            <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
              Pandit Ji
            </Typography>
            <List dense disablePadding>
              {panditResults.map((vendor) => (
                <ListItemButton key={vendor.id} onClick={() => handlePanditSelect(vendor)}>
                  <ListItemAvatar>
                    <Avatar src={vendor?.image?.url} sx={{ bgcolor: 'rgba(251,139,5,0.12)', color: '#FB8B05' }}>
                      <GiPrayer size={18} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${vendor.firstName || ''} ${vendor.lastName || ''}`.trim()}
                    secondary={vendor.city || 'Pandit Ji'}
                  />
                </ListItemButton>
              ))}
            </List>
          </>
        )}

        {!suggestionsLoading && panditResults.length > 0 && serviceResults.length > 0 && <Divider />}

        {!suggestionsLoading && serviceResults.length > 0 && (
          <>
            <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
              Puja Services
            </Typography>
            <List dense disablePadding>
              {serviceResults.map((service) => (
                <ListItemButton key={service.id} onClick={() => handleServiceSelect(service)}>
                  <ListItemAvatar>
                    <Avatar src={service?.image?.url} variant="rounded" sx={{ bgcolor: 'rgba(251,139,5,0.12)', color: '#FB8B05' }}>
                      <MdOutlineSpa size={18} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={service.name} secondary={service.duration} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}

        {!suggestionsLoading && (panditResults.length > 0 || serviceResults.length > 0) && productResults.length > 0 && <Divider />}

        {!suggestionsLoading && productResults.length > 0 && (
          <>
            <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
              Products
            </Typography>
            <List dense disablePadding>
              {productResults.map((product) => (
                <ListItemButton key={product.id} onClick={() => handleProductSelect(product)}>
                  <ListItemAvatar>
                    <Avatar src={product?.image} variant="rounded" sx={{ bgcolor: 'rgba(251,139,5,0.12)', color: '#FB8B05' }}>
                      <HiOutlineShoppingBag size={18} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={product.salePrice ? `₹${product.salePrice}` : null}
                  />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </Paper>
    )}
    </Box>
    </ClickAwayListener>
  );
}