'use client';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
import { useQuery } from '@tanstack/react-query';

// mui
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Radio, Stack, Typography } from '@mui/material';
// icons
import { MdAccessTime, MdClose } from 'react-icons/md';
// api
import * as api from 'src/services';

PujaVariantsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  service: PropTypes.object,
  // Pandit-profile flow: options are passed in and the parent decides where to
  // go next via onSelect. Without these the dialog fetches the options itself
  // and continues to the pandit list (puja listing flow).
  variants: PropTypes.array,
  onSelect: PropTypes.func
};

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

/**
 * Popup shown when a puja (MasterService) has admin-defined variants,
 * e.g. the Navratri Puja options. The user picks one option and continues to
 * the normal pandit list for that puja - the same pandits are shown for every
 * option and the existing booking flow takes over from there.
 */
export default function PujaVariantsDialog({ open, onClose, service, variants: presetVariants, onSelect }) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState('');

  // Fresh prices on open (the listing page itself is cached for ~60s).
  const { data, isPending } = useQuery({
    queryKey: ['puja-variants', service?.name],
    enabled: open && !onSelect && Boolean(service?.name),
    queryFn: () => api.getHomepagePoojaServicesAll('page=1&limit=100'),
    staleTime: 0,
    refetchOnMount: 'always'
  });

  const freshService = (data?.data || []).find(
    (item) => String(item.id) === String(service?.id) || item.name === service?.name
  );
  // Use fresh data when we have it, otherwise what the card was rendered with.
  const variants = onSelect
    ? presetVariants || []
    : freshService
      ? freshService.variants || []
      : service?.variants || [];
  const loadingVariants = onSelect ? false : isPending;
  const selected = variants.find((variant) => variant.key === selectedKey) || null;

  const baseUrl = `/offline-puja-services/${service?.id}?name=${encodeURIComponent(service?.name || '')}`;

  const handleContinue = () => {
    if (onSelect) {
      if (!selected) return;
      onClose();
      onSelect(selected);
      return;
    }
    if (variants.length === 0) {
      // Options were removed by admin after this page loaded: normal flow.
      onClose();
      router.push(baseUrl);
      return;
    }
    if (!selected) return;
    onClose();
    router.push(
      `${baseUrl}&variant=${encodeURIComponent(selected.key)}&vname=${encodeURIComponent(selected.name)}`
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h5" component="span" sx={{ display: 'block' }}>
          Select {service?.name} option
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Choose the puja you want to book.
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {variants.length === 0 && !loadingVariants ? (
          <Typography variant="body2" color="text.secondary">
            Continue to see available pandits for {service?.name}.
          </Typography>
        ) : (
          <Stack gap={1.5}>
            {variants.map((variant) => {
              const isSelected = variant.key === selectedKey;
              const showOriginal = Number(variant.originalPrice) > Number(variant.price);

              return (
                <Box
                  key={variant.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedKey(variant.key)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedKey(variant.key);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: isSelected ? '#fb8b05' : 'divider',
                    background: isSelected ? 'rgba(251,139,5,0.07)' : 'transparent',
                    transition: 'all .15s ease'
                  }}
                >
                  <Radio
                    checked={isSelected}
                    tabIndex={-1}
                    disableRipple
                    sx={{ p: 0.5, color: '#fb8b05', '&.Mui-checked': { color: '#fb8b05' } }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {variant.name}
                    </Typography>
                    {variant.duration && (
                      <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.25 }}>
                        <MdAccessTime size={13} color="#b86000" />
                        <Typography variant="caption" sx={{ color: '#b86000', fontWeight: 600 }}>
                          {variant.duration}
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {formatPrice(variant.price)}
                    </Typography>
                    {showOriginal && (
                      <Typography variant="caption" sx={{ color: '#aaa', textDecoration: 'line-through' }}>
                        {formatPrice(variant.originalPrice)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={variants.length > 0 && !selected}
          sx={{ textTransform: 'none', borderRadius: '50px', px: 3, background: '#fb8b05', boxShadow: 'none', '&:hover': { background: '#fb8b05', opacity: 0.85, boxShadow: 'none' } }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}