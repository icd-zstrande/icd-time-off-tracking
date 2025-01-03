import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import logo from '../assets/image.png';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                height: '32px', 
                marginRight: '12px',
                width: 'auto'
              }} 
            />
            <Typography variant="h6" component="div" sx={{ color: 'primary.main' }}>
              Time Off Tracker
            </Typography>
          </Box>
          <Button color="inherit" onClick={() => navigate('/')} sx={{ mx: 1 }}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/profile')} sx={{ mx: 1 }}>
            Profile
          </Button>
          <Button color="primary" variant="outlined" onClick={handleLogout} sx={{ ml: 1 }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 