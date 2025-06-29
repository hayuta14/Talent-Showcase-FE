"use client";
import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, Stack, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, ListItemButton, Chip, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getCommunity } from '@/generated/api/endpoints/community/community';
import type { CommunityResponseDTO } from '@/generated/api/models/communityResponseDTO';
import type { CreateCommunityRequestDTO } from '@/generated/api/models/createCommunityRequestDTO';

export default function GroupsPage() {
  const [groups, setGroups] = useState<CommunityResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinLoading, setJoinLoading] = useState<number | null>(null);
  const [leaveLoading, setLeaveLoading] = useState<number | null>(null);
  
  // Create community dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateCommunityRequestDTO>({
    name: '',
    description: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  
  const router = useRouter();
  
  // Get current user
  const currentUser = useAuthStore(s => s.user);

  // Fetch communities from API
  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      setError('');
      
      try {
        const api = getCommunity();
        const res = await api.getApiV1Community();
        
        if (res.data) {
          setGroups(res.data);
        } else {
          setGroups([]);
        }
      } catch (err: any) {
        setError('Failed to load communities');
        console.error('Failed to fetch communities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Handle group click
  const handleGroupClick = (groupId: number) => {
    // Find the group to check if user is a member
    const group = groups.find(g => g.communityId === groupId);
    
    if (!group) {
      console.error('Group not found');
      return;
    }
    
    // Check if user is a member of the group
    if (!group.isMember) {
      // Show alert to inform user they need to join first
      alert('You need to join this community first to view its details.');
      return;
    }
    
    // If user is a member, navigate to group detail page
    router.push(`/groups/${groupId}`);
  };

  // Handle join community
  const handleJoinCommunity = async (communityId: number) => {
    setJoinLoading(communityId);
    try {
      const api = getCommunity();
      await api.postApiV1CommunityJoin({ communityId });
      
      // Update local state
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.communityId === communityId
            ? { ...group, isMember: true, memberCount: (group.memberCount || 0) + 1 }
            : group
        )
      );
    } catch (err: any) {
      console.error('Failed to join community:', err);
      // You might want to show an error message here
    } finally {
      setJoinLoading(null);
    }
  };

  // Handle leave community
  const handleLeaveCommunity = async (communityId: number) => {
    // Find the group to check if user is the creator
    const group = groups.find(g => g.communityId === communityId);
    
    if (!group) {
      console.error('Group not found');
      return;
    }
    
    // Check if user is the creator of the community
    if (group.userRole === 'Admin' || group.userRole === 'Creator') {
      alert('Community creators cannot leave their own communities. Please transfer ownership or delete the community instead.');
      return;
    }
    
    setLeaveLoading(communityId);
    try {
      const api = getCommunity();
      await api.deleteApiV1CommunityCommunityIdLeave(communityId);
      
      // Update local state
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.communityId === communityId
            ? { ...group, isMember: false, memberCount: Math.max(0, (group.memberCount || 1) - 1) }
            : group
        )
      );
    } catch (err: any) {
      console.error('Failed to leave community:', err);
      // You might want to show an error message here
    } finally {
      setLeaveLoading(null);
    }
  };

  // Handle create community
  const handleCreateCommunity = async () => {
    if (!createFormData.name?.trim()) {
      setCreateError('Community name is required');
      return;
    }

    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const api = getCommunity();
      const res = await api.postApiV1Community(createFormData);

      if (res.data) {
        setCreateSuccess('Community created successfully!');
        
        // Reset form
        setCreateFormData({
          name: '',
          description: ''
        });

        // Refresh communities list
        const communitiesRes = await api.getApiV1Community();
        if (communitiesRes.data) {
          setGroups(communitiesRes.data);
        }

        // Close dialog after a delay
        setTimeout(() => {
          setCreateDialogOpen(false);
          setCreateSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create community');
      
      // Clear error message after a delay
      setTimeout(() => {
        setCreateError('');
      }, 3000);
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle form change
  const handleFormChange = (field: keyof CreateCommunityRequestDTO, value: string) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 80px)', 
      bgcolor: '#f4f6f8', 
      p: { xs: 2, md: 4 } 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" mb={1}>
            Communities
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Discover and join communities that match your skills and interests
          </Typography>
          
          {/* Create New Group Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<GroupIcon />}
            onClick={() => {
              setCreateDialogOpen(true);
              setCreateFormData({
                name: '',
                description: ''
              });
              setCreateError('');
              setCreateSuccess('');
            }}
            sx={{ 
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Create New Community
          </Button>
        </Box>

        {/* Communities List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : (
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {groups.length} communit{groups.length !== 1 ? 'ies' : 'y'} found
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              💡 Join a community to view its details, posts, and interact with members
            </Typography>
            
            <List sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden' }}>
              {groups.map((group, index) => (
                <ListItem 
                  key={group.communityId} 
                  alignItems="flex-start" 
                  disablePadding
                  sx={{ 
                    borderBottom: index < groups.length - 1 ? '1px solid #e0e0e0' : 'none'
                  }}
                >
                  <ListItemButton
                    onClick={() => {
                      // Only allow clicking if user is a member
                      if (group.isMember && group.communityId) {
                        handleGroupClick(group.communityId);
                      }
                    }}
                    sx={{
                      p: 3,
                      '&:hover': {
                        bgcolor: group.isMember ? '#f8f9fa' : 'transparent'
                      },
                      cursor: group.isMember ? 'pointer' : 'default',
                      opacity: group.isMember ? 1 : 0.8
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          bgcolor: '#0a66c2'
                        }}
                      >
                        <GroupIcon />
                      </Avatar>
                    </ListItemAvatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#0a66c2' }}>
                          {group.name || 'Unnamed Community'}
                        </Typography>
                        {group.isMember && (
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
                        {group.description || 'No description available'}
                      </Typography>
                      
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {group.memberCount?.toLocaleString() || 0} members
                          </Typography>
                        </Box>
                        
                        {group.userRole && (
                          <Chip 
                            label={group.userRole} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: 10, height: 20 }}
                          />
                        )}
                        
                        <Typography variant="caption" color="text.secondary">
                          Created {formatDate(group.createdAt)}
                        </Typography>
                      </Stack>
                    </Box>
                    
                    <Stack direction="row" spacing={1}>
                      {/* Join/Leave Button - Hide Leave if community has Creator */}
                      {!(group.isMember && group.userRole === 'creator') && (
                        <Button
                          variant={group.isMember ? "outlined" : "contained"}
                          color={group.isMember ? "error" : "primary"}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (group.communityId) {
                              if (group.isMember) {
                                handleLeaveCommunity(group.communityId);
                              } else {
                                handleJoinCommunity(group.communityId);
                              }
                            }
                          }}
                          disabled={
                            joinLoading === group.communityId || 
                            leaveLoading === group.communityId
                          }
                          startIcon={
                            (joinLoading === group.communityId || leaveLoading === group.communityId) ? 
                            <CircularProgress size={16} /> : null
                          }
                          sx={{ minWidth: 80 }}
                        >
                          {joinLoading === group.communityId ? 'Joining...' :
                           leaveLoading === group.communityId ? 'Leaving...' :
                           group.isMember ? 'Leave' : 'Join'}
                        </Button>
                      )}
                      
                      {/* View Details Button - Only show for joined groups */}
                      {group.isMember && (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (group.communityId) {
                              handleGroupClick(group.communityId);
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
              ))}
            </List>
            
            {groups.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" mb={1}>
                  No communities found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Be the first to create a community or check back later for new ones
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Create Community Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setCreateFormData({
            name: '',
            description: ''
          });
          setCreateError('');
          setCreateSuccess('');
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Create New Community
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Start a new community to connect with like-minded people
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>
          )}
          {createSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{createSuccess}</Alert>
          )}
          
          <Stack spacing={3}>
            <TextField
              label="Community Name"
              fullWidth
              value={createFormData.name || ''}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Enter community name..."
              required
              error={!!createError && !createFormData.name?.trim()}
              helperText={createError && !createFormData.name?.trim() ? 'Community name is required' : ''}
            />
            
            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={createFormData.description || ''}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Describe what your community is about, what topics you'll discuss, and who should join..."
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setCreateDialogOpen(false);
              setCreateFormData({
                name: '',
                description: ''
              });
              setCreateError('');
              setCreateSuccess('');
            }} 
            disabled={createLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCommunity} 
            variant="contained" 
            disabled={createLoading || !createFormData.name?.trim()}
            startIcon={createLoading ? <CircularProgress size={16} /> : null}
          >
            {createLoading ? 'Creating...' : 'Create Community'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 