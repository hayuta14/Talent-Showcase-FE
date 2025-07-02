"use client";

import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import { getAuth } from '@/generated/api/endpoints/auth/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterSuccess('');
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match');
      setRegisterLoading(false);
      return;
    }
    try {
      const auth = getAuth();
      await auth.postApiV1AuthRegister({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        phoneNumber: registerData.phoneNumber,
      });
      setRegisterSuccess('Register successful! Please login.');
    } catch (err: any) {
      setRegisterError(err?.response?.data?.message || 'Register failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prevData => ({ ...prevData, [name]: value }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#1976d2',
              mb: 4,
            }}
          >
            Register for Talent Showcase
          </Typography>
          <Box component="form" className="space-y-4" onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              value={registerData.username}
              onChange={handleInputChange}
              name="username"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={registerData.email}
              onChange={handleInputChange}
              name="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={registerData.password}
              onChange={handleInputChange}
              name="password"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              value={registerData.confirmPassword}
              onChange={handleInputChange}
              name="confirmPassword"
            />
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              value={registerData.phoneNumber}
              onChange={handleInputChange}
              name="phoneNumber"
            />
            {registerError && <Typography color="error">{registerError}</Typography>}
            {registerSuccess && <Typography color="primary">{registerSuccess}</Typography>}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              className="mt-4"
              type="submit"
              disabled={registerLoading}
            >
              {registerLoading ? 'Registering...' : 'Register'}
            </Button>
            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link href="/auth" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 