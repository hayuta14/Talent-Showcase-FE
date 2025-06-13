'use client';

import { Button, Container, Typography, Box } from '@mui/material';
import UpContent from './pages/upContent';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box className="min-h-screen flex flex-col items-center justify-center">

        
        <Box className="mt-8">
          <UpContent />
        </Box>
      </Box>
    </Container>
  );
}
