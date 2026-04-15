import React from 'react';
import { Box } from '@mui/material';

const PropertyMap = ({ location, height = '400px' }) => {
    // Encode location for URL
    const encodedLocation = encodeURIComponent(location || 'MITS Gwalior, Madhya Pradesh, India');

    // Google Maps Embed API (no key required for basic search)
    const mapSrc = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <Box
            sx={{
                width: '100%',
                height: height,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: 2
            }}
        >
            <iframe
                title="Property Location"
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </Box>
    );
};

export default PropertyMap;
