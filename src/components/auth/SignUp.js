import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { toast } from 'react-toastify';
import logo from '../../assets/image.png';

const jobLevels = [
  { title: 'Managing Director', days: 30 },
  { title: 'Director (5+ years)', days: 30 },
  { title: 'Director (< 5 years)', days: 25 },
  { title: 'Vice President', days: 25 },
  { title: 'Assistant Vice President', days: 20 },
  { title: 'Associate', days: 20 }
];

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [jobLevel, setJobLevel] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !name || !jobLevel) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Find the selected job level object
      const selectedLevel = jobLevels.find(level => level.title === jobLevel);
      if (!selectedLevel) {
        throw new Error('Invalid job level selected');
      }
      
      // Create user profile in Firestore
      const userData = {
        name,
        email,
        jobLevel,
        totalDays: selectedLevel.days,
        usedDays: 0,
        availableDays: selectedLevel.days,
        isManager,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      toast.success('Account created successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              height: '64px', 
              marginBottom: '16px',
              width: 'auto'
            }} 
          />
          <Typography component="h1" variant="h5">
            Time Off Tracker
          </Typography>
        </Box>
        <Typography component="h2" variant="h5">
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="job-level-label">Job Level</InputLabel>
            <Select
              labelId="job-level-label"
              id="job-level"
              value={jobLevel}
              label="Job Level"
              onChange={(e) => setJobLevel(e.target.value)}
              required
              disabled={loading}
            >
              {jobLevels.map((level) => (
                <MenuItem key={level.title} value={level.title}>
                  {level.title} - {level.days} days
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isManager}
                onChange={(e) => setIsManager(e.target.checked)}
                disabled={loading}
                color="primary"
              />
            }
            label="I am a manager"
            sx={{ mt: 1, mb: 1 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <Link to="/signin" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" align="center">
              Already have an account? Sign In
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp; 