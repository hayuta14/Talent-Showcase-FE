'use client';

import { AppBar, Toolbar, Button, Box, Typography, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Collapse } from '@mui/material';
import { InputAdornment } from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useState, useEffect } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Badge from '@mui/material/Badge';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navQuery, setNavQuery] = useState('');

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

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleNavSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (navQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(navQuery.trim())}`);
    }
  };

  const isActive = (path: string) => pathname === path;

  // Thêm các mục menu
  const navItems = [
    { label: 'Home', icon: <HomeIcon />, href: '/', badge: 1 },
    { label: 'Group', icon: <PeopleIcon />, href: '/groups' },
    { label: 'Jobs', icon: <WorkIcon />, href: '/jobs' },
    { label: 'Notifications', icon: <NotificationsIcon />, href: '/notifications', badge: 16 },
  ];

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }} elevation={1} component="div">
        <Toolbar sx={{ minHeight: 64, px: { xs: 1, md: 4 } }}>
          {/* Logo ngoài cùng bên trái */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 2, md: 4 }, flexShrink: 0 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ fontWeight: 700, fontSize: 22, letterSpacing: 1, color: '#0a66c2', fontFamily: 'inherit' }}>
                Talent Showcase
              </Box>
            </Link>
          </Box>
          {/* Menu icon giữa */}
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 5 }, alignItems: 'flex-end', flex: 1, justifyContent: 'center', height: 64 }}>
            {navItems.map((item, idx) => (
              <Box key={item.label} className="nav-item-box" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 68, justifyContent: 'flex-end', height: 64 }}>
                <Badge badgeContent={item.badge} color="error" invisible={!item.badge} sx={{ mb: 0.2, '& .MuiBadge-badge': { top: 6, right: 6 } }}>
                  <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <Button
                      color="inherit"
                      sx={{
                        minWidth: 0,
                        p: 0,
                        bgcolor: 'transparent',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'color 0.15s, background 0.15s',
                        '&:hover': { bgcolor: 'rgba(10,102,194,0.10)' },
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Box sx={{
                        fontSize: 32,
                        color: isActive(item.href) ? '#0a66c2' : '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.15s',
                        '&:hover': { color: '#0a66c2' },
                        mb: 0.2,
                      }}>
                        {item.icon}
                      </Box>
                    </Button>
                  </Link>
                </Badge>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 12,
                    color: isActive(item.href) ? '#0a66c2' : '#666',
                    fontWeight: isActive(item.href) ? 'bold' : 'normal',
                    mt: 0.2,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
            {/* Me (avatar) */}
            {user && (
              <Box className="nav-item-box" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 68, justifyContent: 'flex-end', height: 64 }}>
                <Button onClick={handleMenu} sx={{ minWidth: 0, p: 0, bgcolor: 'transparent', borderRadius: '50%', '&:hover': { bgcolor: 'rgba(10,102,194,0.10)' }, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Avatar sx={{ width: 34, height: 34, boxShadow: 2, border: '2px solid #fff', mb: '15px', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }} src={user.userImageUrl || undefined} />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={() => { router.push('/profile'); handleClose(); }}>My Profile</MenuItem>
                  <MenuItem onClick={() => { router.push('/my-communities'); handleClose(); }}>My Communities</MenuItem>
                  <MenuItem onClick={() => { router.push('/job-applied'); handleClose(); }}>Jobs Applied</MenuItem>
                  <MenuItem onClick={handleSignOut}>Logout</MenuItem>
                </Menu>
              </Box>
            )}
          </Box>

          <form onSubmit={handleNavSearch} style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={navQuery}
              onChange={e => setNavQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" size="small">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ width: 180, background: '#fff', borderRadius: 2 }}
            />
          </form>
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
      <Collapse in={searchOpen}>
        <Box sx={{ 
          bgcolor: 'white', 
          borderTop: '1px solid #e0e0e0',
          px: { xs: 2, md: 4 },
          py: 2
        }}>
          <form onSubmit={handleSearchSubmit}>
            <TextField
              placeholder="Search for people, jobs, communities..."
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                endAdornment: searchQuery && (
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchQuery('')}
                    sx={{ color: 'text.secondary' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ),
                sx: {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0a66c2',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0a66c2',
                  },
                }
              }}
            />
          </form>
        </Box>
      </Collapse>
    </>
  );
} 