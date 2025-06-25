import { Paper, Typography, Box } from '@mui/material';

export default function News() {
  return (
    <Paper className="p-4 rounded-xl shadow mt-4">
      <Typography variant="h6" className="mb-2 font-bold">Today's news</Typography>
      <Box>
        <Typography variant="body2" className="mb-1">Ten questions you should answer truthfully.</Typography>
        <Typography variant="body2">How to build a strong network in tech.</Typography>
      </Box>
    </Paper>
  );
} 