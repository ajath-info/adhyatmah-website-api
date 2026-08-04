// 'use client';
// import React, { useMemo } from 'react';
// import PropTypes from 'prop-types';
// import { Box, Card, Stack, Typography, Rating, Avatar, Chip, alpha } from '@mui/material';
// import { keyframes } from '@mui/material/styles';
// import { FaFemale, FaMale, FaTransgender } from 'react-icons/fa';

// // Continuous right-to-left scroll
// const scroll = keyframes`
//   from { transform: translateX(0); }
//   to { transform: translateX(-50%); }
// `;

// function TestimonialCard({ item }) {
//   const fullName =
//     item.user?.firstName && item.user?.lastName
//       ? `${item.user.firstName} ${item.user.lastName}`
//       : item.user?.firstName || item.user?.lastName || 'Anonymous';

//   const location = item.user?.city || '';
//   const badge = item.category || item.tag || item.service;

//   return (
//     <Card
//       sx={{
//         position: 'relative',
//         flex: '0 0 auto',
//         width: { xs: 270, sm: 320 },
//         p: 2.5,
//         mx: 1.25,
//         borderRadius: 3,
//         border: '1px solid',
//         borderColor: (theme) => alpha(theme.palette.primary.main, 0.14),
//         bgcolor: 'background.paper',
//         boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.08)}`
//       }}
//     >
//       <Stack spacing={1.25}>
//         <Stack direction="row" alignItems="center" justifyContent="space-between">
//           <Rating value={item.rating} readOnly size="small" sx={{ color: 'primary.main' }} />
//           {badge && (
//             <Chip
//               label={badge}
//               size="small"
//               sx={{
//                 bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
//                 color: 'primary.dark',
//                 fontWeight: 600,
//                 fontSize: 10.5,
//                 textTransform: 'uppercase',
//                 height: 22
//               }}
//             />
//           )}
//         </Stack>

//         <Typography
//           sx={{
//             fontStyle: 'italic',
//             color: 'text.primary',
//             lineHeight: 1.55
//           }}
//         >
//           "{item.review}"
//         </Typography>

//         <Stack direction="row" spacing={1.25} alignItems="center" pt={0.5}>
//           {item.user?.cover?.url ? (
//             <Avatar
//               src={item.user.cover.url}
//               alt={fullName}
//               sx={{ width: 38, height: 38 }}
//             />
//           ) : (
//             <Avatar sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), width: 38, height: 38 }}>
//               {item?.user?.gender === 'female' ? (
//                 <FaFemale color="#e91e63" size={16} />
//               ) : item?.user?.gender === 'male' ? (
//                 <FaMale color="#2196f3" size={16} />
//               ) : (
//                 <FaTransgender color="#9c27b0" size={16} />
//               )}
//             </Avatar>
//           )}

//           <Stack spacing={0}>
//             <Typography variant="subtitle2" noWrap sx={{ maxWidth: 190 }}>
//               {fullName}
//             </Typography>
//             {location && (
//               <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 190 }}>
//                 {location}
//               </Typography>
//             )}
//           </Stack>
//         </Stack>
//       </Stack>
//     </Card>
//   );
// }

// TestimonialCard.propTypes = { item: PropTypes.object.isRequired };

// export default function TestimonialCarousel({ data }) {
//   // Duplicate the list enough times so the strip is always wider than the
//   // viewport and the loop never shows a blank gap, regardless of how many
//   // reviews are passed in.
//   const loopData = useMemo(() => {
//     const items = data || [];
//     if (!items.length) return [];
//     // Pad the base set so it's wide enough on its own, then mirror it once.
//     // Since both halves are the exact same width, translateX(-50%) always
//     // lands perfectly on the next copy with no jump or blank gap.
//     const copiesNeeded = Math.max(1, Math.ceil(8 / items.length));
//     const baseSet = Array.from({ length: copiesNeeded }).flatMap(() => items);
//     return [...baseSet, ...baseSet];
//   }, [data]);

//   if (!data?.length) return null;

//   return (
//     <Box
//       sx={{
//         position: 'relative',
//         width: '100%',
//         overflow: 'hidden',
//         py: 0.5,
//         maskImage: 'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%)',
//         WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%)'
//       }}
//     >
//       <Box
//         sx={{
//           display: 'flex',
//           width: 'max-content',
//           animation: `${scroll} 32s linear infinite`,
//           '&:hover': { animationPlayState: 'paused' }
//         }}
//       >
//         {loopData.map((item, index) => (
//           <TestimonialCard key={index} item={item} />
//         ))}
//       </Box>
//     </Box>
//   );
// }

// TestimonialCarousel.propTypes = {
//   data: PropTypes.array.isRequired
// };


'use client';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, Stack, Typography, Rating, Avatar, Chip, alpha } from '@mui/material';
import { keyframes } from '@mui/material/styles';

// Continuous right-to-left scroll
const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

// Deterministic color palette for initials avatars, so a given name always
// gets the same color — no randomness, no external photos, no flicker on
// refresh.
const AVATAR_COLORS = ['#EF6C00', '#8E24AA', '#00897B', '#3949AB', '#D81B60', '#43A047', '#6D4C41'];

function stringToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return '?';
  return parts.length === 1 ? parts[0][0].toUpperCase() : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function TestimonialCard({ item }) {
  const fullName =
    item.user?.firstName && item.user?.lastName
      ? `${item.user.firstName} ${item.user.lastName}`
      : item.user?.firstName || item.user?.lastName || 'Anonymous';

  const location = item.user?.city || '';
  const badge = item.category || item.tag || item.service;

  return (
    <Card
      sx={{
        position: 'relative',
        flex: '0 0 auto',
        width: { xs: 270, sm: 320 },
        p: 2.5,
        mx: 1.25,
        borderRadius: 3,
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.14),
        bgcolor: 'background.paper',
        boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.08)}`
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Rating value={item.rating} readOnly size="small" sx={{ color: 'primary.main' }} />
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.dark',
                fontWeight: 600,
                fontSize: 10.5,
                textTransform: 'uppercase',
                height: 22
              }}
            />
          )}
        </Stack>

        <Typography
          sx={{
            fontStyle: 'italic',
            color: 'text.primary',
            lineHeight: 1.55
          }}
        >
          "{item.review}"
        </Typography>

        <Stack direction="row" spacing={1.25} alignItems="center" pt={0.5}>
          {item.user?.cover?.url ? (
            <Avatar
              src={item.user.cover.url}
              alt={fullName}
              sx={{ width: 38, height: 38 }}
            />
          ) : (
            <Avatar
              sx={{
                bgcolor: stringToColor(fullName),
                color: 'common.white',
                width: 38,
                height: 38,
                fontSize: 14,
                fontWeight: 700
              }}
            >
              {getInitials(fullName)}
            </Avatar>
          )}

          <Stack spacing={0}>
            <Typography variant="subtitle2" noWrap sx={{ maxWidth: 190 }}>
              {fullName}
            </Typography>
            {location && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 190 }}>
                {location}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

TestimonialCard.propTypes = { item: PropTypes.object.isRequired };

export default function TestimonialCarousel({ data }) {
  // Duplicate the list enough times so the strip is always wider than the
  // viewport and the loop never shows a blank gap, regardless of how many
  // reviews are passed in.
  const loopData = useMemo(() => {
    const items = data || [];
    if (!items.length) return [];
    // Pad the base set so it's wide enough on its own, then mirror it once.
    // Since both halves are the exact same width, translateX(-50%) always
    // lands perfectly on the next copy with no jump or blank gap.
    const copiesNeeded = Math.max(1, Math.ceil(8 / items.length));
    const baseSet = Array.from({ length: copiesNeeded }).flatMap(() => items);
    return [...baseSet, ...baseSet];
  }, [data]);

  if (!data?.length) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        py: 0.5,
        maskImage: 'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%)'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: 'max-content',
          animation: `${scroll} 32s linear infinite`,
          '&:hover': { animationPlayState: 'paused' }
        }}
      >
        {loopData.map((item, index) => (
          <TestimonialCard key={index} item={item} />
        ))}
      </Box>
    </Box>
  );
}

TestimonialCarousel.propTypes = {
  data: PropTypes.array.isRequired
};