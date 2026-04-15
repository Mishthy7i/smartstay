import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Divider,
  CircularProgress,
  Stack,
  Card,
  CardActionArea,
  InputAdornment,
  Fade,
  Grow
} from '@mui/material';
import {
  Google as GoogleIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, signInWithEmail, signUpWithEmail, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState('role'); // 'role' or 'auth'
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated and onboarded
  useEffect(() => {
    if (!authLoading && user) {
      if (user.is_onboarded) {
        navigate('/home');
      } else {
        const onboardingPath = user.role === 'landlord' ? '/onboarding/landlord' : '/onboarding/student';
        navigate(onboardingPath);
      }
    }
  }, [user, authLoading, navigate]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp && !selectedRole) {
        showToast('Please select a role first', 'warning');
        setLoading(false);
        return;
      }
      const role = isSignUp ? selectedRole : null;
      await loginWithGoogle(role, isSignUp);
    } catch (error) {
      showToast(error.message || 'Failed to sign in with Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!email || !password) {
      showToast('Please fill in all required fields', 'warning');
      setLoading(false);
      return;
    }
    if (isSignUp && !displayName) {
      showToast('Please enter your name', 'warning');
      setLoading(false);
      return;
    }
    try {
      if (isSignUp) {
        if (!selectedRole) {
          showToast('Please select a role first', 'warning');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName, selectedRole);
        showToast('Account created successfully!', 'success');
      } else {
        await signInWithEmail(email, password);
        showToast('Signed in successfully!', 'success');
      }
    } catch (error) {
      // Error handling logic (same as before)
      let errorMessage = error.message || 'Authentication failed';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'This email is already registered. Please sign in instead.';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      else if (error.code === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters';
      else if (error.code === 'auth/user-not-found') errorMessage = 'No account found with this email';
      else if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#F8FAFC' }}>
        <CircularProgress sx={{ color: '#4F46E5' }} />
      </Box>
    );
  }

  // --- ROLE SELECTION STEP ---
  if (step === 'role') {
    return (
      <Fade in={true} timeout={500}>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: 4, fontFamily: 'Inter' }}>
          <Container maxWidth="sm">
            <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

              {/* Brand Header */}
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Box sx={{
                  width: 64, height: 64, borderRadius: '16px',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 3,
                  boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)'
                }}>
                  <HomeIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, letterSpacing: '-0.5px' }}>
                  Welcome to SmartStay
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B' }}>
                  The smartest way to find student accommodation.
                </Typography>
              </Box>

              <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 3, textAlign: 'center' }}>
                  I am a...
                </Typography>

                <Stack spacing={2.5}>
                  <Grow in={true} timeout={600}>
                    <Card
                      variant="outlined"
                      onClick={() => setSelectedRole('student')}
                      sx={{
                        border: '2px solid',
                        borderColor: selectedRole === 'student' ? '#4F46E5' : 'transparent',
                        bgcolor: selectedRole === 'student' ? '#EEF2FF' : '#F8FAFC',
                        borderRadius: '16px',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#4F46E5', transform: 'translateY(-2px)' }
                      }}
                    >
                      <CardActionArea sx={{ p: 2.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{
                            width: 56, height: 56, borderRadius: '12px',
                            bgcolor: selectedRole === 'student' ? '#4F46E5' : 'white',
                            color: selectedRole === 'student' ? 'white' : '#4F46E5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}>
                            <SchoolIcon sx={{ fontSize: 28 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>Student</Typography>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>Looking for a room near college</Typography>
                          </Box>
                        </Stack>
                      </CardActionArea>
                    </Card>
                  </Grow>

                  <Grow in={true} timeout={800}>
                    <Card
                      variant="outlined"
                      onClick={() => setSelectedRole('landlord')}
                      sx={{
                        border: '2px solid',
                        borderColor: selectedRole === 'landlord' ? '#4F46E5' : 'transparent',
                        bgcolor: selectedRole === 'landlord' ? '#EEF2FF' : '#F8FAFC',
                        borderRadius: '16px',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#4F46E5', transform: 'translateY(-2px)' }
                      }}
                    >
                      <CardActionArea sx={{ p: 2.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{
                            width: 56, height: 56, borderRadius: '12px',
                            bgcolor: selectedRole === 'landlord' ? '#4F46E5' : 'white',
                            color: selectedRole === 'landlord' ? 'white' : '#4F46E5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}>
                            <BusinessIcon sx={{ fontSize: 28 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>Landlord</Typography>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>Listing properties for students</Typography>
                          </Box>
                        </Stack>
                      </CardActionArea>
                    </Card>
                  </Grow>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={!selectedRole}
                  onClick={() => {
                    setIsSignUp(true);
                    setStep('auth');
                  }}
                  sx={{
                    mt: 4, py: 1.5, borderRadius: '12px',
                    fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                    bgcolor: '#4F46E5',
                    '&:hover': { bgcolor: '#4338CA' },
                    '&:disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' }
                  }}
                >
                  Continue as {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : ''}
                </Button>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Already have an account?{' '}
                    <Typography component="span" variant="body2"
                      sx={{ color: '#4F46E5', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => {
                        setSelectedRole(null);
                        setIsSignUp(false);
                        setStep('auth');
                      }}
                    >
                      Log in
                    </Typography>
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Container>
        </Box>
      </Fade>
    );
  }

  // --- AUTH STEP (Log In / Sign Up) ---
  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: 4, fontFamily: 'Inter' }}>
        <Container maxWidth="sm">
          <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', bgcolor: 'white', border: '1px solid #E2E8F0' }}>
              <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => {
                    setStep('role');
                    setIsSignUp(false);
                    setSelectedRole(null);
                  }}
                  sx={{ minWidth: 0, p: 1, mr: 1, color: '#64748B', borderRadius: '12px' }}
                />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </Typography>
              </Stack>

              <form onSubmit={handleEmailAuth}>
                <Stack spacing={3}>
                  {isSignUp && (
                    <TextField
                      fullWidth label="Full Name" placeholder="e.g. John Doe"
                      value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      InputProps={{
                        startAdornment: (<InputAdornment position="start"><PersonIcon sx={{ color: '#94A3B8' }} /></InputAdornment>),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  )}

                  <TextField
                    fullWidth label="Email Address" placeholder="name@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start"><EmailIcon sx={{ color: '#94A3B8' }} /></InputAdornment>),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />

                  <TextField
                    fullWidth label="Password" type="password" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start"><LockIcon sx={{ color: '#94A3B8' }} /></InputAdornment>),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />

                  <Button
                    fullWidth type="submit" variant="contained" size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
                      bgcolor: '#4F46E5', textTransform: 'none',
                      '&:hover': { bgcolor: '#4338CA' }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : (isSignUp ? 'Sign Up' : 'Log In')}
                  </Button>
                </Stack>
              </form>

              <Box sx={{ my: 4, display: 'flex', alignItems: 'center' }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="caption" sx={{ px: 2, color: '#94A3B8', fontWeight: 600 }}>OR</Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              <Button
                fullWidth variant="outlined" size="large"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleAuth}
                disabled={loading}
                sx={{
                  py: 1.5, borderRadius: '12px', fontWeight: 600,
                  color: '#1E293B', borderColor: '#E2E8F0', textTransform: 'none',
                  '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                }}
              >
                Continue with Google
              </Button>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Button
                    onClick={() => setIsSignUp(!isSignUp)}
                    sx={{
                      textTransform: 'none', fontWeight: 700, color: '#4F46E5',
                      p: 0, minWidth: 'auto', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                    }}
                  >
                    {isSignUp ? 'Log In' : 'Sign Up'}
                  </Button>
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </Fade>
  );
};

export default Login;
