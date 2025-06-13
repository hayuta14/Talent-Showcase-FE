import { Avatar, Box, Typography, Paper, Divider, Stack, CircularProgress, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { getUser } from '@/generated/api/endpoints/user/user';
import type { UserResponseDTO } from '@/generated/api/models';

export default function ProfileCard() {
  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const api = getUser();
        const res = await api.getApiV1UserGetProfile();
        setProfile(res.data || null);
      } catch (err: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return null;

  return (
    <Paper className="p-6 rounded-xl shadow flex flex-col items-center" elevation={2}>
      <Box className="w-full h-24 rounded-t-xl bg-gradient-to-r from-blue-400 to-pink-400 mb-[-40px]" />
      <Avatar
        src={profile.profilePictureUrl || undefined}
        alt={profile.username || profile.email || 'User'}
        sx={{ width: 80, height: 80, border: '4px solid white', marginTop: '-40px' }}
      >
        {!profile.profilePictureUrl && (profile.username?.[0] || profile.email?.[0] || 'U').toUpperCase()}
      </Avatar>
      <Typography variant="h6" className="mt-2 font-bold">{profile.username || 'No name'}</Typography>
      {profile.bio && (
        <Typography variant="body2" className="text-center mt-2 text-gray-500">
          {profile.bio}
        </Typography>
      )}
      <Divider className="my-4 w-full" />
      <Stack direction="row" spacing={4} className="w-full justify-center">
        <Box className="text-center">
          <Typography variant="subtitle1" className="font-bold">256</Typography>
          <Typography variant="caption" color="text.secondary">Post</Typography>
        </Box>
        <Box className="text-center">
          <Typography variant="subtitle1" className="font-bold">2.5K</Typography>
          <Typography variant="caption" color="text.secondary">Followers</Typography>
        </Box>
        <Box className="text-center">
          <Typography variant="subtitle1" className="font-bold">365</Typography>
          <Typography variant="caption" color="text.secondary">Following</Typography>
        </Box>
      </Stack>
    </Paper>
  );
} 