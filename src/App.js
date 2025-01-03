import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Employees from './components/Employees';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <ToastContainer 
            position="top-right"
            theme="dark"
          />
          <Routes>
            <Route
              path="/signin"
              element={user ? <Navigate to="/" /> : <SignIn />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to="/" /> : <SignUp />}
            />
            {user ? (
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/employees" element={<Employees />} />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/signin" />} />
            )}
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
