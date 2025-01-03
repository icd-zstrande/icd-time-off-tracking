import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Container, Paper, Typography, Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setJobLevel(data.jobLevel);
        }
      } catch (error) {
        toast.error('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchUserData();
    }
  }, []);

  const handleUpdateJobLevel = async () => {
    try {
      const selectedLevel = jobLevels.find(level => level.title === jobLevel);
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        jobLevel,
        totalDays: selectedLevel.days
      });
      toast.success('Job level updated successfully');
    } catch (error) {
      toast.error('Error updating job level');
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
          
          
          <FormControl fullWidth sx={{ mt: 3 }}>
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
          
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleUpdateJobLevel}
          >
            Update Job Level
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 