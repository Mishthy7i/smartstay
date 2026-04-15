import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  IconButton
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PropertyList = ({ rooms, onDelete, onViewDetails, showDelete = true, showEdit = true }) => {
  const navigate = useNavigate();

  if (!rooms || rooms.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          textAlign: 'center',
          p: 4
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          No Properties Listed
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add your first property to get started
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/onboarding/landlord')}
          sx={{ borderRadius: 3 }}
        >
          Add Property
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          My Properties
        </Typography>
        <Chip
          label={`${rooms.length} ${rooms.length === 1 ? 'Property' : 'Properties'}`}
          color="primary"
          sx={{ fontWeight: 700 }}
        />
      </Stack>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid size={{ xs: 12, sm: 6 }} key={room.id || room.room_id}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 2,
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              {/* Fixed aspect ratio image container */}
              <Box 
                sx={{ 
                  position: 'relative', 
                  width: '100%',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <CardMedia
                  component="img"
                  image={room.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070'}
                  alt={room.title}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1
                  }}
                >
                  {showEdit && (
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': { bgcolor: 'white' }
                      }}
                      onClick={() => {
                        // Edit functionality - can be implemented later
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {showDelete && (
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        color: 'error.main',
                        '&:hover': { bgcolor: 'white' }
                      }}
                      onClick={() => onDelete && onDelete(room.id || room.room_id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '1rem'
                  }}
                >
                  {room.title || 'Untitled Property'}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {room.location || 'Location not specified'}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.1rem' }}>
                    {room.price ? `₹${room.price.toLocaleString()}/mo` : '₹--/mo'}
                  </Typography>
                  <Chip
                    label={room.type || 'N/A'}
                    size="small"
                    sx={{ fontWeight: 600, flexShrink: 0 }}
                  />
                </Stack>

                {onViewDetails && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => onViewDetails(room)}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700
                    }}
                  >
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PropertyList;

