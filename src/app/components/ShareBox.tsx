import { useContext, useState } from 'react';
import { Avatar, Box, Button, Stack, TextField } from '@mui/material';
import PhotoIcon from '@mui/icons-material/Photo';
import VideocamIcon from '@mui/icons-material/Videocam';
import EventIcon from '@mui/icons-material/Event';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { FeedContext } from './Feed';

export default function ShareBox() {
  const [value, setValue] = useState('');
  const { addPost } = useContext(FeedContext);

  const handleShare = () => {
    if (!value.trim()) return;
    addPost({
      user: 'You',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      time: 'Just now',
      job: 'Web Developer at StackBros',
      content: value,
      image: undefined,
    });
    setValue('');
  };

  return (
    <Box className="bg-white rounded-xl shadow p-4 mb-4">
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" />
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Share your thoughts..."
          size="small"
          className="bg-gray-50 rounded"
          value={value}
          onChange={e => setValue(e.target.value)}
          sx={{ borderColor: '#2563eb', borderWidth: 1, borderStyle: 'solid' }}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ height: 40, ml: 2, minWidth: 80 }}
          onClick={handleShare}
          disabled={!value.trim()}
        >
          Share
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} className="mt-3">
        <Button startIcon={<PhotoIcon />} size="small">Photo</Button>
        <Button startIcon={<VideocamIcon />} size="small">Video</Button>
        <Button startIcon={<EventIcon />} size="small">Event</Button>
        <Button startIcon={<EmojiEmotionsIcon />} size="small">Feeling / Activity</Button>
      </Stack>
    </Box>
  );
} 