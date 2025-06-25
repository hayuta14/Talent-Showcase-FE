import { Avatar, Box, Button, Paper, Stack, Typography } from '@mui/material';

const suggestions = [
  { name: 'Frances Guerrero', job: 'News anchor', img: 'https://randomuser.me/api/portraits/men/34.jpg' },
  { name: 'Lori Ferguson', job: 'Web Developer', img: 'https://randomuser.me/api/portraits/women/48.jpg' },
  { name: 'Samuel Bishop', job: 'News anchor', img: 'https://randomuser.me/api/portraits/men/35.jpg', followed: true },
  { name: 'Dennis Barrett', job: 'Web Developer at ...', img: 'https://randomuser.me/api/portraits/men/36.jpg' },
  { name: 'Judy Nguyen', job: 'News anchor', img: 'https://randomuser.me/api/portraits/women/49.jpg' },
];

export default function WhoToFollow() {
  return (
    <Paper className="p-4 rounded-xl shadow">
      <Typography variant="h6" className="mb-4 font-bold">Who to follow</Typography>
      <Stack spacing={2}>
        {suggestions.map((user, idx) => (
          <Stack direction="row" spacing={2} alignItems="center" key={user.name}>
            <Avatar src={user.img} />
            <Box className="flex-1">
              <Typography variant="subtitle2">{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user.job}</Typography>
            </Box>
            <Button
              variant={user.followed ? 'contained' : 'outlined'}
              color="primary"
              size="small"
              className={user.followed ? '' : 'border-blue-500'}
            >
              {user.followed ? <span>&#10003;</span> : '+'}
            </Button>
          </Stack>
        ))}
      </Stack>
      <Button fullWidth className="mt-4" size="small" variant="text">View more</Button>
    </Paper>
  );
} 