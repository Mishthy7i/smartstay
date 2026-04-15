import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  AppBar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SwipeInterface from '../components/SwipeInterface';
import PropertyList from '../components/PropertyList';
import RoomDetailsDialog from '../components/RoomDetailsDialog';
import NotificationsDialog from '../components/NotificationsDialog';
import { getAllRooms, getRoomsByLandlord, recordSwipe, deleteRoom, getSwipedRoomIds, getLikedRooms, subscribeToNotifications, removeSwipe } from '../utils/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout, loading, completeOnboarding } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [landlordRooms, setLandlordRooms] = useState([]);
  const [likedRooms, setLikedRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [showOnboardDialog, setShowOnboardDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    let unsubscribe;
    if (user) {
      fetchRooms();
      if (user.role === 'landlord') {
        unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
          setNotifications(notifs);
        });
      }
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      if (user.role === 'student') {
        // Fetch all rooms for students to swipe
        const allRooms = await getAllRooms();

        // Get already swiped room IDs
        const swipedIds = await getSwipedRoomIds(user.uid);

        // Filter out already swiped rooms and deleted rooms
        const unseenRooms = allRooms.filter(
          room => !swipedIds.includes(room.id || room.room_id) && !room.deleted
        );

        // Apply recommendation scoring
        const scoredRooms = scoreRooms(unseenRooms, user);
        setRooms(scoredRooms);

        // Fetch liked rooms for profile
        const liked = await getLikedRooms(user.uid);
        setLikedRooms(liked.filter(room => !room.deleted));
      } else if (user.role === 'landlord') {
        // Fetch landlord's own rooms
        const myRooms = await getRoomsByLandlord(user.uid);
        setLandlordRooms(myRooms.filter(room => !room.deleted));
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      showToast('Failed to load rooms', 'error');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Recommendation scoring algorithm
  const scoreRooms = (rooms, user) => {
    if (!user) return rooms;

    // 1. apply STRICT GENDER FILTERING first
    const filteredRooms = rooms.filter(room => {
      if (!user.looking_for_gender || user.looking_for_gender === 'any') return true;
      
      const roomConstraint = (room.gender_preference || 'any').toLowerCase();
      if (roomConstraint === 'any') return true;
      
      // If student is looking for girls PG, hide boys only
      if (user.looking_for_gender === 'female' && roomConstraint === 'male') return false;
      // If student in looking for boys PG, hide girls only
      if (user.looking_for_gender === 'male' && roomConstraint === 'female') return false;
      
      return true;
    });

    // 2. Define exponential priority weights
    const priorities = user.priorities || ['budget', 'distance', 'gender', 'amenities'];
    const getWeight = (id) => {
      const index = priorities.indexOf(id);
      if (index === 0) return 50; // Top priority is DOMINANT
      if (index === 1) return 15;
      if (index === 2) return 5;
      return 1;
    };

    const scoredRooms = filteredRooms.map(room => {
      let totalScore = 0;

      // --- BUDGET SCORING ---
      let budgetScore = 0;
      if (user.min_budget && user.max_budget) {
        if (room.price >= user.min_budget && room.price <= user.max_budget) {
          budgetScore = 100;
          // Small bonus for being right in the middle
          const midBudget = (user.min_budget + user.max_budget) / 2;
          const budgetDiff = Math.abs(room.price - midBudget);
          const maxDiff = (user.max_budget - user.min_budget) / 2;
          budgetScore += (1 - budgetDiff / maxDiff) * 30;
        } else if (room.price < user.min_budget) {
          budgetScore = 80; // Cheaper is good
        } else {
          // HEAVY Penalty for being over budget if budget is high priority
          const overAmount = room.price - user.max_budget;
          const penaltyFactor = (priorities.indexOf('budget') === 0) ? 0.05 : 0.2;
          budgetScore = Math.max(0, (50 - (overAmount / 150)) * penaltyFactor);
        }
      }
      totalScore += budgetScore * getWeight('budget');

      // --- GENDER SCORING ---
      let genderScore = 0;
      const roomConstraint = (room.gender_preference || 'any').toLowerCase();
      if (user.looking_for_gender && roomConstraint === user.looking_for_gender) {
        genderScore = 100;
      } else if (roomConstraint === 'any') {
        genderScore = 70;
      }
      totalScore += genderScore * getWeight('gender');

      // --- DISTANCE/COLLEGE SCORING ---
      let distanceScore = 0;
      if (user.college && room.location) {
        const collegeNorm = user.college.toLowerCase();
        const locNorm = room.location.toLowerCase();
        if (locNorm.includes(collegeNorm) || collegeNorm.includes(locNorm)) {
          distanceScore = 100;
        } else {
          const collegeParts = collegeNorm.split(/[,\s]+/);
          const sharedKeywords = collegeParts.filter(part => part.length > 3 && locNorm.includes(part));
          distanceScore = Math.min(80, sharedKeywords.length * 30);
        }
      }
      totalScore += distanceScore * getWeight('distance');

      // --- AMENITIES SCORING ---
      let amenitiesScore = 0;
      if (room.amenities && room.amenities.length > 0) {
        amenitiesScore = Math.min(100, room.amenities.length * 15);
      }
      totalScore += amenitiesScore * getWeight('amenities');

      return { ...room, recommendationScore: totalScore };
    });

    // Sort by score (highest first)
    return scoredRooms.sort((a, b) => b.recommendationScore - a.recommendationScore);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Failed to logout', 'error');
    }
  };

  const handleLike = async (room, isMatch, matchScore) => {
    try {
      await recordSwipe(user.uid, room.id || room.room_id, 'like', user.name);
      setRooms(prev => prev.filter(r => (r.id || r.room_id) !== (room.id || room.room_id)));
      showToast('Room liked!', 'success');
    } catch (error) {
      console.error('Error liking room:', error);
      showToast('Failed to like room', 'error');
    }
  };

  const handleDislike = async (room) => {
    try {
      await recordSwipe(user.uid, room.id || room.room_id, 'dislike');
      setRooms(prev => prev.filter(r => (r.id || r.room_id) !== (room.id || room.room_id)));
    } catch (error) {
      console.error('Error disliking room:', error);
    }
  };

  const handleOpenDetails = (room) => {
    setSelectedRoom(room);
    setShowDetailsDialog(true);
  };

  const handleDeleteProperty = async (roomId) => {
    try {
      await deleteRoom(roomId, user.uid);
      setLandlordRooms(prev => prev.filter(r => (r.id || r.room_id) !== roomId));
      showToast('Property deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting property:', error);
      showToast(error.message || 'Failed to delete property', 'error');
    }
  };

  const handleUnlikeRoom = async (roomId) => {
    try {
      await removeSwipe(user.uid, roomId);
      setLikedRooms(prev => prev.filter(r => (r.id || r.room_id) !== roomId));
      showToast('Property removed from liked list', 'success');
      // Refetch unseen rooms to possibly show it in Swipe queue again
      if (user.role === 'student') {
        fetchRooms();
      }
    } catch (error) {
      console.error('Error removing from liked:', error);
      showToast('Failed to remove property from liked list', 'error');
    }
  };

  const handleOnboardAgain = async () => {
    try {
      // Reset onboarding status in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { is_onboarded: false }, { merge: true });

      showToast('Redirecting to onboarding...', 'info');
      setShowOnboardDialog(false);

      // Navigate to onboarding - the page will reload and fetch updated user data
      const onboardingPath = user.role === 'landlord' ? '/onboarding/landlord' : '/onboarding/student';

      // Force a page reload to ensure user state is refreshed
      window.location.href = onboardingPath;
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      showToast('Failed to reset onboarding', 'error');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getRoleColor = (role) => {
    return role === 'landlord' ? 'primary' : 'success';
  };

  const getRoleLabel = (role) => {
    return role === 'landlord' ? 'Landlord' : 'Student';
  };

  // Student tabs
  const studentTabs = ['Swipe', 'Liked Rooms', 'Profile'];
  // Landlord tabs
  const landlordTabs = ['Properties', 'Add Property', 'Profile'];

  const renderStudentView = () => {
    switch (activeTab) {
      case 0: // Swipe
        return (
          <Box>
            {loadingRooms ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
              </Box>
            ) : (
              <SwipeInterface
                rooms={rooms}
                onLike={handleLike}
                onDislike={handleDislike}
                onOpenDetails={handleOpenDetails}
                onRefresh={fetchRooms}
              />
            )}
          </Box>
        );
      case 1: // Liked Rooms
        return (
          <Box>
            {loadingRooms ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
              </Box>
            ) : likedRooms.length === 0 ? (
              <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No Liked Rooms Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Swipe right on rooms you like to see them here
                </Typography>
              </Paper>
            ) : (
              <PropertyList
                rooms={likedRooms}
                onViewDetails={handleOpenDetails}
                onDelete={handleUnlikeRoom}
                showDelete={true}
                showEdit={false}
              />
            )}
          </Box>
        );
      case 2: // Profile
        return renderProfile();
      default:
        return null;
    }
  };

  const renderLandlordView = () => {
    switch (activeTab) {
      case 0: // Properties
        return (
          <Box>
            {loadingRooms ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
              </Box>
            ) : (
              <PropertyList
                rooms={landlordRooms}
                onDelete={handleDeleteProperty}
              />
            )}
          </Box>
        );
      case 1: // Add Property
        return (
          <Box textAlign="center" sx={{ py: 8 }}>
            <HomeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Add New Property
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Create a new property listing to reach more students
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/onboarding/landlord')}
              sx={{ borderRadius: 3, px: 4 }}
            >
              Add Property
            </Button>
          </Box>
        );
      case 2: // Profile
        return renderProfile();
      default:
        return null;
    }
  };

  const renderProfile = () => {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h4" component="h1">
              Profile
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>

          <Divider />

          <Box display="flex" flexDirection="column" alignItems="center" sx={{ py: 3 }}>
            <Avatar
              src={user.photo}
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                mb: 2,
                bgcolor: 'primary.main'
              }}
            >
              {!user.photo && getInitials(user.name)}
            </Avatar>

            <Typography variant="h5" component="h2" gutterBottom>
              {user.name || 'User'}
            </Typography>

            <Chip
              label={getRoleLabel(user.role)}
              color={getRoleColor(user.role)}
              sx={{ mb: 2 }}
            />
          </Box>

          <Divider />

          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <EmailIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <PersonIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {user.uid}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {getRoleLabel(user.role)}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowOnboardDialog(true)}
            fullWidth
          >
            Onboard Again
          </Button>
        </Stack>
      </Paper>
    );
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          py: 2
        }}
      >
        {/* Header */}
        <Paper elevation={2} sx={{ mb: 2, p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                SmartStay
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role === 'landlord' ? 'Owner Portal' : 'Smart Student Housing'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              {user.role === 'landlord' && (
                <IconButton onClick={() => setShowNotifications(true)}>
                  <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}
              <Avatar
                src={user.photo}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main'
                }}
              >
                {!user.photo && getInitials(user.name)}
              </Avatar>
            </Stack>
          </Stack>
        </Paper>

        {/* Tabs */}
        <Paper elevation={2} sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            {(user.role === 'student' ? studentTabs : landlordTabs).map((tab, index) => (
              <Tab key={index} label={tab} />
            ))}
          </Tabs>
        </Paper>

        {/* Content */}
        <Box sx={{ pb: 4 }}>
          {user.role === 'student' ? renderStudentView() : renderLandlordView()}
        </Box>

        {/* Onboard Again Dialog */}
        <Dialog open={showOnboardDialog} onClose={() => setShowOnboardDialog(false)}>
          <DialogTitle>Onboard Again?</DialogTitle>
          <DialogContent>
            <Typography>
              This will reset your onboarding status. You'll need to complete the onboarding process again.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowOnboardDialog(false)}>Cancel</Button>
            <Button onClick={handleOnboardAgain} color="primary" variant="contained">
              Continue
            </Button>
          </DialogActions>
        </Dialog>

        {/* Room Details Dialog */}
        <RoomDetailsDialog
          open={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
          room={selectedRoom}
        />

        {/* Notifications Dialog */}
        <NotificationsDialog
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
        />
      </Box>
    </Container>
  );
};

export default Home;
