import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  Autocomplete,
  TextField,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';

const jobLevels = [
  { title: 'Managing Director', days: 30 },
  { title: 'Director (5+ years)', days: 30 },
  { title: 'Director (< 5 years)', days: 25 },
  { title: 'Vice President', days: 25 },
  { title: 'Assistant Vice President', days: 20 },
  { title: 'Associate', days: 20 }
];

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [jobLevel, setJobLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setJobLevel(data.jobLevel);
          if (data.managerId) {
            const managerDoc = await getDoc(doc(db, 'users', data.managerId));
            if (managerDoc.exists()) {
              setSelectedManager({
                id: data.managerId,
                name: managerDoc.data().name,
                email: managerDoc.data().email
              });
            }
          }
        }
      } catch (error) {
        toast.error('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    const fetchAllUsers = async () => {
      setLoadingUsers(true);
      try {
        const usersSnapshot = await getDocs(
          query(
            collection(db, 'users'),
            where('isManager', '==', true)
          )
        );
        const usersData = usersSnapshot.docs
          .map(doc => ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email
          }))
          .filter(user => user.id !== auth.currentUser.uid); // Exclude current user
        setAllUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Error loading managers list');
      } finally {
        setLoadingUsers(false);
      }
    };

    if (auth.currentUser) {
      fetchUserData();
      fetchAllUsers();
    }
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const updates = {
        jobLevel,
        totalDays: jobLevels.find(level => level.title === jobLevel).days,
        managerId: selectedManager?.id || null,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Profile
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" gutterBottom>
            Name: {userData?.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Email: {userData?.email}
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 3, mb: 3 }}>
            <InputLabel id="job-level-label">Job Level</InputLabel>
            <Select
              labelId="job-level-label"
              id="job-level"
              value={jobLevel}
              label="Job Level"
              onChange={(e) => setJobLevel(e.target.value)}
            >
              {jobLevels.map((level) => (
                <MenuItem key={level.title} value={level.title}>
                  {level.title} - {level.days} days
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            value={selectedManager}
            onChange={(event, newValue) => {
              setSelectedManager(newValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            options={allUsers}
            loading={loadingUsers}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Manager"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
            sx={{ mb: 3 }}
          />
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleUpdateProfile}
          >
            Update Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 