import React, { useState } from "react";
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
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import {
  doc,
  updateDoc,
  increment,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

const AddDaysModal = ({ open, onClose, userId, onDaysAdded }) => {
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("bonus");
  const [operation, setOperation] = useState("add"); // 'add' or 'subtract'

  const handleSubmit = async () => {
    if (!days) {
      toast.error("Please fill in all fields");
      return;
    }

    const daysNum = parseFloat(days);
    if (isNaN(daysNum) || daysNum <= 0) {
      toast.error("Please enter a valid number of days");
      return;
    }

    // Calculate the actual adjustment (negative if subtracting)
    const adjustment = operation === "add" ? daysNum : -daysNum;

    try {
      const userRef = doc(db, "users", userId);

      // Update available days
      await updateDoc(userRef, {
        availableDays: increment(adjustment),
      });

      // Log the adjustment in a new collection for tracking
      await addDoc(collection(db, "daysAdjustments"), {
        userId,
        days: adjustment,
        type,
        reason,
        createdAt: new Date().toISOString(),
        operation,
      });

      const message =
        operation === "add"
          ? `Added ${daysNum.toFixed(1)} days to your available balance`
          : `Subtracted ${daysNum.toFixed(1)} days from your available balance`;

      toast.success(message);
      onDaysAdded();
      handleClose();
    } catch (error) {
      console.error("Error adjusting days:", error);
      toast.error("Failed to adjust days");
    }
  };

  const handleClose = () => {
    setDays("");
    setReason("");
    setType("bonus");
    setOperation("add");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adjust Available Days</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="carryover">
                Carryover from Previous Year
              </MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <ToggleButtonGroup
              value={operation}
              exclusive
              onChange={(e, newValue) => newValue && setOperation(newValue)}
              size="small"
            >
              <ToggleButton value="add" aria-label="add days">
                <AddIcon /> Add
              </ToggleButton>
              <ToggleButton value="subtract" aria-label="subtract days">
                <RemoveIcon /> Subtract
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label="Number of Days"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              fullWidth
              inputProps={{
                min: 0.5,
                step: 0.5,
                placeholder: "e.g., 0.5, 1.0, 1.5",
              }}
              helperText="You can enter half days (e.g., 0.5)"
            />
          </Box>

          <TextField
            label="Reason"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={operation === "add" ? "primary" : "error"}
          startIcon={operation === "add" ? <AddIcon /> : <RemoveIcon />}
        >
          {operation === "add" ? "Add" : "Subtract"} Days
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDaysModal;
