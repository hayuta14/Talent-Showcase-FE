'use client';

import { AppBar, Toolbar, Button, Box, Typography, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Show popup if not logged in and not on /auth or /auth/register
  useEffect(() => {
    if (!user && pathname !== '/auth' && pathname !== '/auth/register') {
      setOpenDialog(true);
    } else {
      setOpenDialog(false);
    }
  }, [user, pathname]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSignOut = () => {
    clearTokens();
    setAnchorEl(null);
    router.push('/auth');
  };
  const handleDialogLogin = () => {
    setOpenDialog(false);
    router.push('/auth');
  };
  const handleDialogRegister = () => {
    setOpenDialog(false);
    router.push('/auth/register');
    // Optionally: set register tab via query or Zustand
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }} elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Talent Showcase
            </Link>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
            {user ? (
              <>
                <Button onClick={handleMenu} sx={{ textTransform: 'none', ml: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  {user.email || 'User'}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={() => { router.push('/profile'); handleClose(); }}>View Profile</MenuItem>
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push('/auth')}
                  sx={{ ml: 1 }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push('/auth/register')}
                  sx={{ ml: 1 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Need to login or register</DialogTitle>
        <DialogContent>
          <Typography>You must login or register to access this page.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogLogin} color="primary" variant="contained">Login</Button>
          <Button onClick={handleDialogRegister} color="primary" variant="outlined">Register</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 