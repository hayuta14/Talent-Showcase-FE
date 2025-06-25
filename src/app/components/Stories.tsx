import { Avatar, Box, Typography, Paper, Stack, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const stories = [
  { name: 'Judy Nguyen', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Billy Vasquez', img: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { name: 'Amanda Reed', img: 'https://randomuser.me/api/portraits/women/46.jpg' },
  { name: 'Lori', img: 'https://randomuser.me/api/portraits/women/47.jpg' },
];

export default function Stories() {
  return (
    <Stack direction="row" spacing={2} className="mb-4 overflow-x-auto">
      <Paper className="flex flex-col items-center justify-center w-24 h-36 p-2 cursor-pointer border-dashed border-2 border-gray-300 hover:border-blue-400">
        <IconButton color="primary" className="mb-2"><AddIcon /></IconButton>
        <Typography variant="body2" className="text-center">Post a Story</Typography>
      </Paper>
      {stories.map((story, idx) => (
        <Paper key={story.name} className="flex flex-col items-center w-24 h-36 p-2 cursor-pointer hover:shadow-lg">
          <Avatar src={story.img} alt={story.name} sx={{ width: 48, height: 48, mb: 1 }} />
          <Typography variant="body2" className="text-center mt-auto">{story.name}</Typography>
        </Paper>
      ))}
    </Stack>
  );
} 