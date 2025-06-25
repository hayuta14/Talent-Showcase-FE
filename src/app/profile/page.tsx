'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Paper, Typography, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Stack } from '@mui/material';
import { getUser } from '@/generated/api/endpoints/user/user';
import type { UserResponseDTO, UserProfileDTO } from '@/generated/api/models';
import { getMedia } from '@/generated/api/endpoints/media/media';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<UserProfileDTO>({ username: '', bio: '', skill: '', imageUrl: '', contactInfo: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch profile
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

  // Open edit dialog and fill form
  const handleEditOpen = () => {
    setEditError('');
    setEditSuccess('');
    setEditData({
      username: profile?.username || '',
      bio: profile?.bio || '',
      skill: profile?.skill || '',
      imageUrl: profile?.profilePictureUrl || '',
      contactInfo: profile?.contactInfo || '',
    });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const api = getUser();
      await api.patchApiV1UserCreateProfile(editData);
      setEditSuccess('Profile updated!');
      // Reload profile
      const res = await api.getApiV1UserGetProfile();
      setProfile(res.data || null);
      setEditOpen(false);
    } catch (err: any) {
      setEditError('Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const api = getMedia();
      const res = await api.postApiMediaUploadImage({ file });
      // Lấy đúng trường url từ response
      const url = (res as any)?.url || (res as any)?.data?.url || '';
      if (url) {
        setEditData(d => ({ ...d, imageUrl: url }));
      } else {
        setUploadError('No image URL returned from server');
      }
    } catch (err: any) {
      setUploadError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Box className="flex justify-center items-center min-h-[300px]"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return null;

  return (
    <Container maxWidth="md" className="py-8">
      <Box className="flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <Paper elevation={3} className="flex-1 p-8 rounded-2xl flex flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
          <Avatar
            src={profile.profilePictureUrl || undefined}
            alt={profile.username || profile.email || 'User'}
            sx={{ width: 120, height: 120, mb: 2, border: '4px solid white', boxShadow: 2 }}
          >
            {!profile.profilePictureUrl && (profile.username?.[0] || profile.email?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Typography variant="h4" className="font-bold mt-2 mb-1 text-center">{profile.username || 'No name'}</Typography>
          <Typography variant="body1" color="text.secondary" className="mb-2 text-center">{profile.email}</Typography>
          <Typography variant="body2" className="mb-4 text-center text-gray-600">{profile.bio}</Typography>
          <Button variant="outlined" color="primary" onClick={handleEditOpen} className="w-full mt-2">Edit Profile</Button>
        </Paper>
        {/* Details Card */}
        <Paper elevation={3} className="flex-1 p-8 rounded-2xl bg-white shadow-lg">
          <Typography variant="h5" className="font-bold mb-4">Details</Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Skill</Typography>
              <Typography variant="body1">{profile.skill || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Contact Info</Typography>
              <Typography variant="body1">{profile.contactInfo || '-'}</Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent className="space-y-4">
            {editError && <Alert severity="error">{editError}</Alert>}
            {editSuccess && <Alert severity="success">{editSuccess}</Alert>}
            <Box className="flex flex-col items-center gap-2">
              <Avatar
                src={editData.imageUrl || undefined}
                alt="Preview"
                sx={{ width: 80, height: 80, mb: 1 }}
              >
                {!editData.imageUrl && (profile.username?.[0] || profile.email?.[0] || 'U').toUpperCase()}
              </Avatar>
              <Button
                variant="outlined"
                component="label"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {uploadError && <Typography color="error">{uploadError}</Typography>}
            </Box>
            <TextField
              label="Bio"
              fullWidth
              multiline
              minRows={2}
              value={editData.bio}
              onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))}
            />
            <TextField
              label="Skill"
              fullWidth
              value={editData.skill}
              onChange={e => setEditData(d => ({ ...d, skill: e.target.value }))}
            />
            <TextField
              label="Username"
              fullWidth
              value={editData.username}
              onChange={e => setEditData(d => ({ ...d, username: e.target.value }))}
            />
            <TextField
              label="Contact Info"
              fullWidth
              value={editData.contactInfo}
              onChange={e => setEditData(d => ({ ...d, contactInfo: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose} color="secondary">Cancel</Button>
            <Button type="submit" color="primary" variant="contained" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}