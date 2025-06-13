import { Avatar, Box, Typography, Paper, Divider, Stack } from '@mui/material';

export default function ProfileCard() {
  return (
    <Paper className="p-6 rounded-xl shadow flex flex-col items-center" elevation={2}>
      <Box className="w-full h-24 rounded-t-xl bg-gradient-to-r from-blue-400 to-pink-400 mb-[-40px]" />
      <Avatar
        src="https://randomuser.me/api/portraits/men/32.jpg"
        alt="Sam Lanson"
        sx={{ width: 80, height: 80, border: '4px solid white', marginTop: '-40px' }}
      />
      <Typography variant="h6" className="mt-2 font-bold">Sam Lanson</Typography>
      <Typography variant="body2" color="text.secondary">Web Developer at StackBros</Typography>
      <Typography variant="body2" className="text-center mt-2 text-gray-500">
        I'd love to change the world, but they won't give me the source code.
      </Typography>
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