'use client';

import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Tab, Tabs } from '@mui/material';

export default function AuthPage() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="sm">
      <Box className="min-h-screen flex items-center justify-center py-12">
        <Paper elevation={3} className="w-full p-8">
          <Typography variant="h4" component="h1" className="text-center mb-6">
            Welcome to Talent Showcase
          </Typography>
          
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            className="mb-6"
            centered
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {tab === 0 ? (
            <Box component="form" className="space-y-4">
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                className="mt-4"
              >
                Login
              </Button>
            </Box>
          ) : (
            <Box component="form" className="space-y-4">
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                className="mt-4"
              >
                Register
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 