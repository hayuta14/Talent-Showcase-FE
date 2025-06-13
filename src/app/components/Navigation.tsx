'use client';

import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white' }} elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Talent Showcase
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            href="/talents"
            sx={{ fontWeight: isActive('/talents') ? 'bold' : 'normal' }}
          >
            Discover
          </Button>
          <Button
            color="inherit"
            component={Link}
            href="/profile"
            sx={{ fontWeight: isActive('/profile') ? 'bold' : 'normal' }}
          >
            Profile
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/auth"
            sx={{ fontWeight: isActive('/auth') ? 'bold' : 'normal' }}
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 