import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Stack,
  Chip,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import {
  Home as HomeIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  Wifi as WifiIcon,
  LocalParking as ParkingIcon,
  FitnessCenter as GymIcon,
  Restaurant as MealsIcon,
  AcUnit as AcIcon,
  Security as SecurityIcon,
  LocalLaundryService as LaundryIcon,
  Power as PowerIcon
} from '@mui/icons-material';

const SwipeInterface = ({ rooms, onLike, onDislike, onOpenDetails, onRefresh }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const currentRoom = rooms[currentIndex];

  const handleAction = async (type) => {
    if (!currentRoom || swiping) return;

    try {
      setSwiping(true);
      setSwipeDirection(type);

      // Handle callbacks
      if (type === 'like' && onLike) {
        await onLike(currentRoom, false, currentRoom.recommendationScore || 75);
      } else if (type === 'dislike' && onDislike) {
        await onDislike(currentRoom);
      }

      // Small delay for animation
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);

        // If we're running low on rooms, trigger refresh
        if (currentIndex >= rooms.length - 3 && onRefresh) {
          onRefresh();
        }
      }, 300);
    } catch (error) {
      console.error('Error recording swipe:', error);
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    } finally {
      setTimeout(() => setSwiping(false), 300);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleAction('dislike'),
    onSwipedRight: () => handleAction('like'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 50
  });

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <WifiIcon sx={{ fontSize: 14 }} />;
    if (amenityLower.includes('parking')) return <ParkingIcon sx={{ fontSize: 14 }} />;
    if (amenityLower.includes('gym')) return <GymIcon sx={{ fontSize: 14 }} />;
    if (amenityLower.includes('meal')) return <MealsIcon sx={{ fontSize: 14 }} />;
    if (amenityLower.includes('ac')) return <AcIcon sx={{ fontSize: 14 }} />;
    if (amenityLower.includes('security')) return <SecurityIcon sx={{ fontSize: 14 }} />;
    if (amenityLower.includes('laundry')) return <LaundryIcon sx={{ fontSize: 14 }} />;
    if (amenityLower.includes('power')) return <PowerIcon sx={{ fontSize: 14 }} />;
    return null;
  };

  if (!currentRoom || currentIndex >= rooms.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 500,
          textAlign: 'center',
          p: 4,
          bgcolor: 'white',
          borderRadius: 4,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          mx: 'auto',
          maxWidth: 420
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}
        >
          <HomeIcon sx={{ fontSize: 40, color: '#6366f1' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
          All Caught Up!
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, maxWidth: 300 }}>
          You've seen all available rooms. Check back later for new listings.
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => setCurrentIndex(0)}
          sx={{
            bgcolor: '#6366f1',
            color: 'white',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
            '&:hover': {
              bgcolor: '#4f46e5',
              boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
            }
          }}
        >
          Refresh Feed
        </Button>
      </Box>
    );
  }

  const imageUrl = currentRoom.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070';
  const matchScore = currentRoom.recommendationScore || 75;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 420,
        mx: 'auto'
      }}
    >
      {/* Card Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          mb: 3
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoom.room_id || currentRoom.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: swipeDirection === 'like' ? 10 : swipeDirection === 'dislike' ? -10 : 0
            }}
            exit={{
              x: swipeDirection === 'like' ? 300 : swipeDirection === 'dislike' ? -300 : 0,
              opacity: 0,
              rotate: swipeDirection === 'like' ? 15 : swipeDirection === 'dislike' ? -15 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: '100%' }}
          >
            <Card
              {...handlers}
              sx={{
                width: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                cursor: 'grab',
                userSelect: 'none',
                '&:active': {
                  cursor: 'grabbing'
                }
              }}
            >
              {/* Image Section */}
              <Box
                sx={{
                  position: 'relative',
                  height: 400,
                  width: '100%',
                  bgcolor: '#f3f4f6',
                  overflow: 'hidden'
                }}
              >
                <Box
                  component="img"
                  src={imageUrl}
                  alt={currentRoom.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Gradient Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)'
                  }}
                />

                {/* Match Score Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backdropFilter: 'blur(12px)',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    px: 2,
                    py: 1,
                    borderRadius: 3,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#10b981',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    {matchScore}% Match
                  </Typography>
                </Box>

                {/* Info Button */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails && onOpenDetails(currentRoom);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    color: '#6366f1',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      bgcolor: 'white',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s'
                  }}
                  size="small"
                >
                  <InfoIcon fontSize="small" />
                </IconButton>

                {/* Price Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    color: 'white'
                  }}
                >
                  <Stack direction="row" alignItems="baseline" spacing={0.5}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        lineHeight: 1,
                        color: '#fff',
                        textShadow: '0px 2px 10px rgba(49, 47, 129, 0.4), 0px 1.5px 14px rgba(0,0,0,0.25)'
                      }}
                    >
                      ₹{currentRoom.price?.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1,
                        color: '#fff',
                        textShadow: '0px 2px 10px rgba(49, 47, 129, 0.4), 0px 1.5px 14px rgba(0,0,0,0.25)',
                        opacity: 0.9
                      }}
                    >
                      /month
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              {/* Content Section */}
              <CardContent sx={{ p: 3, bgcolor: 'white' }}>
                {/* Title and Type */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#111827',
                        mb: 0.5
                      }}
                    >
                      {currentRoom.title || currentRoom.type}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <LocationIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6b7280',
                          fontWeight: 500
                        }}
                      >
                        {currentRoom.location || 'Location not specified'}
                      </Typography>
                    </Stack>
                  </Box>
                  <Chip
                    label={currentRoom.type}
                    size="small"
                    sx={{
                      bgcolor: '#ede9fe',
                      color: '#6366f1',
                      fontWeight: 600,
                      fontSize: '11px',
                      height: 24
                    }}
                  />
                </Stack>

                {/* Description */}
                {currentRoom.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      mb: 2,
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {currentRoom.description}
                  </Typography>
                )}

                {/* Amenities */}
                {currentRoom.amenities && currentRoom.amenities.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#9ca3af',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '10px',
                        mb: 1,
                        display: 'block'
                      }}
                    >
                      Amenities
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {currentRoom.amenities.slice(0, 6).map((amenity, index) => (
                        <Chip
                          key={index}
                          icon={getAmenityIcon(amenity)}
                          label={amenity}
                          size="small"
                          sx={{
                            bgcolor: '#f9fafb',
                            color: '#374151',
                            fontWeight: 500,
                            fontSize: '11px',
                            height: 28,
                            border: '1px solid #e5e7eb',
                            '& .MuiChip-icon': {
                              color: '#6366f1'
                            }
                          }}
                        />
                      ))}
                      {currentRoom.amenities.length > 6 && (
                        <Chip
                          label={`+${currentRoom.amenities.length - 6} more`}
                          size="small"
                          sx={{
                            bgcolor: '#6366f1',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '11px',
                            height: 28
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Additional Info */}
                <Stack direction="row" spacing={2} sx={{ mt: 2, pt: 2, borderTop: '1px solid #f3f4f6' }}>
                  {currentRoom.furnished !== undefined && (
                    <Chip
                      label={currentRoom.furnished ? 'Furnished' : 'Unfurnished'}
                      size="small"
                      sx={{
                        bgcolor: currentRoom.furnished ? '#d1fae5' : '#fee2e2',
                        color: currentRoom.furnished ? '#065f46' : '#991b1b',
                        fontWeight: 600,
                        fontSize: '11px',
                        height: 24
                      }}
                    />
                  )}
                  {currentRoom.gender_preference && currentRoom.gender_preference !== 'any' && (
                    <Chip
                      label={`${currentRoom.gender_preference.charAt(0).toUpperCase() + currentRoom.gender_preference.slice(1)} Only`}
                      size="small"
                      sx={{
                        bgcolor: '#fef3c7',
                        color: '#92400e',
                        fontWeight: 600,
                        fontSize: '11px',
                        height: 24
                      }}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Swipe Indicators */}
        {swipeDirection && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: swipeDirection === 'like' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
              }}
            >
              {swipeDirection === 'like' ? (
                <FavoriteIcon sx={{ fontSize: 60, color: 'white' }} />
              ) : (
                <CloseIcon sx={{ fontSize: 60, color: 'white' }} />
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Control Buttons */}
      <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
        <Button
          onClick={() => handleAction('dislike')}
          disabled={swiping}
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'white',
            border: '2px solid #fee2e2',
            color: '#ef4444',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minWidth: 64,
            '&:hover': {
              bgcolor: '#fef2f2',
              transform: 'scale(1.05)',
              boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            },
            '&:disabled': {
              opacity: 0.5
            },
            transition: 'all 0.2s'
          }}
        >
          {swiping && swipeDirection === 'dislike' ? (
            <CircularProgress size={28} sx={{ color: '#ef4444' }} />
          ) : (
            <CloseIcon sx={{ fontSize: 32 }} />
          )}
        </Button>

        <Button
          onClick={() => handleAction('like')}
          disabled={swiping}
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: '#6366f1',
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
            minWidth: 80,
            '&:hover': {
              bgcolor: '#4f46e5',
              transform: 'scale(1.05)',
              boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.5)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            },
            '&:disabled': {
              opacity: 0.5
            },
            transition: 'all 0.2s'
          }}
        >
          {swiping && swipeDirection === 'like' ? (
            <CircularProgress size={36} sx={{ color: 'white' }} />
          ) : (
            <FavoriteIcon sx={{ fontSize: 40 }} />
          )}
        </Button>
      </Stack>

      {/* Swipe Hint */}
      <Typography
        variant="caption"
        sx={{
          mt: 3,
          color: '#9ca3af',
          fontWeight: 500,
          textAlign: 'center'
        }}
      >
        Swipe right to like • Swipe left to pass
      </Typography>
    </Box>
  );
};

export default SwipeInterface;
