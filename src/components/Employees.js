import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesQuery = query(
          collection(db, 'users'),
          where('managerId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(employeesQuery);
        const employeesData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          
          // Fetch time off entries for each employee
          const timeOffQuery = query(
            collection(db, 'timeOffEntries'),
            where('userId', '==', doc.id),
            orderBy('startDate', 'asc')
          );
          const timeOffSnapshot = await getDocs(timeOffQuery);
          const timeOffEntries = timeOffSnapshot.docs.map(entry => ({
            id: entry.id,
            ...entry.data()
          }));

          // Fetch days adjustments for each employee
          const adjustmentsQuery = query(
            collection(db, 'daysAdjustments'),
            where('userId', '==', doc.id)
          );
          const adjustmentsSnapshot = await getDocs(adjustmentsQuery);
          const adjustments = adjustmentsSnapshot.docs.map(adj => ({
            id: adj.id,
            ...adj.data()
          }));

          return {
            id: doc.id,
            ...userData,
            timeOffEntries,
            adjustments
          };
        }));

        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const calculateAdjustments = (adjustments) => {
    const additions = adjustments
      .filter(adj => adj.operation === 'add')
      .reduce((sum, adj) => sum + adj.days, 0);
    
    const subtractions = adjustments
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

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
        My Team
      </Typography>

      {employees.length === 0 ? (
        <Typography>No employees found.</Typography>
      ) : (
        employees.map((employee) => (
          <Accordion key={employee.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{employee.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Employee Details
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                          Email: {employee.email}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Job Level: {employee.jobLevel}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Total Days: {employee.totalDays}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Used Days: {employee.usedDays}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Available Days: {employee.availableDays}
                        </Typography>
                        {employee.adjustments.length > 0 && (
                          <Typography 
                            variant="body2" 
                            color={calculateAdjustments(employee.adjustments).additions - 
                              calculateAdjustments(employee.adjustments).subtractions >= 0 ? 
                              "success.main" : "error.main"}
                            sx={{ fontStyle: 'italic' }}
                          >
                            {calculateAdjustments(employee.adjustments).additions - 
                              calculateAdjustments(employee.adjustments).subtractions >= 0 ? '+' : ''}
                            {(calculateAdjustments(employee.adjustments).additions - 
                              calculateAdjustments(employee.adjustments).subtractions).toFixed(1)} days adjusted
                          </Typography>
                        )}
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
                      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                        <CircularProgress
                          variant="determinate"
                          value={(employee.usedDays / (employee.totalDays + 
                            (calculateAdjustments(employee.adjustments).additions - 
                              calculateAdjustments(employee.adjustments).subtractions))) * 100}
                          size={120}
                          thickness={4}
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
                            {Math.round((employee.usedDays / (employee.totalDays + 
                              (calculateAdjustments(employee.adjustments).additions - 
                                calculateAdjustments(employee.adjustments).subtractions))) * 100)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Used
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Scheduled Time Off
                      </Typography>
                      {employee.timeOffEntries.length === 0 ? (
                        <Typography>No time off entries found.</Typography>
                      ) : (
                        employee.timeOffEntries.map((entry) => (
                          <Box key={entry.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="subtitle1">
                              {new Date(entry.startDate).toLocaleDateString()} - {new Date(entry.endDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {entry.days} days - {entry.type}
                            </Typography>
                            <Typography variant="body2">
                              {entry.reason}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
};

export default Employees; 