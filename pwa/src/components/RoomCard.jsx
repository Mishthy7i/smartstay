import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Bolt as BoltIcon,
  Info as InfoIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const RoomCard = ({ room, onOpenDetails }) => {
  if (!room) return null;

  // Handle both backend and frontend data structures
  const imageUrl = room.images?.[0] || room.img || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070';
  const matchScore = room.matchScore || 75;
  const price = room.price || 0;
  const title = room.title || room.type || 'Room';
  const distance = room.distance || 'N/A';
  const amenities = room.amenities || [];
  const roomType = room.type || 'Room';

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: 6,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.3s ease'
        }
      }}
      onClick={onOpenDetails}
    >
      {/* Image Section */}
      <Box
        sx={{
          position: 'relative',
          height: '65%',
          width: '100%',
          bgcolor: 'grey.200',
          overflow: 'hidden'
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.7s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        />

        {/* Match Score Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            backdropFilter: 'blur(8px)',
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            px: 1.5,
            py: 0.75,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <BoltIcon sx={{ fontSize: 14, color: 'warning.main' }} />
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontSize: '10px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 2
            }}
          >
            {matchScore}% Match
          </Typography>
        </Box>

        {/* Info Icon */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)'
            }
          }}
          size="small"
        >
          <InfoIcon fontSize="small" />
        </IconButton>

        {/* Price Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontStyle: 'italic',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            ₹{price.toLocaleString()}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 2,
              opacity: 0.9,
              mt: 0.5,
              pl: 0.5
            }}
          >
            Per Month
          </Typography>
        </Box>

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
            pointerEvents: 'none'
          }}
        />
      </Box>

      {/* Content Section */}
      <CardContent
        sx={{
          flex: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: 'white'
        }}
      >
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: 'text.primary',
                lineHeight: 1.2
              }}
            >
              {title}
            </Typography>
            <Chip
              icon={<PeopleIcon sx={{ fontSize: 12 }} />}
              label={roomType}
              size="small"
              sx={{
                bgcolor: 'primary.50',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '10px',
                textTransform: 'uppercase',
                height: 24
              }}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
            <LocationIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                fontStyle: 'italic'
              }}
            >
              {distance} {distance !== 'N/A' ? 'from campus' : ''}
            </Typography>
          </Stack>
        </Box>

        {/* Amenities */}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {amenities?.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              sx={{
                fontSize: '9px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: 1,
                px: 1,
                py: 0.5,
                bgcolor: 'grey.50',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'grey.100',
                borderRadius: 2,
                height: 20
              }}
            />
          ))}
          {amenities?.length > 3 && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '9px',
                fontWeight: 900,
                color: 'primary.main',
                py: 0.5,
                alignSelf: 'center'
              }}
            >
              + {amenities.length - 3} more
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RoomCard;

