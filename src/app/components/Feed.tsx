import { useEffect, useRef, useState, createContext, useContext } from 'react';
import { Avatar, Box, Typography, Paper, Stack, CircularProgress, Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, Button, FormControlLabel, Checkbox } from '@mui/material';
import { getPost } from '@/generated/api/endpoints/post/post';
import { getMedia } from '@/generated/api/endpoints/media/media';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/useUserStore';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PublicIcon from '@mui/icons-material/Public';
import { getCategory } from '@/generated/api/endpoints/category/category';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useFeedStore } from '@/stores/feedStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const PAGE_SIZE = 5;

export const FeedContext = createContext({
  addPost: (post: any) => {},
});

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const posts = useFeedStore(s => s.posts);
  const setPosts = useFeedStore(s => s.setPosts);
  const page = useFeedStore(s => s.page);
  const setPage = useFeedStore(s => s.setPage);
  const hasMore = useFeedStore(s => s.hasMore);
  const setHasMore = useFeedStore(s => s.setHasMore);
  const loading = useFeedStore(s => s.loading);
  const setLoading = useFeedStore(s => s.setLoading);
  const loader = useRef<HTMLDivElement>(null);

  const currentUserId = useAuthStore(s => s.user?.nameid);
  const currentUserImageUrl = useAuthStore(s => s.user?.userImageUrl);

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Load posts from API (lazy loading)
  const loadPosts = async (pageNum: number) => {
    setLoading(true);
    try {
      const api = getPost();
      const res = await api.getApiV1Post({ page: pageNum, pageSize: PAGE_SIZE });
      let newPosts: any[] = [];
      if (Array.isArray(res.data)) newPosts = res.data;
      else if (res.data && typeof res.data === 'object' && Array.isArray((res.data as any).items)) newPosts = (res.data as any).items;
      setPosts((prev: any[]) => {
        // Avoid duplicate posts
        const ids = new Set(prev.map(p => p.id));
        return [...prev, ...newPosts.filter(p => !ids.has(p.id))];
      });
      if (!newPosts.length || newPosts.length < PAGE_SIZE) setHasMore(false);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (posts.length === 0) {
      loadPosts(1);
      setPage(1);
      setHasMore(true);
    }
    // eslint-disable-next-line
  }, []);

  // Load more when page increases
  useEffect(() => {
    if (page === 1) return;
    if (posts.length >= page * PAGE_SIZE) return;
    loadPosts(page);
    // eslint-disable-next-line
  }, [page]);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!loader.current || !hasMore || loading) return;
    let observer: IntersectionObserver | null = null;
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((p: number) => p + 1);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loader.current!);
    return () => {
      if (observer) observer.disconnect();
    };
  }, [loader, loading, hasMore]);

  // Reset state on unmount
  useEffect(() => {
    return () => {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      setLoading(false);
    };
    // eslint-disable-next-line
  }, []);

  const addPost = (post: any) => {
    setPosts((prev: any[]) => [post, ...prev]);
  };

  return (
    <FeedContext.Provider value={{ addPost }}>
      {children}
      <FeedInner posts={posts} loader={loader} loading={loading} hasMore={hasMore} />
    </FeedContext.Provider>
  );
}

function FeedInner({ posts, loader, loading, hasMore }: { posts: any[]; loader: any; loading: boolean; hasMore: boolean }) {
  const currentUserId = useAuthStore(s => s.user?.nameid);
  const currentUserImageUrl = useAuthStore(s => s.user?.userImageUrl);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedPosts, setFeedPosts] = useState(posts);
  useEffect(() => { setFeedPosts(posts); }, [posts]);

  // Edit post popup state
  const [editOpen, setEditOpen] = useState(false);
  const [editPost, setEditPost] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Add video upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Category state
  const [categories, setCategories] = useState<{id:number, name:string}[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const api = getCategory();
        const res = await api.getApiV1Category();
        let cats = Array.isArray(res.data) ? res.data : (res.data && Array.isArray((res.data as any).items) ? (res.data as any).items : []);
        setCategories(cats);
      } catch {}
    };
    fetchCategories();
  }, []);

  // Comment popup state
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [sending, setSending] = useState(false);

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
      setFeedPosts((prev: any[]) => prev.filter(p => p.id !== menuPostId));
      handleMenuClose();
    } catch {
      // Optionally show error
    } finally {
      setDeleting(false);
    }
  };
  // Handle edit
  const handleEdit = () => {
    const post = feedPosts.find(p => p.id === menuPostId);
    setEditPost(post);
    setEditOpen(true);
    handleMenuClose();
  };

  // Add video upload handler
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const api = getMedia();
      const res = await api.postApiMediaUploadVideo({ file });
      const url = (res as any)?.url || (res as any)?.data?.url || '';
      if (url) setEditPost((prev: any) => ({ ...prev, videoUrl: url }));
      else setUploadError('No video URL returned');
    } catch {
      setUploadError('Upload video failed');
    } finally {
      setUploading(false);
    }
  };

  // Like handler
  const handleLike = async (postId: number, liked: boolean) => {
    try {
      const api = getPost();
      await api.postApiV1PostLike({ postId }); // Toggle like/unlike
      setFeedPosts(prev =>
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

  // Comment handler
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
      // Update commentCount for the post in feedPosts
      setFeedPosts(prevPosts => prevPosts.map(post =>
        post.id === commentPostId
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      ));
    } finally {
      setSending(false);
    }
  };

  return (
    <Stack spacing={3}>
      {feedPosts.map((post, idx) => (
        <Paper key={post.id ? `post-${post.id}` : `idx-${idx}`} className="p-4 rounded-xl shadow relative">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={post.userImageUrl || undefined} />
            <Box>
              <Typography variant="subtitle1" className="font-bold">{post.username || 'User'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {post.uploadedAt ? `• ${dayjs(post.uploadedAt).fromNow()}` : ''}
              </Typography>
            </Box>
            {/* Log userId comparison for debugging */}
            {String(post.userId) === String(currentUserId) && (
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton size="small" onClick={e => handleMenuOpen(e, post.id)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            )}
          </Stack>
          <Typography className="mt-3 mb-2">{post.content || post.description}</Typography>
          {post.image && (
            <Box className="rounded-lg overflow-hidden">
              <img src={post.image} alt="post" className="w-full h-60 object-cover" />
            </Box>
          )}
          {post.videoUrl && post.videoUrl !== '' && (
            <Box className="rounded-lg overflow-hidden mt-2">
              <video src={post.videoUrl} controls className="w-full max-h-60 rounded" />
            </Box>
          )}
          {/* Like & Comment actions */}
          <Box className="flex items-center gap-4 mt-2">
            <IconButton size="small" onClick={() => handleLike(post.id, !!post.likedByCurrentUser)}>
              <FavoriteBorderIcon color={post.likedByCurrentUser ? 'error' : 'inherit'} />
            </IconButton>
            <span>{post.likeCount || 0}</span>
            <IconButton size="small" onClick={() => handleOpenComments(post.id)}>
              <ChatBubbleOutlineIcon />
            </IconButton>
            <span>{post.commentCount ?? 0}</span>
          </Box>
        </Paper>
      ))}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</MenuItem>
      </Menu>
      {/* Edit Post Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error">{editError}</Alert>}
          <TextField
            label="Content"
            fullWidth
            multiline
            minRows={2}
            value={editPost?.description || ''}
            onChange={e => setEditPost({ ...editPost, description: e.target.value })}
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
              <input type="file" accept="video/*" hidden onChange={handleVideoChange} />
            </Button>
            {editPost?.videoUrl && (
              <video src={editPost.videoUrl} controls className="max-h-24 rounded ml-2" style={{ maxWidth: 120 }} />
            )}
          </Box>
          {uploadError && <Alert severity="error">{uploadError}</Alert>}
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              label="Category"
              value={editPost?.categoryId || (categories[0]?.id || 1)}
              onChange={e => setEditPost({ ...editPost, categoryId: Number(e.target.value) })}
              fullWidth
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!editPost?.isPublic}
                  onChange={e => setEditPost({ ...editPost, isPublic: e.target.checked })}
                  icon={<PublicIcon />}
                  checkedIcon={<PublicIcon color="primary" />}
                />
              }
              label="Public"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="secondary">Cancel</Button>
          <Button
            onClick={async () => {
              setEditLoading(true);
              setEditError('');
              try {
                const api = getPost();
                await api.patchApiV1PostId(editPost.id, {
                  description: editPost.description,
                  categoryId: editPost.categoryId,
                  isPublic: editPost.isPublic,
                  videoUrl: editPost.videoUrl || '',
                });
                setFeedPosts(prev => prev.map(p => p.id === editPost.id ? { ...p, ...editPost } : p));
                setEditOpen(false);
              } catch {
                setEditError('Failed to update post');
              } finally {
                setEditLoading(false);
              }
            }}
            color="primary"
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
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
            <Avatar src={currentUserImageUrl || undefined} />
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
            <Button onClick={handleSendComment} disabled={sending || !commentInput.trim()} variant="contained">
              Send
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <div ref={loader} />
      {loading && <Box className="flex justify-center"><CircularProgress /></Box>}
      {!hasMore && !loading && <Box className="text-center text-gray-400">No more posts</Box>}
    </Stack>
  );
}

export default FeedProvider; 