'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

// mui
import { Box, TextField, Button, Menu, MenuItem, Typography, InputAdornment, Paper, Stack } from '@mui/material';
import { IoSearchOutline } from 'react-icons/io5';
import { HiChevronDown } from 'react-icons/hi2';

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
        placeholder="Search our product"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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
  );
}