'use client';

import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Person, 
  Visibility,
  ThumbUp,
  Comment
} from '@mui/icons-material';

interface StatsProps {
  stats: {
    totalUsers: number;
    totalPosts: number;
    totalCategories: number;
    activeUsers: number;
  };
}

export default function AdminStats({ stats }: StatsProps) {
  const recentActivities = [
    { id: 1, action: 'Người dùng mới đăng ký', user: 'user@example.com', time: '2 phút trước' },
    { id: 2, action: 'Bài đăng mới được tạo', user: 'talent@example.com', time: '5 phút trước' },
    { id: 3, action: 'Danh mục mới được thêm', user: 'admin@example.com', time: '10 phút trước' },
    { id: 4, action: 'Người dùng bị khóa', user: 'spam@example.com', time: '15 phút trước' },
  ];

  const growthData = [
    { label: 'Người dùng mới', value: 25, target: 100, color: 'primary' },
    { label: 'Bài đăng mới', value: 15, target: 50, color: 'secondary' },
    { label: 'Tương tác', value: 80, target: 100, color: 'success' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Thống kê chi tiết
      </Typography>
      
      <Grid container spacing={3}>
        {/* Growth Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tăng trưởng tuần này
              </Typography>
              {growthData.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.value}/{item.target}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.value / item.target) * 100}
                    color={item.color as any}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hoạt động gần đây
              </Typography>
              <List dense>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Person fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.user} • ${activity.time}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê nhanh
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Visibility color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">1,234</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lượt xem hôm nay
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <ThumbUp color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">567</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lượt thích hôm nay
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Comment color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">89</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bình luận hôm nay
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <TrendingUp color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">+12%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tăng trưởng tuần
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 