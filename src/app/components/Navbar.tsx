'use client';

import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          Talent Showcase
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => router.push('/talents')}
            >
              Browse Talents
            </Button>
            <Button
              color="inherit"
              onClick={() => router.push('/profile')}
            >
              Profile
            </Button>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 32, height: 32, cursor: 'pointer' }}
              onClick={() => router.push('/profile')}
            />
            <Button
              color="inherit"
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Button
            color="inherit"
            onClick={() => router.push('/auth')}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
} 