import React from 'react';
import PropTypes from 'prop-types';

// mui
import { TableRow, Skeleton, TableCell, Stack, IconButton, Tooltip, Chip } from '@mui/material';

// icons
import { MdEdit } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';

export default function LanguageRow({ isLoading, row, handleClickOpen, onClickEdit }) {
    return (
        <TableRow hover key={Math.random()}>
            <TableCell>
                <Stack direction="row" gap={1} alignItems={'center'}>
                    {isLoading ? <Skeleton variant="text" /> : row.label || row.name}
                </Stack>
            </TableCell>

            <TableCell>{isLoading ? <Skeleton variant="text" /> : <> {row.name} </>}</TableCell>

            <TableCell>{isLoading ? <Skeleton variant="text" /> : <> {row.order ?? '-'} </>}</TableCell>

            <TableCell>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    <Chip
                        size="small"
                        label={row?.status}
                        color={row?.status?.toLowerCase() === 'active' ? 'success' : 'error'}
                    />
                )}
            </TableCell>
            <TableCell align="right">
                <Stack direction="row" justifyContent="flex-end">
                    {isLoading ? (
                        <>
                            <Skeleton variant="circular" width={34} height={34} sx={{ mr: 1 }} />
                            <Skeleton variant="circular" width={34} height={34} />
                        </>
                    ) : (
                        <>
                            <Tooltip title="Edit">
                                <IconButton onClick={() => onClickEdit(row)}>
                                    <MdEdit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton onClick={handleClickOpen(row._id)}>
                                    <MdDelete />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Stack>
            </TableCell>
        </TableRow>
    );
}
LanguageRow.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    row: PropTypes.shape({
        name: PropTypes.string,
        label: PropTypes.string,
        _id: PropTypes.string,
        createdAt: PropTypes.string,
        status: PropTypes.string,
        order: PropTypes.number
    }).isRequired,
    handleClickOpen: PropTypes.func.isRequired
};