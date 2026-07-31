// import PropTypes from 'prop-types';
// import Image from 'next/image';
// // mui
// import { Box } from '@mui/material';

// export default function BlurImageAvatar({ sx, layout, objectFit, style, ...props }) {
//   return (
//     <Box
//       sx={{
//         position: 'relative',
//         height: 40,
//         width: 40,
//         borderRadius: '50%',
//         overflow: 'hidden',
//         ...sx
//       }}
//     >
//       <Image
//         src={props.src || '/images/default-avatar.png'}
//         alt="user avatar"
//         fill
//         style={{ objectFit: 'cover', ...style }}
//         {...props}
//       />
//     </Box>
//   );
// }

// BlurImageAvatar.propTypes = {
//   src: PropTypes.string,
//   sx: PropTypes.object
// };


import PropTypes from 'prop-types';
import Image from 'next/image';
// mui
import { Box } from '@mui/material';

export default function BlurImageAvatar({ sx, layout, objectFit, style, src, ...props }) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: 40,
        width: 40,
        borderRadius: '50%',
        overflow: 'hidden',
        ...sx
      }}
    >
      <Image
        alt="user avatar"
        fill
        {...props}
        src={src || '/images/default-avatar.png'}
        style={{ objectFit: 'cover', ...style }}
      />
    </Box>
  );
}

BlurImageAvatar.propTypes = {
  src: PropTypes.string,
  sx: PropTypes.object
};