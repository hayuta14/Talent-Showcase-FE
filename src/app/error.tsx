'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Something went wrong!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {error.message}
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => reset()}>
          Try again
        </Button>
        <Button variant="outlined" onClick={() => router.push('/')}>
          Go home
        </Button>
      </Box>
    </Box>
  );
} 