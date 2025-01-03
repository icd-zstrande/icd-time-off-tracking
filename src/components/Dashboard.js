import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { DatePicker } from '@mui/x-date-pickers';
import AddDaysModal from './AddDaysModal';
import EditTimeOffModal from './EditTimeOffModal';

const holidays2025 = [
  { name: "New Year's Day", date: "2025-01-01" },
  { name: "Martin Luther King Day", date: "2025-01-20" },
  { name: "Presidents Day", date: "2025-02-17" },
  { name: "Good Friday", date: "2025-04-18" },
  { name: "Memorial Day", date: "2025-05-26" },
  { name: "Juneteenth", date: "2024-06-19" },
  { name: "Independence Day", date: "2025-07-04" },
  { name: "Labor Day", date: "2025-09-01" },
  { name: "Columbus Day", date: "2025-10-13" },
  { name: "Veterans Day", date: "2025-11-11" },
  { name: "Thanksgiving Day", date: "2025-11-27" },
  { name: "Christmas Day", date: "2025-12-25" }
];

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [timeOffEntries, setTimeOffEntries] = useState([]);
  const [daysAdjustments, setDaysAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState('');
  const [type, setType] = useState('vacation');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [showAddDaysModal, setShowAddDaysModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);

  const fetchUserData = async () => {
    try {
      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }

      // Fetch time off entries - updated to sort by startDate ascending
      const timeOffQuery = query(
        collection(db, 'timeOffEntries'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('startDate', 'asc')
      );
      
      const querySnapshot = await getDocs(timeOffQuery);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTimeOffEntries(entries);

      // Fetch days adjustments
      const adjustmentsQuery = query(
        collection(db, 'daysAdjustments'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const adjustmentsSnapshot = await getDocs(adjustmentsQuery);
      const adjustments = adjustmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDaysAdjustments(adjustments);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchUserData();
    }
  }, []);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill in all fields');
      return;
    }

    if (endDate < startDate) {
      toast.error('End date cannot be before start date');
      return;
    }

    const days = calculateDays(startDate, endDate);

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Update available days and used days
      await updateDoc(userRef, {
        availableDays: increment(-days),
        usedDays: increment(days)
      });

      // Add new time off entry
      await addDoc(collection(db, 'timeOffEntries'), {
        userId: auth.currentUser.uid,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days,
        reason,
        type,
        createdAt: new Date().toISOString()
      });

      toast.success('Time off added successfully');
      fetchUserData();
      
      // Reset form
      setStartDate(null);
      setEndDate(null);
      setReason('');
      setType('vacation');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding time off:', error);
      toast.error('Failed to add time off');
    }
  };

  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Update available days and used days
      await updateDoc(userRef, {
        availableDays: increment(entryToDelete.days),
        usedDays: increment(-entryToDelete.days)
      });

      // Delete the time off entry
      await deleteDoc(doc(db, 'timeOffEntries', entryToDelete.id));

      toast.success('Time off entry deleted successfully');
      fetchUserData();
    } catch (error) {
      console.error('Error deleting time off entry:', error);
      toast.error('Failed to delete time off entry');
    } finally {
      setDeleteConfirmOpen(false);
      setEntryToDelete(null);
    }
  };

  // Calculate total adjustments
  const calculateAdjustments = () => {
    const additions = daysAdjustments
      .filter(adj => adj.operation === 'add')
      .reduce((sum, adj) => sum + adj.days, 0);
    
    const subtractions = daysAdjustments
      .filter(adj => adj.operation === 'subtract')
      .reduce((sum, adj) => sum + Math.abs(adj.days), 0);

    return { additions, subtractions };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const remainingDays = userData ? userData.totalDays - userData.usedDays : 0;
  const usedDays = userData ? userData.usedDays : 0;

  return (
    <Grid container spacing={3}>
      {/* Welcome Message */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome, {userData?.name}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {userData?.jobLevel}
          </Typography>
        </Paper>
      </Grid>

      {/* Leave Balance and Progress Cards */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leave Balance
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Total Days:</Typography>
              <Typography variant="body1" fontWeight="bold">
                {userData?.totalDays} days
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Used Days:</Typography>
              <Typography variant="body1" color="error" fontWeight="bold">
                {usedDays} days
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
              <Typography variant="body1">Available Days:</Typography>
              <Typography variant="body1" color="success.main" fontWeight="bold">
                {userData?.availableDays || 0} days
              </Typography>
            </Box>
            {daysAdjustments.length > 0 && (
              <Typography 
                variant="caption" 
                color={calculateAdjustments().additions - calculateAdjustments().subtractions >= 0 ? "success.main" : "error.main"}
                sx={{ display: 'block', textAlign: 'left', mb: 2, fontStyle: 'italic' }}
              >
                {calculateAdjustments().additions - calculateAdjustments().subtractions >= 0 ? '+' : ''}
                {(calculateAdjustments().additions - calculateAdjustments().subtractions).toFixed(1)} days added
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowAddDaysModal(true)}
                fullWidth
              >
                Additional Days
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leave Usage
            </Typography>
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1.4 }}>
              <CircularProgress
                variant="determinate"
                value={(usedDays / (userData?.totalDays + (calculateAdjustments().additions - calculateAdjustments().subtractions))) * 100}
                size={120}
                thickness={4}
                sx={{ position: 'relative' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6" component="div">
                  {Math.round((usedDays / (userData?.totalDays + (calculateAdjustments().additions - calculateAdjustments().subtractions))) * 100)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Used
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              {usedDays} of {(userData?.totalDays + (calculateAdjustments().additions - calculateAdjustments().subtractions)).toFixed(1)} total days
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Holidays Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              2025 Holidays
            </Typography>
            <Grid container spacing={2}>
              {holidays2025.map((holiday, index) => (
                <Grid item xs={12} md={4} key={holiday.date}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    px: 2,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'primary.main',
                    }
                  }}>
                    <Typography variant="body1">
                      {holiday.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      {format(parseISO(holiday.date), 'MMM d')}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Add Time Off Section */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Time Off</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={!userData?.availableDays || userData.availableDays <= 0}
          >
            {showAddForm ? 'Cancel Request' : 'Add Time Off'}
          </Button>
        </Box>

        {showAddForm && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={type}
                      label="Type"
                      onChange={(e) => setType(e.target.value)}
                    >
                      <MenuItem value="vacation">Vacation</MenuItem>
                      <MenuItem value="sick">Sick Leave</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    sx={{ width: '100%' }}
                    minDate={startDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reason"
                    multiline
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    fullWidth
                  />
                </Grid>
                {startDate && endDate && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      Days requested: {calculateDays(startDate, endDate)}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                    >
                      Submit Request
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Time Off History */}
        <Card>
          <CardContent>
            <List>
              {timeOffEntries.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No time off entries yet" />
                </ListItem>
              ) : (
                timeOffEntries.map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${format(new Date(entry.startDate), 'MMM dd, yyyy')} - ${format(new Date(entry.endDate), 'MMM dd, yyyy')}`}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {entry.days} days - {entry.type}
                            </Typography>
                            <br />
                            {entry.reason}
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="edit"
                          onClick={() => {
                            setEntryToEdit(entry);
                            setEditModalOpen(true);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon color="primary" />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteClick(entry)}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < timeOffEntries.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Delete Time Off Request</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this time off request? This will add {entryToDelete?.days} days back to your remaining days.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Days Modal */}
        <AddDaysModal
          open={showAddDaysModal}
          onClose={() => setShowAddDaysModal(false)}
          userId={auth.currentUser?.uid}
          onDaysAdded={fetchUserData}
        />

        {/* Edit Time Off Modal */}
        <EditTimeOffModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEntryToEdit(null);
          }}
          entry={entryToEdit}
          userId={auth.currentUser?.uid}
          onEdited={fetchUserData}
        />
      </Grid>
    </Grid>
  );
};

export default Dashboard; 