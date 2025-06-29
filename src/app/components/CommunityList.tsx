import { List, ListItem, ListItemButton, Avatar, Chip, Typography, Button, CircularProgress, Box, Stack, Alert, ListItemAvatar } from "@mui/material";
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';

export default function CommunityList({
  groups,
  onJoin,
  onLeave,
  onViewDetails,
  loading,
  error,
  joinLoading,
  leaveLoading,
}: {
  groups: any[],
  onJoin: (id: number) => void,
  onLeave: (id: number) => void,
  onViewDetails: (id: number) => void,
  loading?: boolean,
  error?: string,
  joinLoading?: number | null,
  leaveLoading?: number | null,
}) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity='error'>{error}</Alert>;
  if (!groups.length) return <Typography>No communities found</Typography>;

  return (
    <List sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden' }}>
      {groups.map((group, index) => {
        // Handle different data structures from search API vs groups API
        const communityId = group.communityId || group.id;
        const communityName = group.title || group.name;
        const communityDescription = group.description;
        const memberCount = group.additionalData.memberCount;
        const userRole = group.additionalData.memberRole;
        const isMember = group.additionalData.isMember;
        const createdAt = group.createdAt;
        console.log(group);
        return (
          <ListItem 
            key={communityId || index} 
            alignItems="flex-start" 
            disablePadding
            sx={{ borderBottom: index < groups.length - 1 ? '1px solid #e0e0e0' : 'none' }}
          >
            <ListItemButton
              onClick={() => {
                // Only allow clicking if user is a member
                if (isMember && communityId) {
                  onViewDetails(communityId);
                }
              }}
              sx={{
                p: 3,
                '&:hover': {
                  bgcolor: isMember ? '#f8f9fa' : 'transparent'
                },
                cursor: isMember ? 'pointer' : 'default',
                opacity: isMember ? 1 : 0.8
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#0a66c2' }}>
                  <GroupIcon />
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#0a66c2' }}>
                    {communityName || 'Unnamed Community'}
                  </Typography>
                  {isMember && (
                    <Chip 
                      label="Joined" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                      sx={{ fontSize: 10, height: 20 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {communityDescription || 'No description available'}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {memberCount?.toLocaleString() || 0} members
                    </Typography>
                  </Box>
                  {userRole && (
                    <Chip 
                      label={userRole} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: 10, height: 20 }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Created {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
                  </Typography>
                </Stack>
              </Box>
              <Stack direction="row" spacing={1}>
                {/* Join/Leave Button - Hide Leave if community has Creator */}
                {!(isMember && userRole === 'creator') && (
                  <Button
                    variant={isMember ? "outlined" : "contained"}
                    color={isMember ? "error" : "primary"}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (communityId) {
                        if (isMember) {
                          onLeave(communityId);
                        } else {
                          onJoin(communityId);
                        }
                      }
                    }}
                    disabled={
                      joinLoading === communityId || 
                      leaveLoading === communityId
                    }
                    startIcon={
                      (joinLoading === communityId || leaveLoading === communityId) ? 
                      <CircularProgress size={16} /> : null
                    }
                    sx={{ minWidth: 80 }}
                  >
                    {joinLoading === communityId ? 'Joining...' :
                     leaveLoading === communityId ? 'Leaving...' :
                     isMember ? 'Leave' : 'Join'}
                  </Button>
                )}
                
                {/* View Details Button - Only show for joined groups */}
                {isMember && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (communityId) {
                        onViewDetails(communityId);
                      }
                    }}
                    sx={{ minWidth: 100 }}
                  >
                    View Details
                  </Button>
                )}
              </Stack>
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
} 