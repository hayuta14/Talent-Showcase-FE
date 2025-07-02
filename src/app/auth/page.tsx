'use client';

import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import { getAuth } from '@/generated/api/endpoints/auth/auth';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setTokens = useAuthStore((s) => s.setTokens);
  const router = useRouter();

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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const auth = getAuth();
      const res = await auth.postApiV1AuthLogin({ email, password });
      const accessToken = res.data?.accessToken;
      if (accessToken) {
        setTokens(accessToken);
        router.push('/');
      } else {
        setError('Login failed: No access token returned');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
      setTab(0);
    } catch (err: any) {
      setRegisterError(err?.response?.data?.message || 'Register failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implementation of handleInputChange function
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
            Welcome to Talent Showcase
          </Typography>

          {tab === 0 ? (
            <Box component="form" className="space-y-4" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {error && <Typography color="error">{error}</Typography>}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                className="mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Box textAlign="center" mt={2}>
                <Typography variant="body2">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                    Register
                  </Link>
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box component="form" className="space-y-4" onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={registerData.username}
                onChange={e => setRegisterData(d => ({ ...d, username: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={registerData.email}
                onChange={e => setRegisterData(d => ({ ...d, email: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={registerData.password}
                onChange={e => setRegisterData(d => ({ ...d, password: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                value={registerData.confirmPassword}
                onChange={e => setRegisterData(d => ({ ...d, confirmPassword: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={registerData.phoneNumber}
                onChange={e => setRegisterData(d => ({ ...d, phoneNumber: e.target.value }))}
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
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}