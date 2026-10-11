'use client';
import React from 'react';
import PropTypes from 'prop-types';

// mui
import { Stack, TextField, Typography, Button, IconButton, Box, Divider } from '@mui/material';
// icons
import { MdAdd, MdDelete } from 'react-icons/md';

const MAX_VARIANTS = 10;

const emptyVariant = () => ({
  key: '',
  name: '',
  price: '',
  originalPrice: '',
  duration: '',
  status: 'active'
});

MasterServiceVariantsEditor.propTypes = {
  variants: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  defaultDuration: PropTypes.string
};

/**
 * Optional "Puja Options" editor for a Master Service.
 *
 * Leave it empty and the puja behaves exactly as before. Add rows and the
 * website shows a popup with these options (each with its own price) when
 * the puja card is clicked. Existing pandits of this puja automatically get
 * all options - nothing needs to be assigned per pandit.
 */
export default function MasterServiceVariantsEditor({ variants, onChange, defaultDuration }) {
  const updateRow = (index, patch) => {
    onChange(variants.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const addRow = () => {
    if (variants.length >= MAX_VARIANTS) return;
    onChange([...variants, emptyVariant()]);
  };

  return (
    <Stack gap={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="overline" color="text.primary">
          Puja Options (Variants) - optional
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<MdAdd />}
          onClick={addRow}
          disabled={variants.length >= MAX_VARIANTS}
        >
          Add option
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        {/* If you add options here, clicking this puja on the website opens a popup with these options and
        their own prices. The same pandits stay available for every option. Price changes here affect only
        new bookings; existing bookings never change. Leave this empty for a normal puja. Set an option
        to inactive to hide it; remove all options to go back to the normal flow. */}
      </Typography>

      {variants.map((row, index) => (
        <Box key={row.key || `new-${index}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
          <Stack gap={2}>
            <Stack direction="row" gap={1} alignItems="flex-start">
              <TextField
                fullWidth
                size="small"
                label="Option name"
                value={row.name}
                onChange={(event) => updateRow(index, { name: event.target.value })}
                placeholder="e.g. Navratri Puja (Navdurga Puja)"
              />
              <IconButton aria-label="Remove option" color="error" onClick={() => removeRow(index)}>
                <MdDelete />
              </IconButton>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <TextField
                size="small"
                type="number"
                label="Price (₹)"
                value={row.price}
                onChange={(event) => updateRow(index, { price: event.target.value })}
                fullWidth
              />
              <TextField
                size="small"
                type="number"
                label="Original price (₹)"
                value={row.originalPrice}
                onChange={(event) => updateRow(index, { originalPrice: event.target.value })}
                fullWidth
              />
              <TextField
                size="small"
                label="Duration"
                value={row.duration}
                onChange={(event) => updateRow(index, { duration: event.target.value })}
                placeholder={defaultDuration || 'e.g. 2-3 Hrs'}
                fullWidth
              />
              <TextField
                select
                size="small"
                label="Status"
                value={row.status || 'active'}
                onChange={(event) => updateRow(index, { status: event.target.value })}
                slotProps={{ select: { native: true } }}
                fullWidth
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </TextField>
            </Stack>
          </Stack>
        </Box>
      ))}

      {variants.length > 0 && <Divider />}
    </Stack>
  );
}