import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Card,
  CardActionArea,
  Grid,
  CircularProgress,
  Slider,
  Grow,
  Fade,
  Chip,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  CurrencyRupee as RupeeIcon,
  Home as HomeIcon,
  Sort as SortIcon,
  DragIndicator as DragIndicatorIcon,
  MyLocation as GpsIcon,
  Mic as MicIcon,
  Person as PersonIcon,
  Hotel as BedIcon,
  Security as SecurityIcon,
  Wifi as WifiIcon
} from '@mui/icons-material';
import { Reorder, useDragControls } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import VoiceTextField from '../components/VoiceTextField';

// Draggable priority item component
const PriorityItem = ({ item, index }) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item 
      value={item} 
      dragListener={false}
      dragControls={dragControls}
      style={{ 
        listStyle: 'none',
        cursor: 'grab'
      }}
      whileDrag={{ 
        scale: 1.03, 
        boxShadow: '0 10px 30px rgba(79, 70, 229, 0.2)',
        cursor: 'grabbing'
      }}
    >
      <Card
        variant="outlined"
        sx={{
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderRadius: '16px', 
          border: '1px solid #E2E8F0',
          bgcolor: 'white',
          transition: 'border-color 0.2s ease',
          '&:hover': { borderColor: '#4F46E5' }
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
          <Box 
            onPointerDown={(e) => dragControls.start(e)}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'grab',
              color: '#94A3B8',
              touchAction: 'none',
              '&:hover': { color: '#4F46E5' },
              '&:active': { cursor: 'grabbing' }
            }}
          >
            <DragIndicatorIcon />
          </Box>
          <Box sx={{ fontSize: '1.2rem', bgcolor: '#F1F5F9', p: 1, borderRadius: '12px', display: 'flex' }}>
            {item.icon === '📍' ? <GpsIcon fontSize="small" /> : 
             item.icon === '💰' ? <RupeeIcon fontSize="small" /> :
             item.icon === '🛡️' ? <SecurityIcon fontSize="small" /> :
             <WifiIcon fontSize="small" />}
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E293B' }}>
            {item.label}
          </Typography>
        </Stack>
        <Chip 
          label={`#${index + 1}`} 
          size="small" 
          sx={{ 
            fontWeight: 700, 
            bgcolor: index === 0 ? '#4F46E5' : '#F1F5F9',
            color: index === 0 ? 'white' : '#64748B'
          }} 
        />
      </Card>
    </Reorder.Item>
  );
};

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [nearbyColleges, setNearbyColleges] = useState([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: '',
    gender: 'female',
    college: '',
    budget: [4000, 10000],
    preferred_room_types: ['Single Room'],
    looking_for_gender: 'female', // female only properties or any
    priorities: [
      { id: 'budget', label: 'Budget/Price', icon: '💰' },
      { id: 'gender', label: 'Gender Compatibility', icon: '🛡️' },
      { id: 'distance', label: 'Distance to College', icon: '📍' },
      { id: 'amenities', label: 'Facilities/Amenities', icon: '📶' }
    ]
  });

  const nextStep = () => {
    // Validation for step 1
    if (step === 1) {
      if (!formData.name || !formData.age || !formData.gender) {
        showToast('Please fill all basic details', 'warning');
        return;
      }
      if (parseInt(formData.age) > 100) {
        showToast('Age must be 100 or less', 'error');
        return;
      }
    }
    // Validation for step 2
    if (step === 2 && !formData.college) {
      showToast('Please select or enter your college', 'warning');
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleDetectCollege = () => {
    setDetectingLocation(true);
    setNearbyColleges([]);
    
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const query = `[out:json];node["amenity"~"college|university"](around:10000,${latitude},${longitude});out;`;
        
        // Multiple mirrors for reliability and CORS compatibility
        const endpoints = [
          'https://overpass-api.de/api/interpreter',
          'https://lz4.overpass-api.de/api/interpreter',
          'https://overpass.kumi.systems/api/interpreter'
        ];

        let success = false;
        for (const endpoint of endpoints) {
          try {
            console.log(`Attempting to detect colleges via ${endpoint}...`);
            const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
              method: 'GET',
              mode: 'cors'
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (data.elements && data.elements.length > 0) {
              const colleges = data.elements.map(el => el.tags.name).filter(name => !!name);
              setNearbyColleges([...new Set(colleges)].slice(0, 5));
              showToast("Nearby colleges detected!", "success");
              success = true;
              break; // Stop once we have data
            }
          } catch (error) {
            console.warn(`Mirror ${endpoint} failed:`, error.message);
            // Continue to next mirror
          }
        }

        if (!success) {
          if (nearbyColleges.length === 0) {
            showToast("No colleges found nearby. Try manual entry.", "info");
          } else {
            showToast("Failed to reach detection servers", "error");
          }
        }
        
        setDetectingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        showToast("Location access denied or unavailable", "error");
        setDetectingLocation(false);
      }
    );
  };

  const submitOnboarding = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const onboardingData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        college: formData.college,
        min_budget: formData.budget[0],
        max_budget: formData.budget[1],
        preferred_room_types: formData.preferred_room_types,
        looking_for_gender: formData.looking_for_gender,
        priorities: formData.priorities.map(p => p.id),
      };
      await completeOnboarding(onboardingData);
      showToast('Profile setup complete!', 'success');
      setTimeout(() => navigate('/home'), 500);
    } catch (error) {
      console.error('Onboarding error:', error);
      showToast(error.message || 'Failed to complete onboarding', 'error');
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (step === 5) {
      const interval = setInterval(() => {
        setMatchingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            submitOnboarding();
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case 1: // Basic Details
        return (
          <Fade in={true}>
            <Box>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box sx={{
                  width: 60, height: 60, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2, bgcolor: '#EEF2FF', color: '#4F46E5'
                }}>
                  <PersonIcon fontSize="large" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
                  Basic Details
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B' }}>
                  Let's start with who you are.
                </Typography>
              </Box>

              <Stack spacing={3}>
                <VoiceTextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                />
                
                <TextField
                  label="Age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  inputProps={{ max: 100, min: 16 }}
                  fullWidth
                  required
                  error={formData.age !== '' && (parseInt(formData.age) > 100 || parseInt(formData.age) < 16)}
                  helperText={formData.age !== '' && (parseInt(formData.age) > 100 ? "Age must be 100 or less" : parseInt(formData.age) < 16 ? "Must be 16+" : "")}
                />

                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>Gender</FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <FormControlLabel value="male" control={<Radio color="primary" />} label="Male" />
                    <FormControlLabel value="female" control={<Radio color="primary" />} label="Female" />
                    <FormControlLabel value="other" control={<Radio color="primary" />} label="Other" />
                  </RadioGroup>
                </FormControl>
              </Stack>
            </Box>
          </Fade>
        );

      case 2: // College Selection
        return (
          <Fade in={true}>
            <Box>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box sx={{
                  width: 60, height: 60, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2, bgcolor: '#EEF2FF', color: '#4F46E5'
                }}>
                  <SchoolIcon fontSize="large" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
                  Select Your College
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B' }}>
                  We'll find rooms nearby for you.
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={detectingLocation ? <CircularProgress size={20} /> : <GpsIcon />}
                  onClick={handleDetectCollege}
                  disabled={detectingLocation}
                  sx={{ py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                >
                  {detectingLocation ? "Detecting..." : "Detect my college"}
                </Button>

                {nearbyColleges.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', mb: 1, display: 'block' }}>
                      COLLEGES FOUND NEARBY
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {nearbyColleges.map((college) => (
                        <Chip
                          key={college}
                          label={college}
                          onClick={() => setFormData({ ...formData, college })}
                          color={formData.college === college ? "primary" : "default"}
                          variant={formData.college === college ? "filled" : "outlined"}
                          sx={{ fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ bgcolor: '#F8FAFC', px: 2, position: 'relative', zIndex: 1, fontWeight: 700, color: '#94A3B8' }}>
                    OR ADD MANUALLY
                  </Typography>
                  <Box sx={{ borderBottom: '1px solid #E2E8F0', position: 'absolute', top: '50%', width: '100%', zIndex: 0 }} />
                </Box>

                <VoiceTextField
                  label="College Name"
                  placeholder="Type or speak college name"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  fullWidth
                />
              </Stack>
            </Box>
          </Fade>
        );

      case 3: // Preferences
        return (
          <Fade in={true}>
            <Box>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box sx={{
                  width: 60, height: 60, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2, bgcolor: '#ECFDF5', color: '#10B981'
                }}>
                  <RupeeIcon fontSize="large" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
                  Budget & Preferences
                </Typography>
              </Box>

              <Stack spacing={4}>
                <Box sx={{ px: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Monthly Budget: ₹{formData.budget[0]} - ₹{formData.budget[1]}</Typography>
                  <Slider
                    value={formData.budget}
                    onChange={(e, val) => setFormData({ ...formData, budget: val })}
                    min={2000}
                    max={25000}
                    step={500}
                    disableSwap
                    sx={{ color: '#4F46E5' }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Looking for</Typography>
                  <Stack direction="row" spacing={1}>
                    {[
                      { id: 'female', label: 'Girls PG' },
                      { id: 'male', label: 'Boys PG' },
                      { id: 'any', label: 'Co-ed/Any' }
                    ].map(opt => (
                      <Button
                        key={opt.id}
                        variant={formData.looking_for_gender === opt.id ? 'contained' : 'outlined'}
                        onClick={() => setFormData({ ...formData, looking_for_gender: opt.id })}
                        fullWidth
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Accommodation Type</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {['Single Room', 'Shared PG', 'Private Flat', '2 BHK'].map(type => {
                      const sel = formData.preferred_room_types.includes(type);
                      return (
                        <Chip
                          key={type}
                          label={type}
                          onClick={() => {
                            const types = sel ? formData.preferred_room_types.filter(t => t !== type) : [...formData.preferred_room_types, type];
                            setFormData({ ...formData, preferred_room_types: types });
                          }}
                          color={sel ? "primary" : "default"}
                          sx={{ fontWeight: 600 }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Fade>
        );

      case 4: // Priorities
        return (
          <Fade in={true}>
            <Box>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box sx={{
                  width: 60, height: 60, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2, bgcolor: '#FFF7ED', color: '#F97316'
                }}>
                  <SortIcon fontSize="large" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
                  Set Priorities
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Drag to reorder. Top item is most important.
                </Typography>
              </Box>

              <Reorder.Group 
                axis="y" 
                values={formData.priorities} 
                onReorder={(newOrder) => setFormData({ ...formData, priorities: newOrder })}
                style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                {formData.priorities.map((item, index) => (
                  <PriorityItem key={item.id} item={item} index={index} />
                ))}
              </Reorder.Group>
            </Box>
          </Fade>
        );

      case 5: // Processing
        return (
          <Fade in={true}>
            <Box sx={{ textAlign: 'center', pt: 8 }}>
              <Box sx={{ position: 'relative', width: 140, height: 140, mx: 'auto', mb: 6 }}>
                <CircularProgress
                  variant="determinate"
                  value={matchingProgress}
                  size={140} thickness={4}
                  sx={{ color: '#4F46E5' }}
                />
                <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{Math.round(matchingProgress)}%</Typography>
                </Box>
              </Box>
              <Typography variant="h5" sx={{ color: '#1E293B', fontWeight: 800, mb: 1 }}>
                Finding Dream Homes...
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748B' }}>
                Personalizing your recommendation feed.
              </Typography>
            </Box>
          </Fade>
        );

      default: return null;
    }
  };

  if (authLoading || !user) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', pb: 12 }}>
      {/* Header */}
      <Box sx={{ py: 2, borderBottom: '1px solid #E2E8F0', bgcolor: 'white' }}>
        <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#4F46E5', letterSpacing: -1 }}>SmartStay</Typography>
        </Container>
      </Box>

      <Container maxWidth="xs" sx={{ pt: 4 }}>
        {step < 5 && (
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>
                STAGE {step} OF 4
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#4F46E5' }}>
                {step === 1 ? 'BIO' : step === 2 ? 'CAMPUS' : step === 3 ? 'WANTS' : 'PRIORITY'}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(step / 4) * 100}
              sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#4F46E5' } }}
            />
          </Box>
        )}

        {renderStep()}

        {step < 5 && (
          <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 3, bgcolor: 'white', borderTop: '1px solid #E2E8F0', zIndex: 100 }}>
            <Container maxWidth="xs" sx={{ p: 0 }}>
              <Stack direction="row" spacing={2}>
                {step > 1 && (
                  <Button
                    onClick={prevStep}
                    variant="outlined"
                    sx={{ py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 4 }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={nextStep}
                  sx={{ py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 700, bgcolor: '#4F46E5' }}
                >
                  {step === 4 ? 'Launch Feed' : 'Next Step'}
                </Button>
              </Stack>
            </Container>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default StudentOnboarding;
