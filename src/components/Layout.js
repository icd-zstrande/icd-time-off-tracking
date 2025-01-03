import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Tabs, Tab } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

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
      '/employees': 2
    };
    setValue(pathToIndex[location.pathname] || 0);
  }, [location]);

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
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Time Off Tracker
          </Typography>
          <Button color="inherit" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          centered
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="Dashboard" component={RouterLink} to="/" />
          <Tab label="Profile" component={RouterLink} to="/profile" />
          {isManager && <Tab label="Employees" component={RouterLink} to="/employees" />}
        </Tabs>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout; 