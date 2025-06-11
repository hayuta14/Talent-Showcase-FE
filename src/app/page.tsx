'use client';

import { Button, Container, Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box className="min-h-screen flex flex-col items-center justify-center">
        <Typography variant="h2" component="h1" className="mb-8 text-center">
          Welcome to Talent Showcase
        </Typography>
        <Typography variant="h5" component="h2" className="mb-8 text-center text-gray-600">
          A platform to showcase your talents
        </Typography>
        <Box className="flex gap-4">
          <Button variant="contained" color="primary" size="large">
            Get Started
          </Button>
          <Button variant="outlined" color="secondary" size="large">
            Learn More
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
