import { Paper, Stack, Avatar, Box, Typography, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import dayjs from 'dayjs';

function isVideo(url: string) {
  return /\.(mp4|webm|ogg)$/i.test(url);
}

export default function PostCard({ post }: { post: any }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src={post.userImageUrl || undefined} />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">{post.username || 'User'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {post.uploadedAt ? `• ${dayjs(post.uploadedAt).fromNow()}` : ''}
          </Typography>
        </Box>
      </Stack>
      <Typography sx={{ mt: 2, mb: 2 }}>{post.content || post.description}</Typography>
      {post.videoUrl && (
        <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
          <video src={post.videoUrl} controls style={{ width: '100%', maxHeight: 300, borderRadius: 8 }} />
        </Box>
      )}
      {!post.videoUrl && post.imageUrl && isVideo(post.imageUrl) && (
        <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
          <video src={post.imageUrl} controls style={{ width: '100%', maxHeight: 300, borderRadius: 8 }} />
        </Box>
      )}
      {!post.videoUrl && post.imageUrl && !isVideo(post.imageUrl) && (
        <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
          <img src={post.imageUrl} alt="post" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton size="small">
          <FavoriteBorderIcon />
        </IconButton>
        <span>{post.likeCount || 0}</span>
        <IconButton size="small">
          <ChatBubbleOutlineIcon />
        </IconButton>
        <span>{post.commentCount ?? 0}</span>
      </Box>
    </Paper>
  );
} 