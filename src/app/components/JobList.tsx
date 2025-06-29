import { List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Typography, Box, CircularProgress, Alert } from "@mui/material";

export default function JobList({
  jobs,
  onSelectJob,
  selectedJob,
  loading,
  error,
}: {
  jobs: any[],
  onSelectJob: (job: any) => void,
  selectedJob: any,
  loading?: boolean,
  error?: string,
}) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity='error'>{error}</Alert>;
  if (!jobs.length) return <Typography>No jobs found</Typography>;

  // Helper: format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <List sx={{ p: 0 }}>
      {jobs.map(job => (
        <ListItem key={job.id} alignItems="flex-start" disablePadding>
          <ListItemButton
            selected={selectedJob?.id === job.id}
            onClick={() => onSelectJob(job)}
            sx={{
              bgcolor: selectedJob?.id === job.id ? "#eaf1fb" : "inherit",
              borderLeft: selectedJob?.id === job.id ? "4px solid #0a66c2" : "4px solid transparent",
              mb: 0.5,
              borderRadius: 2,
              transition: "background 0.2s, border 0.2s",
              px: 1.5,
              py: 1.2,
              position: 'relative',
            }}
          >
            <ListItemAvatar>
              <Avatar src={job.imageUrl || undefined} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  <Typography fontWeight="bold" fontSize={16} color="#0a66c2">{job.title}</Typography>
                  <Typography fontSize={14} color="text.secondary">{job.additionalData?.companyName}</Typography>
                </>
              }
              secondary={
                <>
                  <span style={{ fontSize: 13, color: '#666' }}>{job.additionalData?.location}</span>
                  <span style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>
                    {job.additionalData?.salary ? `Salary: ${job.additionalData.salary}` : ''}
                  </span>
                  <span style={{ fontSize: 12, color: '#888', display: 'block' }}>
                    {job.createdAt ? `Created: ${formatDate(job.createdAt)}` : ''}
                  </span>
                </>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
} 