import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  CircularProgress,
  Grid,
  Card,
  CardActionArea,
  Chip,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Home as HomeIcon,
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  Apartment as BuildingIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { uploadImages, saveRoomToFirestore } from '../utils/firestore';
import { collection, doc } from 'firebase/firestore';
import { db } from '../firebase';
import PropertyMap from '../components/PropertyMap';
import VoiceTextField from '../components/VoiceTextField';
import { verifyPropertyImage } from '../utils/ai';

const LandlordOnboarding = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [images, setImages] = useState([]);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    type: 'Single Occupancy PG',
    amenities: [],
    contact_number: '',
    description: '',
    furnished: true,
    gender_preference: 'any'
  });
  
  // Generic handleChange logic useful for cleanly passing down to VoiceTextField
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const amenitiesList = [
    'WiFi', 'Meals', 'AC', 'Laundry', 'Parking', 'Security', 'Gym', 'Power Backup'
  ];

  const roomTypes = [
    'Single Occupancy PG',
    'Double Sharing',
    'Triple Sharing',
    'Private Studio',
    'Shared Flat',
    '1 BHK',
    '2 BHK'
  ];

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsVerifying(true);
    let validCount = 0;
    let invalidCount = 0;

    for (const file of files) {
      try {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        // AI Verification
        const isValid = await verifyPropertyImage(base64);

        if (isValid) {
          setImages(prev => [...prev, base64]);
          validCount++;
        } else {
          invalidCount++;
          showToast(`REJECTED: ${file.name} does not look like a property/room photo.`, 'error');
        }
      } catch (error) {
        console.error("AI Error:", error);
        showToast(`Verification error for ${file.name}`, 'warning');
        // On technical error, we might want to allow it or block it. 
        // User said "otherwise it should reject", so we block.
      }
    }

    if (validCount > 0) showToast(`${validCount} photos verified and added.`, 'success');
    setIsVerifying(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      if (!user.is_onboarded) {
        await completeOnboarding({});
      }

      const roomId = doc(collection(db, 'rooms')).id;

      let imageUrls = [];
      if (images.length > 0) {
        showToast('Uploading images to cloud storage...', 'info');
        imageUrls = await uploadImages(images, user.uid, roomId);
        showToast(`${imageUrls.length} images uploaded successfully!`, 'success');
      }

      const roomData = {
        title: formData.title,
        price: parseInt(formData.price),
        type: formData.type,
        location: formData.location,
        contact_number: formData.contact_number,
        description: formData.description,
        amenities: formData.amenities,
        furnished: formData.furnished,
        gender_preference: formData.gender_preference,
        images: imageUrls
      };

      await saveRoomToFirestore(roomData, user.uid, user.name || 'Landlord', roomId);

      showToast('Property listed successfully!', 'success');

      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (error) {
      console.error('Error during landlord onboarding:', error);
      showToast(error.message || 'Failed to complete onboarding. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isSubmitting) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 4,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            boxShadow: 4
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          Welcome Aboard!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your property is now live
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 4, position: 'relative' }}>
          {user?.is_onboarded && (
            <Button
              variant="outlined"
              onClick={() => navigate('/home')}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                textTransform: 'none'
              }}
            >
              ← Back to Home
            </Button>
          )}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'background.paper',
              px: 3,
              py: 1.5,
              borderRadius: 8,
              boxShadow: 2,
              mb: 3
            }}
          >
            <HomeIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              SmartStay Landlord
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
            {user?.is_onboarded ? 'Add New Property' : 'List Your First Property'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Let's get your property in front of thousands of students
          </Typography>
        </Box>

        {/* Progress Steps */}
        <Box display="flex" justifyContent="center" gap={1} sx={{ mb: 4 }}>
          {[1, 2, 3].map((s) => (
            <Box
              key={s}
              sx={{
                height: 4,
                borderRadius: 2,
                transition: 'all 0.3s',
                width: s <= step ? 48 : 32,
                bgcolor: s <= step ? 'primary.main' : 'grey.300'
              }}
            />
          ))}
        </Box>

        {/* Step 1: Images */}
        {step === 1 && (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'primary.50',
                  borderRadius: 2
                }}
              >
                <CameraIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Property Photos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add at least 1 photo
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {images.map((img, index) => (
                <Grid item xs={4} key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: 'grey.100'
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={`Upload ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <Button
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        minWidth: 'auto',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </Button>
                  </Box>
                </Grid>
              ))}
              {images.length < 10 && (
                <Grid item xs={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      aspectRatio: '1',
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: 'grey.300',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                      },
                      cursor: 'pointer'
                    }}
                  >
                    <CardActionArea
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      <UploadIcon color="action" />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Add Photo
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              )}
            </Grid>

            {isVerifying && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  AI is verifying your photos...
                </Typography>
              </Box>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CameraIcon />}
                onClick={() => cameraInputRef.current?.click()}
                sx={{ textTransform: 'none' }}
              >
                Take Photo
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ textTransform: 'none' }}
              >
                From Gallery
              </Button>
            </Stack>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={() => setStep(2)}
              disabled={images.length < 1 || isVerifying}
              sx={{
                mt: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 900
              }}
            >
              Continue
            </Button>
          </Paper>
        )}

        {/* Step 2: Basic Details */}
        {step === 2 && (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'primary.50',
                  borderRadius: 2
                }}
              >
                <BuildingIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Property Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tell us about your property
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={3}>
              <VoiceTextField
                label="Property Title"
                placeholder="Ex: Cozy Studio Near Campus"
                name="title"
                fullWidth
                value={formData.title}
                onChange={handleChange}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Monthly Rent"
                    type="number"
                    name="price"
                    placeholder="8500"
                    fullWidth
                    value={formData.price}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Contact Number"
                    type="tel"
                    name="contact_number"
                    placeholder="9876543210"
                    fullWidth
                    value={formData.contact_number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData(prev => ({ ...prev, contact_number: val }));
                    }}
                    error={formData.contact_number !== '' && formData.contact_number.length !== 10}
                    helperText={formData.contact_number !== '' && formData.contact_number.length !== 10 ? "Must be exactly 10 digits" : ""}
                  />
                </Grid>
              </Grid>

              <VoiceTextField
                label="Location"
                placeholder="North Campus, Delhi"
                name="location"
                fullWidth
                value={formData.location}
                onChange={handleChange}
              />

              <TextField
                select
                label="Property Type"
                name="type"
                fullWidth
                value={formData.type}
                onChange={handleChange}
                SelectProps={{
                  native: true
                }}
              >
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </TextField>

              <VoiceTextField
                label="Description"
                multiline
                rows={3}
                name="description"
                placeholder="Describe your property..."
                fullWidth
                value={formData.description}
                onChange={handleChange}
              />

              {/* Map Preview */}
              {formData.location && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                    Location Preview
                  </Typography>
                  <PropertyMap location={formData.location} height="250px" />
                </Box>
              )}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => setStep(1)}
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setStep(3)}
                disabled={!formData.title || !formData.price || !formData.location || formData.contact_number.length !== 10}
                sx={{
                  textTransform: 'none',
                  fontWeight: 900
                }}
              >
                Continue
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Step 3: Amenities & Preferences */}
        {step === 3 && (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'primary.50',
                  borderRadius: 2
                }}
              >
                <HomeIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Amenities & Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Final touches
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={4}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Amenities
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                  {amenitiesList.map(a => (
                    <Chip
                      key={a}
                      label={a}
                      onClick={() => handleAmenityChange(a)}
                      color={formData.amenities.includes(a) ? 'primary' : 'default'}
                      variant={formData.amenities.includes(a) ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700 }}
                    />
                  ))}
                </Stack>
              </Box>

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.furnished}
                      onChange={(e) => setFormData(prev => ({ ...prev, furnished: e.target.checked }))}
                    />
                  }
                  label="Furnished"
                />

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                    Gender Preference
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {['any', 'male', 'female'].map(gender => (
                      <Button
                        key={gender}
                        variant={formData.gender_preference === gender ? 'contained' : 'outlined'}
                        onClick={() => setFormData(prev => ({ ...prev, gender_preference: gender }))}
                        sx={{
                          flex: 1,
                          textTransform: 'capitalize',
                          fontWeight: 700
                        }}
                      >
                        {gender}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => setStep(2)}
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                sx={{
                  background: 'linear-gradient(45deg, #6366f1 30%, #9333ea 90%)',
                  textTransform: 'none',
                  fontWeight: 900
                }}
              >
                🚀 Launch Property
              </Button>
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default LandlordOnboarding;