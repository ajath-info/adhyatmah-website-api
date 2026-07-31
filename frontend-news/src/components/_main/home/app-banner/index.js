import Image from 'next/image';
import { Box } from '@mui/material';

export default function AppDownloadBanner() {
    return (
        <Box
            sx={{
                width: '100%',
                position: 'relative',
                borderRadius: { xs: 2, md: 3 },
                overflow: 'hidden',
            }}
        >
            <img
                src="/images/final1.png"
                alt="Download the Adhyatmah App - Carry Divinity in Your Pocket"
                style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                }}
            />
        </Box>
    );
}