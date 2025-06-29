'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  Paper, 
  Tabs, 
  Tab, 
  Chip, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  CircularProgress, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import { getSearch } from '@/generated/api/endpoints/search/search';
import { getCategory } from '@/generated/api/endpoints/category/category';
import { getJob } from '@/generated/api/endpoints/job/job';
import Pagination from '@mui/material/Pagination';
import CommunityList from '../components/CommunityList';
import JobList from '../components/JobList';
import PostCard from '../components/PostCard';
import { getCommunity } from '@/generated/api/endpoints/community/community';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for all search params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [type, setType] = useState('user');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [talentId, setTalentId] = useState('');
  const [talents, setTalents] = useState<{ id: number, title: string }[]>([]);

  // Results
  const [results, setResults] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Community loading states
  const [joinLoading, setJoinLoading] = useState<number | null>(null);
  const [leaveLoading, setLeaveLoading] = useState<number | null>(null);

  // Fetch categories when type is 'talent'
  useEffect(() => {
    if (type === 'talent') {
      const fetchCategories = async () => {
        try {
          const { getApiV1Category } = getCategory();
          const res = await getApiV1Category({ page: 1, pageSize: 100 });
          // Log cấu trúc thực tế
          console.log('Category API response:', res);
          let cats: any[] = [];
          if (Array.isArray(res.data)) {
            cats = res.data;
          } else if (res.data && Array.isArray(res.data.data)) {
            cats = res.data.data;
          } else if (res.data && res.data.data && Array.isArray(res.data.data.data)) {
            cats = res.data.data.data;
          }
          setCategories(cats.map((c: any) => ({ id: c.id, name: c.name })));
        } catch (e) {
          setCategories([]);
        }
      };
      fetchCategories();
    } else {
      setCategories([]);
      setCategory('');
    }
  }, [type]);

  // Fetch talentCategory khi type là user, post, hoặc job
  useEffect(() => {
    if (type === 'user' || type === 'post' || type === 'job') {
      const fetchTalentCategories = async () => {
        try {
          const api = getCategory();
          const res = await api.getApiV1Category({ page: 1, pageSize: 100 });
          console.log(res);
          let arr: any[] = [];
          if (Array.isArray(res.data.items)) {
            arr = res.data.items;
          } else if (res.data && Array.isArray(res.data.data)) {
            arr = res.data.data;
          } else if (res.data && res.data.data && Array.isArray(res.data.data.data)) {
            arr = res.data.data.data;
          }
          setTalents(arr.map((t: any) => ({ id: t.id, title: t.name })));
        } catch {
          setTalents([]);
        }
      };
      fetchTalentCategories();
    } else {
      setTalents([]);
      setTalentId('');
    }
  }, [type]);

  // Fetch on search
  const performSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params: any = {
        Query: searchQuery,
        Type: type,
        Level: (type !== 'job') ? (level || undefined) : undefined,
        Page: page,
        PageSize: pageSize,
        SortBy: sortBy,
        SortOrder: sortOrder,
      };
      if ((type === 'user' || type === 'post' || type === 'job') && talentId) {
        params.TalentId = talentId;
      }
      if (type === 'talent') {
        // Xoá type talent khỏi dropdown, không cần xử lý
      }
      if (type === 'talent') return; // Không gọi search nếu là talent
      const searchApi = getSearch();
      const res = await searchApi.getApiV1Search(params);
      
      // Log response structure for debugging
      console.log('Search API response:', res);
      console.log('Search results:', res.data?.results);
      
      // Log community data structure specifically
      if (type === 'community' && res.data?.results) {
        console.log('Community results structure:', res.data.results);
        res.data.results.forEach((community: any, index: number) => {
          console.log(`Community ${index}:`, {
            id: community.id,
            communityId: community.communityId,
            title: community.title,
            name: community.name,
            description: community.description,
            memberCount: community.memberCount,
            userRole: community.userRole,
            isMember: community.isMember,
            createdAt: community.createdAt
          });
        });
      }
      
      setResults(res.data?.results || []);
      setTotalResults(res.data?.metadata?.totalResults || 0);
    } catch (err) {
      setError('Failed to perform search');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Auto search when filter changes (not query)
  useEffect(() => {
    if (searchQuery) performSearch();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (searchQuery) performSearch();
    // eslint-disable-next-line
  }, [type, level, sortBy, sortOrder, pageSize, page]);

  // Reset page to 1 when query/type/level/pageSize changes
  useEffect(() => { setPage(1); }, [searchQuery, type, level, pageSize]);

  // Khi thay đổi page, query, filter, gọi lại performSearch
  useEffect(() => {
    performSearch();
    // eslint-disable-next-line
  }, [page, searchQuery, type, level, category, pageSize, sortBy, sortOrder]);

  // Reset page về 1 khi đổi query/filter
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line
  }, [searchQuery, type, level, category, pageSize, sortBy, sortOrder]);

  // Khi đổi type, blur phần tử đang focus (fix lỗi aria-hidden)
  useEffect(() => {
    if (typeof window !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [type]);

  // Enhanced community handlers with role checking
  const handleJoinCommunity = async (communityId: number) => {
    setJoinLoading(communityId);
    try {
      const api = getCommunity();
      await api.postApiV1CommunityJoin({ communityId });
      
      // Update local state
      setResults(prevResults =>
        prevResults.map(community =>
          (community.communityId || community.id) === communityId
            ? { ...community, isMember: true, memberCount: (community.memberCount || 0) + 1 }
            : community
        )
      );
    } catch (err: any) {
      console.error('Failed to join community:', err);
      // You might want to show an error message here
    } finally {
      setJoinLoading(null);
    }
  };

  const handleLeaveCommunity = async (communityId: number) => {
    // Find the community to check if user is the creator
    const community = results.find(c => (c.communityId || c.id) === communityId);
    
    if (!community) {
      console.error('Community not found');
      return;
    }
    
    // Check if user is the creator of the community
    if (community.userRole === 'Admin' || community.userRole === 'Creator') {
      alert('Community creators cannot leave their own communities. Please transfer ownership or delete the community instead.');
      return;
    }
    
    setLeaveLoading(communityId);
    try {
      const api = getCommunity();
      await api.deleteApiV1CommunityCommunityIdLeave(communityId);
      
      // Update local state
      setResults(prevResults =>
        prevResults.map(community =>
          (community.communityId || community.id) === communityId
            ? { ...community, isMember: false, memberCount: Math.max(0, (community.memberCount || 1) - 1) }
            : community
        )
      );
    } catch (err: any) {
      console.error('Failed to leave community:', err);
      // You might want to show an error message here
    } finally {
      setLeaveLoading(null);
    }
  };

  const handleViewDetails = (communityId: number) => {
    // Find the community to check if user is a member
    const community = results.find(c => (c.communityId || c.id) === communityId);
    
    if (!community) {
      console.error('Community not found');
      return;
    }
    
    // Check if user is a member of the community
    if (!community.isMember) {
      // Show alert to inform user they need to join first
      alert('You need to join this community first to view its details.');
      return;
    }
    
    // If user is a member, navigate to community detail page
    router.push(`/groups/${communityId}`);
  };

  const handleUserClick = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  const handleSelectJob = async (job: any) => {
    try {
      const api = getJob();
      const res = await api.getApiV1JobId(job.id);
      setSelectedJob(res.data);
    } catch (e) {
      setSelectedJob(null);
    }
  };

  // UI for filters
  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={performSearch}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select value={type} label="Type" onChange={e => setType(e.target.value)}>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="community">Community</MenuItem>
                <MenuItem value="job">Job</MenuItem>
                <MenuItem value="post">Post</MenuItem>
              </Select>
            </FormControl>
            {(type === 'user' || type === 'post' || type === 'job') && (
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Talent</InputLabel>
                <Select value={talentId} label="Talent" onChange={e => setTalentId(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {talents.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {(type !== 'job' && type !== 'community' && type !== 'post')&& (
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Level</InputLabel>
                <Select value={level} label="Level" onChange={e => setLevel(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="fresher">Fresher</MenuItem>
                  <MenuItem value="junior">Junior</MenuItem>
                  <MenuItem value="mid">Middle</MenuItem>
                  <MenuItem value="senior">Senior</MenuItem>
                </Select>
              </FormControl>
            )}
            {type === 'talent' && (
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Category</InputLabel>
                <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl sx={{ minWidth: 100 }}>
              <InputLabel>Page Size</InputLabel>
              <Select value={pageSize} label="Page Size" onChange={e => setPageSize(Number(e.target.value))}>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}>
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort Order</InputLabel>
              <Select value={sortOrder} label="Sort Order" onChange={e => setSortOrder(e.target.value)}>
                <MenuItem value="asc">Asc</MenuItem>
                <MenuItem value="desc">Desc</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained">Search</Button>
          </Stack>
        </form>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>}

      {/* Tổng số kết quả */}
      {!loading && !error && totalResults > 0 && (
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            Found {totalResults} result{totalResults > 1 ? 's' : ''}
          </Typography>
        </Box>
      )}

      {/* Render results */}
      {!loading && !error && results.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">No results found for "{searchQuery}"</Typography>
        </Box>
      )}
      {!loading && !error && results.length > 0 && (
        type === 'community' ? (
          <CommunityList
            groups={results}
            onJoin={handleJoinCommunity}
            onLeave={handleLeaveCommunity}
            onViewDetails={handleViewDetails}
            loading={loading}
            error={error}
            joinLoading={joinLoading}
            leaveLoading={leaveLoading}
          />
        ) : type === 'job' ? (
          <Box sx={{ display: 'flex', gap: 4 }}>
            <JobList
              jobs={results}
              onSelectJob={handleSelectJob}
              selectedJob={selectedJob}
              loading={loading}
              error={error}
            />
            <Box sx={{ flex: 1 }}>
              {selectedJob ? (
                <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 700, mx: 'auto', boxShadow: 2 }}>
                  <Typography variant="h5" fontWeight="bold">{selectedJob.jobTitle}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">{selectedJob.companyName} • {selectedJob.location}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedJob.expireAt ? `Expires at: ${new Date(selectedJob.expireAt).toLocaleDateString('en-US')}` : ''}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>{selectedJob.jobDescription}</Typography>
                  <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>What You'll Bring</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {(selectedJob.requirements ? selectedJob.requirements.split('\n') : []).map((req: string, idx: number) => (
                      <li key={idx}>
                        <Typography>{req}</Typography>
                      </li>
                    ))}
                  </ul>
                </Paper>
              ) : (
                <Typography color="text.secondary">Select a job to view details</Typography>
              )}
            </Box>
          </Box>
        ) : type === 'post' ? (
          <Box>
            {results.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Box>
        ) : (
          <List>
            {results.map((item: any) => (
              <ListItem 
                key={item.type + '-' + item.id} 
                sx={{ 
                  bgcolor: 'white', 
                  mb: 1, 
                  borderRadius: 2, 
                  cursor: item.type === 'user' ? 'pointer' : 'default', 
                  '&:hover': { 
                    bgcolor: item.type === 'user' ? '#f5f5f5' : 'white' 
                  } 
                }}
                onClick={item.type === 'user' ? () => handleUserClick(item.id) : undefined}
              >
                {item.type === 'user' && (
                  <>
                    <ListItemAvatar>
                      <Avatar src={item.imageUrl} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          <span style={{ color: 'gray', fontSize: '0.875rem', display: 'block' }}>{'description' in item ? item.description : ''}</span>
                          {item.additionalData?.email && (
                            <span style={{ display: 'inline-block', marginTop: 4 }}>
                              <Chip label={item.additionalData.email} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            </span>
                          )}
                        </>
                      }
                      secondaryTypographyProps={{ component: 'span' }}
                    />
                  </>
                )}
                {/* Add more type blocks here if needed */}
              </ListItem>
            ))}
          </List>
        )
      )}

      {/* Pagination ở cuối trang */}
      {!loading && !error && totalResults > pageSize && (
        <Box display="flex" justifyContent="center" my={4}>
          <Pagination
            count={Math.ceil(totalResults / pageSize)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
} 