"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { Box, Paper, Typography, Button, Stack, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Chip, Alert, CircularProgress, TextField, Tabs, Tab, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import MessageIcon from '@mui/icons-material/Message';
import EventIcon from '@mui/icons-material/Event';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { useAuthStore } from '@/stores/authStore';
import { getCommunity } from '@/generated/api/endpoints/community/community';
import { getPost } from '@/generated/api/endpoints/post/post';
import { getMedia } from '@/generated/api/endpoints/media/media';
import { getCategory } from '@/generated/api/endpoints/category/category';
import type { CommunityDetailResponseDTO } from '@/generated/api/models/communityDetailResponseDTO';
import type { CommunityMemberDTO } from '@/generated/api/models/communityMemberDTO';
import type { PostResponseDTO } from '@/generated/api/models/postResponseDTO';
import type { PostDTO } from '@/generated/api/models/postDTO';
import type { CategoryResponseDTO } from '@/generated/api/models/categoryResponseDTO';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<CommunityDetailResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [joinLoading, setJoinLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  
  // Posts state
  const [posts, setPosts] = useState<PostResponseDTO[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  
  // Comments state
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  
  // Reply functionality state
  const [replyOpenCommentId, setReplyOpenCommentId] = useState<number | null>(null);
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Video upload state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Category state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  
  const currentUser = useAuthStore(s => s.user);

  // Fetch community detail from API
  const fetchCommunityDetail = async () => {
    setLoading(true);
    setError('');
    
    try {
      const api = getCommunity();
      const res = await api.getApiV1CommunityCommunityIdDetail(parseInt(groupId));
      
      if (res.data) {
        setGroup(res.data);
      } else {
        setError('Community not found');
      }
    } catch (err: any) {
      setError('Failed to load community details');
      console.error('Failed to fetch community details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch community detail when component mounts
  useEffect(() => {
    if (groupId) {
      fetchCommunityDetail();
    }
  }, [groupId]);

  // Fetch posts when posts tab is selected
  useEffect(() => {
    if (activeTab === 0 && group) {
      fetchPosts();
    }
  }, [activeTab, group]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const api = getCategory();
      const res = await api.getApiV1Category();
      let cats = Array.isArray(res.data) ? res.data : (res.data && Array.isArray((res.data as any).items) ? (res.data as any).items : []);
      setCategories(cats);
      // Set default categoryId to first category if available
      if (cats.length > 0) {
        setSelectedCategoryId(cats[0].id || 1);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Handle join community
  const handleJoinCommunity = async () => {
    if (!group?.communityId) return;
    
    setJoinLoading(true);
    try {
      const api = getCommunity();
      await api.postApiV1CommunityJoin({ communityId: group.communityId });
      
      // Update local state
      setGroup(prev => prev ? {
        ...prev,
        isMember: true,
        memberCount: (prev.memberCount || 0) + 1
      } : null);
    } catch (err: any) {
      console.error('Failed to join community:', err);
    } finally {
      setJoinLoading(false);
    }
  };

  // Handle leave community
  const handleLeaveCommunity = async () => {
    if (!group?.communityId) return;
    
    // Check if user is the creator of the community
    if (group.userRole === 'Admin' || group.userRole === 'Creator') {
      alert('Community creators cannot leave their own communities. Please transfer ownership or delete the community instead.');
      return;
    }
    
    setLeaveLoading(true);
    try {
      const api = getCommunity();
      await api.deleteApiV1CommunityCommunityIdLeave(group.communityId);
      
      // Redirect to communities page after successfully leaving
      router.push('/groups');
    } catch (err: any) {
      console.error('Failed to leave community:', err);
      // If leave fails, don't redirect
    } finally {
      setLeaveLoading(false);
    }
  };

  // Fetch posts for community
  const fetchPosts = async () => {
    if (!group?.communityId) return;
    
    setPostsLoading(true);
    try {
      const api = getPost();
      const res = await api.getApiV1PostCommunityCommunityId(group.communityId, { page: 1, pageSize: 50 });
      
      if (res.data) {
        setPosts(res.data);
      } else {
        setPosts([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch community posts:', err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Handle create post
  const handleCreatePost = async () => {
    const trimmedPost = newPost.trim();
    if (!trimmedPost || !group?.communityId) return;
    
    // Validate post length (assuming max 1000 characters)
    if (trimmedPost.length > 1000) {
      alert('Post content is too long. Please keep it under 1000 characters.');
      return;
    }
    
    setPosting(true);
    try {
      const api = getPost();
      const postData: PostDTO = {
        description: trimmedPost,
        isPublic: true,
        categoryId: selectedCategoryId,
        videoUrl: videoUrl
      };
      
      const res = await api.postApiV1PostCommunityCommunityId(group.communityId, postData);
      
      if (res.data) {
        setNewPost('');
        setVideoUrl(null);
        setSelectedCategoryId(categories[0]?.id || 1);
        // Refresh posts
        await fetchPosts();
      }
    } catch (err: any) {
      console.error('Failed to create community post:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  // Handle like post
  const handleLikePost = async (postId: number, liked: boolean) => {
    try {
      const api = getPost();
      await api.postApiV1PostLike({ postId });
      
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                likeCount: liked ? (post.likeCount || 1) - 1 : (post.likeCount || 0) + 1,
                likedByCurrentUser: !liked,
              }
            : post
        )
      );
    } catch (err: any) {
      console.error('Failed to like post:', err);
    }
  };

  // Handle open comments
  const handleOpenComments = async (postId: number) => {
    setCommentDialogOpen(true);
    setCommentLoading(true);
    setCommentPostId(postId);
    setCommentInput('');
    
    try {
      const api = getPost();
      const res = await api.getApiV1PostPostIdComments(postId);
      
      let newComments: any[] = [];
      if (res.data && typeof res.data === 'object' && Array.isArray((res.data as any).comments)) {
        newComments = (res.data as any).comments;
      }
      setComments(newComments);
    } catch (err: any) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle close comments
  const handleCloseComments = () => {
    setCommentDialogOpen(false);
    setComments([]);
    setCommentPostId(null);
    setCommentInput('');
  };

  // Handle send comment
  const handleSendComment = async () => {
    if (!commentInput.trim() || !commentPostId) return;
    
    setSendingComment(true);
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
      
      // Update comment count for the post
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === commentPostId
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      ));
    } catch (err: any) {
      console.error('Failed to send comment:', err);
    } finally {
      setSendingComment(false);
    }
  };

  // Handle reply to comment
  const handleReplyToComment = async (commentId: number, replyContent: string) => {
    try {
      const api = getPost();
      await api.postApiV1PostCommentCommentIdSubComment(commentId, replyContent);
      
      // Reload comments to show the new reply
      if (commentPostId) {
        const res = await api.getApiV1PostPostIdComments(commentPostId);
        let newComments: any[] = [];
        if (res.data && typeof res.data === 'object' && Array.isArray((res.data as any).comments)) {
          newComments = (res.data as any).comments;
        }
        setComments(newComments);
      }
    } catch (err: any) {
      console.error('Failed to send reply:', err);
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!menuPostId || !group?.communityId) return;
    
    setDeleting(true);
    try {
      const api = getPost();
      await api.deleteApiV1PostCommunityCommunityIdPostId(group.communityId, menuPostId);
      
      // Remove post from local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== menuPostId));
      setMenuAnchorEl(null);
      setMenuPostId(null);
    } catch (err: any) {
      console.error('Failed to delete community post:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuPostId(postId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuPostId(null);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle video upload
  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setUploadError('');
    try {
      const api = getMedia();
      const res = await api.postApiMediaUploadVideo({ file });
      const url = (res as any)?.url || (res as any)?.data?.url || '';
      if (url) {
        setVideoUrl(url);
      } else {
        setUploadError('No video URL returned');
      }
    } catch (err: any) {
      console.error('Failed to upload video:', err);
      setUploadError('Upload video failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  // Remove video
  const handleRemoveVideo = () => {
    setVideoUrl(null);
    setUploadError('');
  };

  useEffect(() => {
    fetchCommunityDetail();
    fetchCategories();
  }, [params.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !group) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">{error || 'Community not found'}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 80px)', 
      bgcolor: '#f4f6f8', 
      p: { xs: 2, md: 4 } 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.back()}
          sx={{ mb: 3 }}
        >
          Back to Communities
        </Button>

        <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#0a66c2'
              }}
            >
              <GroupIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                {group.name || 'Unnamed Community'}
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                {group.description || 'No description available'}
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {group.memberCount?.toLocaleString() || 0} members
                  </Typography>
                </Box>
                
                {group.userRole && (
                  <Chip 
                    label={group.userRole} 
                    size="small" 
                    variant="outlined"
                  />
                )}
                
                <Typography variant="body2" color="text.secondary">
                  Created {formatDate(group.createdAt)}
                </Typography>
              </Stack>
            </Box>
            
            <Button
              variant={group.isMember ? "outlined" : "contained"}
              color={group.isMember ? "error" : "primary"}
              size="large"
              onClick={group.isMember ? handleLeaveCommunity : handleJoinCommunity}
              disabled={joinLoading || leaveLoading}
              startIcon={(joinLoading || leaveLoading) ? <CircularProgress size={20} /> : null}
              sx={{
                display: (group.isMember && group.userRole === 'creator') ? 'none' : 'inline-flex'
              }}
            >
              {joinLoading ? 'Joining...' :
               leaveLoading ? 'Leaving...' :
               group.isMember ? 'Leave Community' : 'Join Community'}
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Posts" />
            <Tab label="Members" />
            <Tab label="About" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Community Posts
                </Typography>
                
                {/* Create Post Section */}
                {group?.isMember && (
                  <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Share something with the community..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        disabled={posting}
                        inputProps={{ maxLength: 1000 }}
                        helperText={`${newPost.length}/1000 characters`}
                        error={newPost.length > 1000}
                      />
                      
                      {/* Video Upload Section */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<VideoLibraryIcon />}
                          disabled={posting || uploading}
                          size="small"
                        >
                          {uploading ? 'Uploading...' : 'Upload Video'}
                          <input 
                            type="file" 
                            accept="video/*" 
                            hidden 
                            onChange={handleVideoChange}
                            disabled={posting || uploading}
                          />
                        </Button>
                        
                        {videoUrl && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleRemoveVideo}
                            disabled={posting}
                          >
                            Remove Video
                          </Button>
                        )}
                        
                        {uploading && <CircularProgress size={20} />}
                      </Box>
                      
                      {uploadError && (
                        <Alert severity="error" sx={{ py: 0 }}>
                          {uploadError}
                        </Alert>
                      )}
                      
                      {videoUrl && (
                        <Box>
                          <video 
                            src={videoUrl} 
                            controls 
                            style={{ width: '100%', maxHeight: 200, borderRadius: 8 }}
                          />
                        </Box>
                      )}
                      
                      {/* Category Selection */}
                      <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={selectedCategoryId}
                          onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                          label="Category"
                          disabled={posting}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {newPost.length > 1000 ? 'Post is too long' : 'Share your thoughts with the community'}
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={handleCreatePost}
                          disabled={posting || !newPost.trim() || newPost.length > 1000 || uploading}
                          startIcon={posting ? <CircularProgress size={16} /> : <SendIcon />}
                        >
                          {posting ? 'Posting...' : 'Post'}
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                )}
                
                {/* Posts List */}
                {postsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : posts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No posts yet</Typography>
                    {!group?.isMember && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Join the community to see and create posts
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {posts.map((post) => (
                      <Paper key={post.id} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar src={post.userImageUrl || undefined} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {post.username || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {post.uploadedAt ? dayjs(post.uploadedAt).fromNow() : ''}
                            </Typography>
                          </Box>
                          
                          {/* Post menu for post owner */}
                          {post.userId === Number(currentUser?.nameid) && (
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, post.id || 0)}>
                              <MoreVertIcon />
                            </IconButton>
                          )}
                        </Stack>
                        
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {post.description}
                        </Typography>
                        
                        {post.videoUrl && (
                          <Box sx={{ mb: 2 }}>
                            <video 
                              src={post.videoUrl} 
                              controls 
                              style={{ width: '100%', maxHeight: 300, borderRadius: 8 }}
                            />
                          </Box>
                        )}
                        
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Button
                            size="small"
                            startIcon={post.likedByCurrentUser ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                            onClick={() => handleLikePost(post.id || 0, post.likedByCurrentUser || false)}
                            sx={{ color: post.likedByCurrentUser ? 'error.main' : 'inherit' }}
                          >
                            {post.likeCount || 0} Like{(post.likeCount || 0) !== 1 ? 's' : ''}
                          </Button>
                          
                          <Button
                            size="small"
                            startIcon={<ChatBubbleOutlineIcon />}
                            onClick={() => handleOpenComments(post.id || 0)}
                          >
                            {post.commentCount || 0} Comment{(post.commentCount || 0) !== 1 ? 's' : ''}
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Community Members ({group?.members?.length || 0})
                </Typography>
                
                {group?.members && group.members.length > 0 ? (
                  <List>
                    {group.members.map((member, index) => (
                      <ListItem key={member.userId || index} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar 
                            src={member.profilePictureUrl || undefined}
                            sx={{ width: 48, height: 48 }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {member.username || 'Unknown User'}
                              </Typography>
                              {member.role && (
                                <Chip 
                                  label={member.role} 
                                  size="small" 
                                  color={member.role === 'Admin' ? 'error' : 
                                         member.role === 'Moderator' ? 'warning' : 'default'}
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              Joined {formatDate(member.joinedAt)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No members found</Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  About This Community
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {group?.description || 'No description available for this community.'}
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                      Community Info
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Created by: {group?.creatorName || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Created on: {formatDate(group?.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Total members: {group?.memberCount || 0}
                    </Typography>
                    {group?.userRole && (
                      <Typography variant="body2" color="text.secondary">
                        • Your role: {group.userRole}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Post Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={handleDeletePost}
          disabled={deleting}
          sx={{ color: 'error.main' }}
        >
          {deleting ? 'Deleting...' : 'Delete Post'}
        </MenuItem>
      </Menu>

      {/* Comments Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={handleCloseComments}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          {commentLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2} sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {comments.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No comments yet.
                </Typography>
              )}
              {comments.map(comment => (
                <Box
                  key={comment.id}
                  sx={{
                    position: 'relative',
                    bgcolor: '#fff',
                    borderRadius: 3,
                    p: 1.5,
                    mb: 1,
                    border: '1px solid #e0e0e0',
                    '&:hover .comment-actions': { opacity: 1 }
                  }}
                  display="flex"
                  alignItems="flex-start"
                  gap={1.5}
                >
                  <Avatar src={comment.userImageUrl || undefined} sx={{ width: 36, height: 36 }} />
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography fontWeight="bold" color="#222">
                        {comment.username || 'Unknown User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {comment.createdAt && dayjs(comment.createdAt).fromNow()}
                      </Typography>
                    </Box>
                    <Typography color="#222" sx={{ mt: 0.5 }}>
                      {comment.content}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                      <Typography variant="caption" color="#aaa" sx={{ cursor: 'pointer' }}>
                        Like
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="#aaa" 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setReplyOpenCommentId(comment.id)}
                      >
                        Reply
                      </Typography>
                    </Box>
                    
                    {/* Subcomments */}
                    <Box ml={5} mt={1}>
                      {comment.subComments?.length > 0 && comment.subComments.map((sub: any, idx: number) => (
                        <Box
                          key={idx}
                          sx={{
                            bgcolor: '#f5f6fa',
                            borderRadius: 2,
                            p: 1,
                            mb: 0.5,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.2,
                            fontSize: '0.95em'
                          }}
                        >
                          <Avatar src={sub.userImageUrl || undefined} sx={{ width: 28, height: 28 }} />
                          <Box>
                            <Typography fontWeight="bold" color="#222" fontSize="0.97em">
                              {sub.username || sub.userId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontSize="0.85em">
                              {sub.createdAt && dayjs(sub.createdAt).fromNow()}
                            </Typography>
                            <Typography color="#222" fontSize="0.97em">
                              {sub.content}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      
                      {/* Reply form - chỉ hiện khi comment này đang được mở */}
                      {replyOpenCommentId === comment.id && (
                        <Box mt={1} p={1} bgcolor="#f5f5f5" borderRadius={2} maxWidth={400}>
                          <ReplyForm 
                            commentId={comment.id} 
                            onReplied={() => {
                              if (commentPostId) {
                                handleOpenComments(commentPostId);
                              }
                              setReplyOpenCommentId(null);
                            }} 
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
          
          {/* Comment input */}
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Avatar src={currentUser?.userImageUrl || undefined} />
            <TextField
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              fullWidth
              size="small"
              multiline
              minRows={1}
              maxRows={4}
            />
            <Button 
              onClick={handleSendComment} 
              disabled={sendingComment || !commentInput.trim()} 
              variant="contained"
            >
              Send
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseComments}
            disabled={sendingComment}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ReplyForm component for sub-comments
function ReplyForm({ commentId, onReplied }: { commentId: number, onReplied: () => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleReply = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const api = getPost();
      await api.postApiV1PostCommentCommentIdSubComment(commentId, input);
      setInput('');
      onReplied();
    } catch (err: any) {
      console.error('Failed to send reply:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <TextField
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Reply..."
        size="small"
        multiline
        minRows={1}
        maxRows={3}
        fullWidth
      />
      <Button 
        onClick={handleReply} 
        disabled={loading || !input.trim()} 
        variant="outlined" 
        size="small"
      >
        {loading ? 'Sending...' : 'Send'}
      </Button>
    </Box>
  );
} 