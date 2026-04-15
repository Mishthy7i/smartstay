import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Box,
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { markNotificationAsRead } from '../utils/firestore';

const NotificationsDialog = ({ open, onClose, notifications }) => {
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Notifications
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem 
                  alignItems="flex-start"
                  button
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    bgcolor: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notif.type === 'like' ? '#fff0f2' : 'primary.main' }}>
                      {notif.type === 'like' ? (
                        <FavoriteIcon sx={{ color: '#ef4444' }} />
                      ) : (
                        <FavoriteIcon />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: notif.read ? 500 : 700 }}>
                          {notif.student_name} liked your property
                        </Typography>
                        {notif.created_at && (
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notif.created_at)}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ fontWeight: notif.read ? 400 : 500 }}
                      >
                        They showed interest in "{notif.room_title}"
                      </Typography>
                    }
                  />
                  {!notif.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        alignSelf: 'center',
                        ml: 2
                      }}
                    />
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          ) : (
            <Box textAlign="center" py={6}>
              <Typography variant="body1" color="text.secondary">
                No notifications yet.
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
