import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Tabs, Tab } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/image.png';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const checkIfManager = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setIsManager(userDoc.data().isManager || false);
        }
      }
    };
    checkIfManager();
  }, []);

  useEffect(() => {
    // Map paths to tab indices
    const pathToIndex = {
      '/': 0,
      '/profile': 1,
      '/employees': isManager ? 2 : 0 // Default to Dashboard if not a manager
    };
    setValue(pathToIndex[location.pathname] || 0);
  }, [location, isManager]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ minHeight: '64px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                height: '32px', 
                marginRight: '12px',
                width: 'auto'
              }} 
            />
            <Typography variant="h6" component="div">
              Time Off Tracker
            </Typography>
          </Box>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ flexGrow: 1 }}
          >
            <Tab label="Dashboard" component={RouterLink} to="/" />
            <Tab label="Profile" component={RouterLink} to="/profile" />
            {isManager && <Tab label="Employees" component={RouterLink} to="/employees" />}
          </Tabs>
          <Button color="inherit" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout; 