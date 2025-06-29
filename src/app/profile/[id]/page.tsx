'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Paper, Typography, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Stack, Tabs, Tab } from '@mui/material';
import { getUser } from '@/generated/api/endpoints/user/user';
import type { UserResponseDTO, UserProfileDTO } from '@/generated/api/models';
import { getMedia } from '@/generated/api/endpoints/media/media';
import { getPost } from '@/generated/api/endpoints/post/post';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAuthStore } from '@/stores/authStore';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PublicIcon from '@mui/icons-material/Public';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { getCategory } from '@/generated/api/endpoints/category/category';
import type { TalentCategoryProfileDTO } from '@/generated/api/models/talentCategoryProfileDTO';
import { useParams } from 'next/navigation';
dayjs.extend(relativeTime);

export default function ProfileByIdPage() {
  const params = useParams();
  const userId = params.id ? parseInt(params.id as string) : null;
  
  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileEditData, setProfileEditData] = useState<UserProfileDTO>({ username: '', bio: '', talentCategories: [], imageUrl: '', contactInfo: '' });
  const [profileEditLoading, setProfileEditLoading] = useState(false);
  const [profileEditError, setProfileEditError] = useState('');
  const [profileEditSuccess, setProfileEditSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [tab, setTab] = useState(0);
  const currentUsername = useAuthStore(s => s.user?.unique_name);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [sending, setSending] = useState(false);
  const [postEditPost, setPostEditPost] = useState<any>(null);
  const [postEditOpen, setPostEditOpen] = useState(false);
  const [postEditLoading, setPostEditLoading] = useState(false);
  const [postEditError, setPostEditError] = useState('');
  const [allCategories, setAllCategories] = useState<{id:number, name:string}[]>([]);

  // Fetch profile by ID
  useEffect(() => {
    if (!userId) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const api = getUser();
        const res = await api.getApiV1UserGetProfileUserId(userId);
        setProfile(res.data || null);
      } catch (err: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // Fetch user's posts after profile is loaded
  useEffect(() => {
    if (!profile?.username) return;
    const fetchPosts = async () => {
      setPostsLoading(true);
      setPostsError('');
      try {
        const api = getPost();
        const res = await api.getApiV1Post({ page: 1, pageSize: 100 });
        let allPosts: any[] = [];
        if (Array.isArray(res.data)) allPosts = res.data;
        else if (res.data && typeof res.data === 'object' && Array.isArray((res.data as any).items)) allPosts = (res.data as any).items;
        setPosts(allPosts.filter(p => p.username === profile.username));
      } catch (err) {
        setPostsError('Failed to load posts');
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, [profile?.username]);

  // Fetch all talent categories for skill select
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const api = getCategory();
        const res = await api.getApiV1Category();
        let cats = Array.isArray(res.data) ? res.data : (res.data && Array.isArray((res.data as any).items) ? (res.data as any).items : []);
        setAllCategories(cats);
      } catch {}
    };
    fetchCategories();
  }, []);

  // Open profile edit dialog and fill form
  const handleProfileEditOpen = () => {
    setProfileEditError('');
    setProfileEditSuccess('');
    setProfileEditData({
      username: profile?.username || '',
      bio: profile?.bio || '',
      talentCategories: profile?.talentCategories || [],
      imageUrl: profile?.profilePictureUrl || '',
      contactInfo: profile?.contactInfo || '',
    });
    setProfileEditOpen(true);
  };
  
  const handleProfileEditClose = () => {
    setProfileEditOpen(false);
  };
  
  // Handle profile edit form submit
  const handleProfileEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileEditLoading(true);
    setProfileEditError('');
    setProfileEditSuccess('');
    try {
      const api = getUser();
      await api.patchApiV1UserCreateProfile(profileEditData);
      setProfileEditSuccess('Profile updated!');
      // Reload profile
      if (userId) {
        const res = await api.getApiV1UserGetProfileUserId(userId);
        setProfile(res.data || null);
      }
      setProfileEditOpen(false);
    } catch (err: any) {
      setProfileEditError('Failed to update profile');
    } finally {
      setProfileEditLoading(false);
    }
  };

  // Handle profile image upload
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const api = getMedia();
      const res = await api.postApiMediaUploadImage({ file });
      const url = (res as any)?.url || (res as any)?.data?.url || '';
      if (url) {
        setProfileEditData(d => ({ ...d, imageUrl: url }));
      } else {
        setUploadError('No image URL returned from server');
      }
    } catch (err: any) {
      setUploadError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: number) => {
    setAnchorEl(event.currentTarget);
    setMenuPostId(postId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPostId(null);
  };
  
  const handleDelete = async () => {
    if (!menuPostId) return;
    setDeleting(true);
    try {
      const api = getPost();
      await api.deleteApiV1PostId(menuPostId);
      setPosts((prev: any[]) => prev.filter(p => p.id !== menuPostId));
      handleMenuClose();
    } catch {
      // Optionally show error
    } finally {
      setDeleting(false);
    }
  };
  
  const handleLike = async (postId: number, liked: boolean) => {
    try {
      const api = getPost();
      await api.postApiV1PostLike({ postId });
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                likeCount: liked ? (p.likeCount || 1) - 1 : (p.likeCount || 0) + 1,
                likedByCurrentUser: !liked,
              }
            : p
        )
      );
    } catch (e) {
      // handle error
    }
  };

  // Comment handlers
  const handleOpenComments = async (postId: number) => {
    setCommentOpen(true);
    setCommentLoading(true);
    setCommentPostId(postId);
    try {
      const api = getPost();
      const res = await api.getApiV1PostPostIdComments(postId);
      let newComments: any[] = [];
      if (res.data && typeof res.data === 'object' && Array.isArray((res.data as any).comments)) {
        newComments = (res.data as any).comments;
      }
      setComments(newComments);
    } finally {
      setCommentLoading(false);
    }
  };
  
  const handleCloseComments = () => {
    setCommentOpen(false);
    setComments([]);
    setCommentPostId(null);
  };
  
  const handleSendComment = async () => {
    if (!commentInput.trim() || !commentPostId) return;
    setSending(true);
    try {
      const api = getPost();
      await api.postApiV1PostComment({ postId: commentPostId, content: commentInput });
      // Reload comments
      const res = await api.getApiV1PostPostIdComments(commentPostId);
      let newComments: any[] = [];
      if (res.data && typeof res.data === 'object' && Array.isArray((res.data as any).comments)) {
        newComments = (res.data as any).comments;
      }
      setComments(newComments);
      setCommentInput('');
      // Update commentCount for the post in posts
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === commentPostId
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      ));
    } finally {
      setSending(false);
    }
  };
  
  // Edit post handlers
  const handleEdit = () => {
    const post = posts.find(p => p.id === menuPostId);
    setPostEditPost(post);
    setPostEditOpen(true);
    handleMenuClose();
  };
  
  const handlePostVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const api = getMedia();
      const res = await api.postApiMediaUploadVideo({ file });
      const url = (res as any)?.url || (res as any)?.data?.url || '';
      if (url) setPostEditPost((prev: any) => ({ ...prev, videoUrl: url }));
      else setUploadError('No video URL returned');
    } catch {
      setUploadError('Upload video failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Box className="flex justify-center items-center min-h-[300px]"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return null;

  return (
    <Container maxWidth="lg" className="py-0 px-0">
      {/* Cover section */}
      <Box className="relative w-full h-56 md:h-72 bg-gradient-to-r from-blue-400 to-purple-500">
        {/* Avatar overlay */}
        <Box className="absolute left-1/2 -bottom-16 md:-bottom-20 transform -translate-x-1/2 md:translate-x-0 md:left-16 z-10">
          <Avatar
            src={profile.profilePictureUrl || undefined}
            alt={profile.username || profile.email || 'User'}
            sx={{ width: { xs: 120, md: 160 }, height: { xs: 120, md: 160 }, border: '6px solid white', boxShadow: 3 }}
            className="bg-white"
          >
            {!profile.profilePictureUrl && (profile.username?.[0] || profile.email?.[0] || 'U').toUpperCase()}
          </Avatar>
        </Box>
      </Box>
      
      {/* Info + Edit + Tabs */}
      <Box className="flex flex-col md:flex-row md:items-end md:justify-between px-4 md:px-16 mt-20 md:mt-8">
        <Box className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
          <Box className="md:ml-44 text-center md:text-left">
            <Typography variant="h4" className="font-bold mb-1">{profile.username || 'No name'}</Typography>
            <Typography variant="body1" color="text.secondary" className="mb-1">{profile.email}</Typography>
            <Typography variant="body2" className="text-gray-600 mb-2">{profile.bio}</Typography>
          </Box>
        </Box>
        {/* Only show edit button if this is the current user's profile */}
        {profile.username === currentUsername && (
          <Button variant="contained" color="primary" onClick={handleProfileEditOpen} className="mt-4 md:mt-0 w-full md:w-auto">Chỉnh sửa trang cá nhân</Button>
        )}
      </Box>
      
      {/* Tabs */}
      <Box className="mt-6 md:mt-8 px-4 md:px-16 border-b border-gray-200">
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Bài viết" />
        </Tabs>
      </Box>
      
      {/* Main content: 2 columns on desktop, 1 column on mobile */}
      <Box className="flex flex-col md:flex-row gap-8 px-4 md:px-16 mt-8">
        {/* Left: Info */}
        <Box className="md:w-1/3 w-full mb-8 md:mb-0">
          <Paper elevation={2} className="p-6 rounded-2xl bg-white shadow-lg">
            <Typography variant="h6" className="font-bold mb-4">Giới thiệu</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Kỹ năng</Typography>
                <Typography variant="body1">
                  {profile.talentCategories && profile.talentCategories.length > 0
                    ? profile.talentCategories.map(s => `${s.name} (${s.level})`).join(', ')
                    : '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Liên hệ</Typography>
                <Typography variant="body1">{profile.contactInfo || '-'}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
        
        {/* Right: Posts */}
        <Box className="md:w-2/3 w-full">
          {tab === 0 && (
            <>
              <Typography variant="h6" className="font-bold mb-4">Bài viết</Typography>
              {postsLoading ? (
                <Box className="flex justify-center items-center min-h-[100px]"><CircularProgress /></Box>
              ) : postsError ? (
                <Alert severity="error">{postsError}</Alert>
              ) : posts.length === 0 ? (
                <Typography color="text.secondary" className="text-center">Chưa có bài viết nào.</Typography>
              ) : (
                <Stack spacing={3}>
                  {posts.map(post => (
                    <Paper key={post.id} elevation={2} className="p-4 rounded-xl relative">
                      <Box className="flex items-center mb-2">
                        <Avatar src={profile.profilePictureUrl || undefined} sx={{ width: 40, height: 40, mr: 2 }}>
                          {!profile.profilePictureUrl && (profile.username?.[0] || profile.email?.[0] || 'U').toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" className="font-bold">{profile.username}</Typography>
                          <Typography variant="caption" color="text.secondary">{dayjs(post.createdAt || post.uploadedAt).fromNow()}</Typography>
                        </Box>
                        {/* 3-dot menu for post owner */}
                        {post.username === currentUsername && (
                          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                            <IconButton size="small" onClick={e => handleMenuOpen(e, post.id)}>
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      <Typography variant="body1" className="mb-2">{post.description}</Typography>
                      {post.videoUrl && (
                        <Box className="mb-2">
                          <video src={post.videoUrl} controls style={{ maxWidth: '100%', borderRadius: 8 }} />
                        </Box>
                      )}
                      {/* Like, Comment, Share actions */}
                      <Box className="flex items-center gap-4 mt-2">
                        <IconButton size="small" onClick={() => handleLike(post.id, !!post.likedByCurrentUser)}>
                          <FavoriteBorderIcon color={post.likedByCurrentUser ? 'error' : 'inherit'} />
                        </IconButton>
                        <span>{post.likeCount || 0}</span>
                        <IconButton size="small" onClick={() => handleOpenComments(post.id)}>
                          <ChatBubbleOutlineIcon />
                        </IconButton>
                        <span>{post.commentCount ?? 0}</span>
                        <IconButton size="small">
                          <ShareIcon />
                        </IconButton>
                        <span>{post.shareCount ?? 0}</span>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
              {/* 3-dot menu */}
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>
      
      {/* Profile Edit Dialog */}
      <Dialog open={profileEditOpen} onClose={handleProfileEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <form onSubmit={handleProfileEditSubmit}>
          <DialogContent className="space-y-4">
            {profileEditError && <Alert severity="error">{profileEditError}</Alert>}
            {profileEditSuccess && <Alert severity="success">{profileEditSuccess}</Alert>}
            <Box className="flex flex-col items-center gap-2">
              <Avatar
                src={profileEditData.imageUrl || undefined}
                alt="Preview"
                sx={{ width: 80, height: 80, mb: 1 }}
              >
                {!profileEditData.imageUrl && (profile?.username?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
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
                  onChange={handleProfileImageChange}
                />
              </Button>
              {uploadError && <Typography color="error">{uploadError}</Typography>}
            </Box>
            <TextField
              label="Bio"
              fullWidth
              multiline
              minRows={2}
              value={profileEditData.bio}
              onChange={e => setProfileEditData(d => ({ ...d, bio: e.target.value }))}
            />
            {/* Skill (Talent Categories) */}
            <Box>
              <Typography fontWeight="bold" mb={1}>Kỹ năng</Typography>
              {profileEditData.talentCategories && profileEditData.talentCategories.length > 0 && profileEditData.talentCategories.map((item, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={2} mb={1}>
                  <TextField
                    select
                    label="Skill"
                    value={item.id || ''}
                    onChange={e => {
                      const id = Number(e.target.value);
                      const name = allCategories.find(c => c.id === id)?.name || '';
                      setProfileEditData(d => {
                        const arr = [...(d.talentCategories || [])];
                        arr[idx] = { ...arr[idx], id, name };
                        return { ...d, talentCategories: arr };
                      });
                    }}
                    sx={{ minWidth: 140 }}
                  >
                    {allCategories.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Level"
                    value={item.level || ''}
                    onChange={e => {
                      setProfileEditData(d => {
                        const arr = [...(d.talentCategories || [])];
                        arr[idx] = { ...arr[idx], level: e.target.value };
                        return { ...d, talentCategories: arr };
                      });
                    }}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="Fresher">Fresher</MenuItem>
                    <MenuItem value="Junior">Junior</MenuItem>
                    <MenuItem value="Middle">Middle</MenuItem>
                    <MenuItem value="Senior">Senior</MenuItem>
                  </TextField>
                  <Button color="error" onClick={() => {
                    setProfileEditData(d => ({
                      ...d,
                      talentCategories: (d.talentCategories || []).filter((_, i) => i !== idx)
                    }));
                  }}>Xóa</Button>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setProfileEditData(d => ({
                    ...d,
                    talentCategories: [...(d.talentCategories || []), { id: allCategories[0]?.id, name: allCategories[0]?.name, level: 'Fresher' }]
                  }));
                }}
                disabled={allCategories.length === 0}
              >Thêm kỹ năng</Button>
            </Box>
            <TextField
              label="Contact Info"
              fullWidth
              value={profileEditData.contactInfo}
              onChange={e => setProfileEditData(d => ({ ...d, contactInfo: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleProfileEditClose} color="secondary">Cancel</Button>
            <Button type="submit" color="primary" variant="contained" disabled={profileEditLoading}>{profileEditLoading ? 'Saving...' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Edit Post Dialog */}
      <Dialog open={postEditOpen} onClose={() => setPostEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          {postEditError && <Alert severity="error">{postEditError}</Alert>}
          <TextField
            label="Content"
            fullWidth
            multiline
            minRows={2}
            value={postEditPost?.description || ''}
            onChange={e => setPostEditPost({ ...postEditPost, description: e.target.value })}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<VideoLibraryIcon />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
              <input type="file" accept="video/*" hidden onChange={handlePostVideoChange} />
            </Button>
            {postEditPost?.videoUrl && (
              <video src={postEditPost.videoUrl} controls className="max-h-24 rounded ml-2" style={{ maxWidth: 120 }} />
            )}
          </Box>
          {uploadError && <Alert severity="error">{uploadError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPostEditOpen(false)} color="secondary">Cancel</Button>
          <Button
            onClick={async () => {
              setPostEditLoading(true);
              setPostEditError('');
              try {
                const api = getPost();
                await api.patchApiV1PostId(postEditPost.id, {
                  description: postEditPost.description,
                  categoryId: postEditPost.categoryId,
                  isPublic: postEditPost.isPublic,
                  videoUrl: postEditPost.videoUrl || '',
                });
                setPosts(prev => prev.map(p => p.id === postEditPost.id ? { ...p, ...postEditPost } : p));
                setPostEditOpen(false);
              } catch {
                setPostEditError('Failed to update post');
              } finally {
                setPostEditLoading(false);
              }
            }}
            color="primary"
            variant="contained"
            disabled={postEditLoading}
          >
            {postEditLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Comment Dialog */}
      <Dialog open={commentOpen} onClose={handleCloseComments} maxWidth="sm" fullWidth disableScrollLock={true}>
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          {commentLoading ? <CircularProgress /> : (
            <Stack spacing={2} sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {comments.length === 0 && <Typography color="text.secondary">No comments yet.</Typography>}
              {comments.map(comment => (
                <Box key={comment.id} display="flex" alignItems="flex-start" gap={2}>
                  <Avatar src={comment.userImageUrl || undefined} />
                  <Box>
                    <Typography fontWeight="bold">{comment.username}</Typography>
                    <Typography variant="body2" color="text.secondary">{comment.createdAt && dayjs(comment.createdAt).fromNow()}</Typography>
                    <Typography>{comment.content}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Avatar src={profile.profilePictureUrl || undefined} />
            <TextField
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              fullWidth
              size="small"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
              disabled={sending}
            />
            <Button onClick={handleSendComment} disabled={sending || !commentInput.trim()} variant="contained">Send</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
} 