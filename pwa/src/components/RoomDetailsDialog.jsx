import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Stack,
    Divider,
    IconButton
} from '@mui/material';
import {
    Close as CloseIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import PropertyMap from './PropertyMap';

const RoomDetailsDialog = ({ open, onClose, room }) => {
    if (!room) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {room.title}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Images */}
                    {room.images && room.images.length > 0 && (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: 2
                            }}
                        >
                            {room.images.map((img, idx) => (
                                <Box
                                    key={idx}
                                    component="img"
                                    src={img}
                                    alt={`Room ${idx + 1}`}
                                    sx={{
                                        width: '100%',
                                        height: 200,
                                        objectFit: 'cover',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'grey.200'
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Price and Type */}
                    <Box>
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 900, mb: 1 }}>
                            ₹{room.price?.toLocaleString()}/month
                        </Typography>
                        <Chip label={room.type} color="primary" variant="outlined" />
                        {room.furnished && (
                            <Chip label="Furnished" color="success" variant="outlined" sx={{ ml: 1 }} />
                        )}
                        {room.gender_preference && room.gender_preference !== 'any' && (
                            <Chip
                                label={`${room.gender_preference.charAt(0).toUpperCase() + room.gender_preference.slice(1)} Only`}
                                variant="outlined"
                                sx={{ ml: 1 }}
                            />
                        )}
                    </Box>

                    <Divider />

                    {/* Description */}
                    {room.description && (
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                Description
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {room.description}
                            </Typography>
                        </Box>
                    )}

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                Amenities
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {room.amenities.map((amenity, idx) => (
                                    <Chip key={idx} label={amenity} size="small" />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    <Divider />

                    {/* Location */}
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <LocationIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Location
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {room.location}
                        </Typography>
                        <PropertyMap location={room.location} height="300px" />
                    </Box>

                    <Divider />

                    {/* Contact Information */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Contact Information
                        </Typography>
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PersonIcon color="action" />
                                <Typography variant="body2">
                                    <strong>Landlord:</strong> {room.landlord_name || 'N/A'}
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PhoneIcon color="action" />
                                <Typography variant="body2">
                                    <strong>Phone:</strong> {room.contact_number || 'N/A'}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
                <Button
                    variant="contained"
                    href={`tel:${room.contact_number}`}
                    disabled={!room.contact_number}
                >
                    Call Now
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoomDetailsDialog;
