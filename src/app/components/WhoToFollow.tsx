import { Avatar, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getFollower } from '@/generated/api/endpoints/follower/follower';
import type { UserSuggestionDTO } from '@/generated/api/models/userSuggestionDTO';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';

export default function WhoToFollow() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<UserSuggestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError('');
      try {
        const api = getFollower();
        const res = await api.getApiV1FollowerSuggested({ topN: 5 });
        setSuggestions(res);
      } catch {
        setError('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleToggleFollow = async (userId: number) => {
    setFollowLoading(userId);
    try {
      const api = getFollower();
      await api.postApiV1FollowerToggleFollowedId(userId);
      // Cập nhật lại UI: có thể fetch lại hoặc toggle trạng thái
      setSuggestions(sugs => sugs.map(u => u.userId === userId ? { ...u, followed: !u.followed } : u));
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUserClick = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <Paper className="p-4 rounded-xl shadow">
      <Typography variant="h6" className="mb-4 font-bold">Who to follow</Typography>
      {loading ? <Box className="flex justify-center"><CircularProgress size={24} /></Box> : error ? <Typography color="error">{error}</Typography> : (
        <Stack spacing={2}>
          {suggestions.map((user) => (
            <Stack direction="row" spacing={2} alignItems="center" key={user.userId}>
              <Avatar 
                src={user.profilePictureUrl || undefined} 
                sx={{ cursor: 'pointer' }}
                onClick={() => handleUserClick(user.userId!)}
              />
              <Box className="flex-1">
                <Typography 
                  variant="subtitle2" 
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => handleUserClick(user.userId!)}
                >
                  {user.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.talentCategories?.map(tc => tc.name + (tc.level ? ` (${tc.level})` : '')).join(', ')}
                </Typography>
                <Typography variant="caption" color="text.secondary" ml={1}>
                  {user.followerCount ?? 0} followers
                </Typography>
              </Box>
              <Button
                variant={user.followed ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                disabled={followLoading === user.userId}
                onClick={() => handleToggleFollow(user.userId!)}
              >
                {followLoading === user.userId ? <CircularProgress size={16} /> : user.followed ? <span>&#10003; Following</span> : '+ Follow'}
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
      <Button fullWidth className="mt-4" size="small" variant="text">View more</Button>
    </Paper>
  );
} 