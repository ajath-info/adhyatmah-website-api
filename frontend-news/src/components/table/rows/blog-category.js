import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';

import { styled } from '@mui/material/styles';
import {
  Box,
  TableRow,
  Skeleton,
  TableCell,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';

import { MdEdit, MdDelete } from 'react-icons/md';

import BlurImage from '@/components/blur-image';

import { fDateShort } from '@/utils/format-time';

BlogCategory.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
  handleClickOpen: PropTypes.func.isRequired
};

const ThumbImgStyle = styled(Box)(({ theme }) => ({
  width: 50,
  height: 50,
  minWidth: 50,
  objectFit: 'cover',
  background: theme.palette.background.default,
  marginRight: theme.spacing(2),
  border: '1px solid ' + theme.palette.divider,
  borderRadius: theme.shape.borderRadiusSm,
  position: 'relative',
  overflow: 'hidden'
}));

export default function BlogCategory({
  isLoading,
  row,
  handleClickOpen
}) {

  const router = useRouter();

  return (

    <TableRow hover>

      <TableCell>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >

          {isLoading ? (
            <Skeleton
              variant="rectangular"
              width={50}
              height={50}
              sx={{
                borderRadius: 1
              }}
            />
          ) : (
            <ThumbImgStyle>

              <BlurImage
                priority
                fill
                alt={row?.title}
                src={row?.image?.url || "/placeholder.png"}
                objectFit="cover"
              />

            </ThumbImgStyle>
          )}

          <Typography
            variant="subtitle2"
            noWrap
          >

            {isLoading
              ? (
                <Skeleton
                  variant="text"
                  width={120}
                />
              )
              : row?.title}

          </Typography>

        </Box>

      </TableCell>

      <TableCell>

        {
          isLoading
            ? <Skeleton />
            : row?.description
        }

      </TableCell>

      <TableCell>

        {

          isLoading

            ? <Skeleton />

            : (

              <Chip
                size="small"
                label={
                  row?.status
                    ? "Active"
                    : "Inactive"
                }
                color={
                  row?.status
                    ? "success"
                    : "error"
                }
              />

            )

        }

      </TableCell>

      <TableCell>

        {

          isLoading

            ? <Skeleton />

            : fDateShort(row.createdAt)

        }

      </TableCell>

      <TableCell align="right">

        <Stack
          direction="row"
          justifyContent="flex-end"
        >

          {

            isLoading

              ? (

                <>

                  <Skeleton
                    variant="circular"
                    width={35}
                    height={35}
                  />

                  <Skeleton
                    variant="circular"
                    width={35}
                    height={35}
                    sx={{
                      ml: 1
                    }}
                  />

                </>

              )

              : (

                <>

                  <Tooltip title="Edit">

                    <IconButton
                      onClick={() =>
                        router.push(
                          `/admin/blog-categories/${row.handle}`
                        )
                      }
                    >

                      <MdEdit />

                    </IconButton>

                  </Tooltip>

                  <Tooltip title="Delete">

                    <IconButton
                      onClick={handleClickOpen(row.handle)}
                    >

                      <MdDelete />

                    </IconButton>

                  </Tooltip>

                </>

              )

          }

        </Stack>

      </TableCell>

    </TableRow>

  );

}