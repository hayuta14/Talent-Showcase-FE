'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  People as PeopleIcon, 
  PostAdd as PostIcon, 
  Category as CategoryIcon,
  TrendingUp as StatsIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import AdminUsers from './components/AdminUsers';
import AdminCategories from './components/AdminCategories';
import AdminStats from './components/AdminStats';
import AdminPosts from './components/AdminPosts';
import Grid from '@mui/material/Grid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [value, setValue] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCategories: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  
  const user = useAuthStore((s) => s.user);
  const isAcceptRole = useAuthStore((s) => s.isAcceptRole);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra quyền admin
    if (!user) {
      router.push('/auth');
      return;
    }

    if (!isAcceptRole([1])) { // Role 1 = Admin
      router.push('/');
      return;
    }

    // Load stats
    loadStats();
  }, [user, router, isAcceptRole]);

  const loadStats = async () => {
    try {
      // TODO: Implement API calls to get stats
      setStats({
        totalUsers: 150,
        totalPosts: 89,
        totalCategories: 12,
        activeUsers: 45
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!user || !isAcceptRole([1])) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Bạn không có quyền truy cập trang admin này.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminIcon color="primary" />
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý hệ thống Talent Showcase
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalUsers}
              </Typography>
              <Typography color="text.secondary">
                Tổng người dùng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PostIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalPosts}
              </Typography>
              <Typography color="text.secondary">
                Tổng bài đăng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CategoryIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalCategories}
              </Typography>
              <Typography color="text.secondary">
                Danh mục
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StatsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.activeUsers}
              </Typography>
              <Typography color="text.secondary">
                Người dùng hoạt động
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="admin tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Thống kê" />
          <Tab label="Quản lý người dùng" />
          <Tab label="Quản lý bài đăng" />
          <Tab label="Quản lý danh mục" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <AdminStats stats={stats} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <AdminUsers />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <AdminPosts />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <AdminCategories />
        </TabPanel>
      </Paper>
    </Container>
  );
} 