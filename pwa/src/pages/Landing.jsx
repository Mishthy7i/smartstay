import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Fade,
    Tab,
    Tabs,
    Divider,
    Paper
} from '@mui/material';
import {
    Home as HomeIcon,
    SwipeRight as SwipeIcon,
    VerifiedUser as VerifiedIcon,
    LocationOn as LocationIcon,
    School as SchoolIcon,
    ArrowForward as ArrowForwardIcon,
    CheckCircle as CheckCircleIcon,
    Business as BusinessIcon,
    Chat as ChatIcon,
    Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [visible, setVisible] = useState(false);
    const [usertype, setUsertype] = useState(0); // 0: Student, 1: Landlord

    useEffect(() => {
        setVisible(true);
        if (!loading && user) navigate('/home');

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, [user, loading, navigate]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    if (loading) return null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>

            {/* --- Navbar --- */}
            <Box sx={{
                py: 2, position: 'sticky', top: 0, zIndex: 100,
                bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)',
                borderBottom: '1px solid #E2E8F0'
            }}>
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: '8px',
                                bgcolor: '#4F46E5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <HomeIcon sx={{ color: 'white', fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', letterSpacing: '-0.5px' }}>
                                SmartStay
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <Button
                                onClick={() => navigate('/login')}
                                sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none', '&:hover': { color: '#0F172A', bgcolor: 'transparent' } }}
                            >
                                Log in
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/login')}
                                sx={{
                                    bgcolor: '#0F172A', color: 'white',
                                    borderRadius: '8px', px: 2.5, fontWeight: 600, textTransform: 'none',
                                    '&:hover': { bgcolor: '#334155' }
                                }}
                            >
                                Get Started
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* --- Hero Section --- */}
            <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 }, bgcolor: 'white', borderBottom: '1px solid #F1F5F9' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={8} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Fade in={visible} timeout={800}>
                                <Box>
                                    <Chip
                                        label="trusted by mits students"
                                        size="small"
                                        sx={{
                                            bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700,
                                            textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', mb: 3
                                        }}
                                    />
                                    <Typography variant="h2" sx={{
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        fontWeight: 800, color: '#0F172A',
                                        lineHeight: 1.1, mb: 2, letterSpacing: '-1px'
                                    }}>
                                        Find verified housing <br />
                                        <Box component="span" sx={{ color: '#4F46E5' }}>near your campus.</Box>
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        fontSize: '1.125rem', color: '#64748B',
                                        mb: 5, lineHeight: 1.6, maxWidth: '500px'
                                    }}>
                                        The official platform for MITS Gwalior. Browse vetted rooms, connect with landlords, and move in without paying any brokerage details.
                                    </Typography>

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={() => navigate('/login')}
                                            endIcon={<ArrowForwardIcon />}
                                            sx={{
                                                bgcolor: '#4F46E5', color: 'white',
                                                borderRadius: '8px', px: 4, py: 1.5,
                                                fontWeight: 600, textTransform: 'none', fontSize: '1rem',
                                                '&:hover': { bgcolor: '#4338CA' }
                                            }}
                                        >
                                            Find a Room
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            onClick={() => navigate('/login')} // Assuming listing flow starts here too
                                            sx={{
                                                borderColor: '#E2E8F0', color: '#475569',
                                                borderRadius: '8px', px: 4, py: 1.5,
                                                fontWeight: 600, textTransform: 'none', fontSize: '1rem',
                                                '&:hover': { borderColor: '#94A3B8', bgcolor: 'transparent' }
                                            }}
                                        >
                                            List Property
                                        </Button>
                                    </Stack>

                                    {/* Trust Badges */}
                                    <Stack direction="row" spacing={4} sx={{ mt: 6, pt: 4, borderTop: '1px solid #F1F5F9' }}>
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>500+</Typography>
                                            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>Active Students</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>0%</Typography>
                                            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>Brokerage Fee</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>100%</Typography>
                                            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>Verified Hosts</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Fade>
                        </Grid>

                        {/* Professional Graphic - Clean Interface Mock */}
                        <Grid item xs={12} md={6}>
                            <Fade in={visible} timeout={1200}>
                                <Box sx={{ position: 'relative', p: 4 }}>
                                    {/* Background decorative blob */}
                                    <Box sx={{
                                        position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                                        bgcolor: '#F1F5F9', borderRadius: '50% 30% 70% 40%', zIndex: 0
                                    }} />

                                    {/* App Card Mock */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            position: 'relative', zIndex: 1,
                                            borderRadius: '24px', overflow: 'hidden',
                                            boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)',
                                            border: '1px solid #E2E8F0',
                                            maxWidth: 360, mx: 'auto', bgcolor: 'white'
                                        }}
                                    >
                                        {/* Mock App Header */}
                                        <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ width: 80, height: 10, bgcolor: '#E2E8F0', borderRadius: 4 }} />
                                            <Box sx={{ width: 24, height: 24, bgcolor: '#F1F5F9', borderRadius: '50%' }} />
                                        </Box>

                                        {/* Mock Room Image */}
                                        <Box sx={{ height: 200, bgcolor: '#CBD5E1', background: 'linear-gradient(45deg, #e2e8f0 25%, #f1f5f9 25%, #f1f5f9 50%, #e2e8f0 50%, #e2e8f0 75%, #f1f5f9 75%, #f1f5f9 100%)', backgroundSize: '40px 40px' }} />

                                        {/* Mock Content */}
                                        <Box sx={{ p: 3 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Box sx={{ width: 120, height: 16, bgcolor: '#0F172A', borderRadius: 4 }} />
                                                <Box sx={{ width: 60, height: 16, bgcolor: '#4F46E5', borderRadius: 4 }} />
                                            </Stack>
                                            <Box sx={{ width: 180, height: 12, bgcolor: '#94A3B8', borderRadius: 4, mb: 3 }} />

                                            <Stack direction="row" spacing={1} mb={3}>
                                                {[1, 2, 3].map(i => (
                                                    <Box key={i} sx={{ width: 60, height: 24, bgcolor: '#F1F5F9', borderRadius: 12 }} />
                                                ))}
                                            </Stack>

                                            <Button fullWidth variant="contained" sx={{ bgcolor: '#0F172A', borderRadius: '8px', textTransform: 'none' }}>
                                                View Details
                                            </Button>
                                        </Box>
                                    </Paper>

                                    {/* Floating Tag */}
                                    <Box sx={{
                                        position: 'absolute', bottom: 40, right: 20, zIndex: 2,
                                        bgcolor: 'white', p: 1.5, borderRadius: '12px',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                        border: '1px solid #F1F5F9'
                                    }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#ECFDF5', color: '#10B981' }}>
                                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, lineHeight: 1 }}>Verified</Typography>
                                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>Landlord ID Checked</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Fade>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- Features Section (Clean Grid) --- */}
            <Container maxWidth="lg" sx={{ py: 12 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', textAlign: 'center', mb: 2 }}>
                    Why students choose SmartStay
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', textAlign: 'center', mb: 8, maxWidth: 600, mx: 'auto' }}>
                    We've simplified the entire process of finding accommodation.
                </Typography>

                <Grid container spacing={4}>
                    {[
                        { icon: <VerifiedIcon />, title: "Verified Listings", desc: "Every property is manually checked to ensure your safety." },
                        { icon: <LocationIcon />, title: "Near Campus", desc: "Listings are filtered by distance to MITS college." },
                        { icon: <SwipeIcon />, title: "Easy Matching", desc: "Set your preferences and swipe to find your perfect room." },
                    ].map((feature, idx) => (
                        <Grid item xs={12} md={4} key={idx}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4, height: '100%', borderRadius: '16px',
                                    border: '1px solid #E2E8F0', bgcolor: 'white',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', borderColor: '#CBD5E1' }
                                }}
                            >
                                <Box sx={{
                                    width: 48, height: 48, borderRadius: '12px',
                                    bgcolor: '#F1F5F9', color: '#0F172A',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3
                                }}>
                                    {feature.icon}
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748B', lineHeight: 1.6 }}>
                                    {feature.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* --- How it Works (Tabs) --- */}
            <Box sx={{ bgcolor: 'white', py: 12, borderTop: '1px solid #F1F5F9' }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                            How it works
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Tabs
                                value={usertype}
                                onChange={(e, v) => setUsertype(v)}
                                centered
                                sx={{
                                    bgcolor: '#F8FAFC', p: 0.5, borderRadius: '12px',
                                    '& .MuiTabs-indicator': { display: 'none' },
                                    '& .MuiTab-root.Mui-selected': { bgcolor: 'white', color: '#4F46E5', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
                                    '& .MuiTab-root': { borderRadius: '8px', minHeight: 40, fontWeight: 600, textTransform: 'none', color: '#64748B', px: 4 }
                                }}
                            >
                                <Tab label="For Students" />
                                <Tab label="For Landlords" />
                            </Tabs>
                        </Box>
                    </Box>

                    <Stack spacing={4}>
                        {usertype === 0 ? (
                            // Student Flow
                            [
                                { title: "Create Profile", text: "Sign up and set your budget & preferences." },
                                { title: "Browse & Match", text: "View verified rooms near campus matching your criteria." },
                                { title: "Move In", text: "Connect with the landlord and finalize your stay." }
                            ].map((step, i) => (
                                <Box key={i} sx={{ display: 'flex', gap: 3 }}>
                                    <Avatar sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 700 }}>{i + 1}</Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>{step.title}</Typography>
                                        <Typography variant="body1" sx={{ color: '#64748B' }}>{step.text}</Typography>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            // Landlord Flow
                            [
                                { title: "List Property", text: "Add photos, rent details, and amenities." },
                                { title: "Verification", text: "We verify your listing to ensure quality for students." },
                                { title: "Get Tenants", text: "Receive inquiries directly from verified students." }
                            ].map((step, i) => (
                                <Box key={i} sx={{ display: 'flex', gap: 3 }}>
                                    <Avatar sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 700 }}>{i + 1}</Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>{step.title}</Typography>
                                        <Typography variant="body1" sx={{ color: '#64748B' }}>{step.text}</Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Stack>
                </Container>
            </Box>

            {/* --- Simple CTA --- */}
            <Box sx={{ py: 10, bgcolor: '#0F172A', textAlign: 'center' }}>
                <Container maxWidth="sm">
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>
                        Start your search today.
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4 }}>
                        Join the MITS community on SmartStay.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                            bgcolor: '#4F46E5', color: 'white',
                            borderRadius: '8px', px: 6, py: 1.5,
                            fontWeight: 600, textTransform: 'none',
                            '&:hover': { bgcolor: '#4338CA' }
                        }}
                    >
                        Create Free Account
                    </Button>
                </Container>
            </Box>
        </Box>
    );
};

export default Landing;
