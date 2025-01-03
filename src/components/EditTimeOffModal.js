import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
} from '@mui/material';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { DatePicker } from '@mui/x-date-pickers';

const EditTimeOffModal = ({ open, onClose, entry, userId, onEdited }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState('');
  const [type, setType] = useState('vacation');

  // Update state when entry changes
  useEffect(() => {
    if (entry) {
      setStartDate(new Date(entry.startDate));
      setEndDate(new Date(entry.endDate));
      setReason(entry.reason);
      setType(entry.type);
    } else {
      setStartDate(null);
      setEndDate(null);
      setReason('');
      setType('vacation');
    }
  }, [entry]);

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

    const newDays = calculateDays(startDate, endDate);
    const daysDifference = newDays - entry.days; // Positive if new period is longer, negative if shorter

    try {
      const userRef = doc(db, 'users', userId);
      const entryRef = doc(db, 'timeOffEntries', entry.id);

      // Update the time off entry
      await updateDoc(entryRef, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: newDays,
        reason,
        type,
        updatedAt: new Date().toISOString()
      });

      // Update user's available and used days
      await updateDoc(userRef, {
        availableDays: increment(-daysDifference),
        usedDays: increment(daysDifference)
      });

      toast.success('Time off entry updated successfully');
      onEdited();
      handleClose();
    } catch (error) {
      console.error('Error updating time off entry:', error);
      toast.error('Failed to update time off entry');
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Time Off Request</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
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
          {startDate && endDate && entry && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Days requested: {calculateDays(startDate, endDate)}
                {calculateDays(startDate, endDate) !== entry.days && (
                  <Typography component="span" color={calculateDays(startDate, endDate) > entry.days ? "error" : "success"}>
                    {' '}({calculateDays(startDate, endDate) > entry.days ? '+' : ''}
                    {calculateDays(startDate, endDate) - entry.days} days change)
                  </Typography>
                )}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Update Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTimeOffModal; 