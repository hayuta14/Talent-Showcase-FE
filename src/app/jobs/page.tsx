"use client";
import { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, InputAdornment, Button, Stack, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Chip, Alert, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import { getJob } from '@/generated/api/endpoints/job/job';
import { getCategory } from '@/generated/api/endpoints/category/category';
import { getJobApplication } from '@/generated/api/endpoints/job-application/job-application';
import type { JobResponseDTO, JobRequestDTO } from '@/generated/api/models';
import type { CategoryResponseDTO } from '@/generated/api/models/categoryResponseDTO';
import type { JobApplicationRequestDTO } from '@/generated/api/models/jobApplicationRequestDTO';
import type { JobApplicationResponseDTO } from '@/generated/api/models/jobApplicationResponseDTO';
import { useAuthStore } from '@/stores/authStore';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobResponseDTO | null>(null);
  
  // Get current user
  const currentUser = useAuthStore(s => s.user);
  const currentUserId = currentUser?.nameid ? Number(currentUser.nameid) : null;
  
  // Job creation dialog state
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [createJobLoading, setCreateJobLoading] = useState(false);
  const [createJobError, setCreateJobError] = useState('');
  const [createJobSuccess, setCreateJobSuccess] = useState('');
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  
  // Job update dialog state
  const [updateJobOpen, setUpdateJobOpen] = useState(false);
  const [updateJobLoading, setUpdateJobLoading] = useState(false);
  const [updateJobError, setUpdateJobError] = useState('');
  const [updateJobSuccess, setUpdateJobSuccess] = useState('');
  const [updateJobFormData, setUpdateJobFormData] = useState<JobRequestDTO>({
    jobTitle: '',
    companyName: '',
    location: '',
    salary: '',
    jobDescription: '',
    requirements: '',
    expireAt: '',
    talentCategoryIds: [],
    levels: []
  });
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Job application state
  const [jobApplications, setJobApplications] = useState<{[jobId: number]: boolean}>({});
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  
  // Apply dialog state
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyFormData, setApplyFormData] = useState<JobApplicationRequestDTO>({
    jobId: undefined,
    coverLetter: '',
    resumeUrl: ''
  });
  
  // Applicants dialog state
  const [applicantsDialogOpen, setApplicantsDialogOpen] = useState(false);
  const [applicants, setApplicants] = useState<JobApplicationResponseDTO[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState('');
  
  // Job form data
  const [jobFormData, setJobFormData] = useState<JobRequestDTO>({
    jobTitle: '',
    companyName: '',
    location: '',
    salary: '',
    jobDescription: '',
    requirements: '',
    expireAt: '',
    talentCategoryIds: [],
    levels: []
  });

  // Check if current user is the job creator
  const isJobCreator = (job: JobResponseDTO) => {
    return currentUserId && job.userId && currentUserId === job.userId;
  };

  // Check if job is expired
  const isJobExpired = (job: JobResponseDTO) => {
    if (!job.expireAt) return false;
    const expireDate = new Date(job.expireAt);
    const currentDate = new Date();
    return currentDate > expireDate;
  };

  // Check if user has applied to a job
  const hasAppliedToJob = (jobId: number) => {
    return jobApplications[jobId] || false;
  };

  // Format date to readable format
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuOpen(false);
  };

  const handleUpdateJob = () => {
    handleMenuClose();
    if (selectedJob) {
      // Fill the update form with current job data
      setUpdateJobFormData({
        jobTitle: selectedJob.jobTitle || '',
        companyName: selectedJob.companyName || '',
        location: selectedJob.location || '',
        salary: selectedJob.salary || '',
        jobDescription: selectedJob.jobDescription || '',
        requirements: selectedJob.requirements || '',
        expireAt: selectedJob.expireAt || '',
        talentCategoryIds: selectedJob.talentCategories?.map(tc => tc.id || 0) || [],
        levels: selectedJob.talentCategories?.map(tc => tc.level || 'Fresher') || []
      });
      setUpdateJobOpen(true);
    }
  };

  // Handle job creation
  const handleCreateJob = async () => {
    setCreateJobLoading(true);
    setCreateJobError('');
    setCreateJobSuccess('');
    
    try {
      const api = getJob();
      const res = await api.postApiV1Job(jobFormData);
      
      if (res.data) {
        setCreateJobSuccess('Job created successfully!');
        // Reset form
        setJobFormData({
          jobTitle: '',
          companyName: '',
          location: '',
          salary: '',
          jobDescription: '',
          requirements: '',
          expireAt: '',
          talentCategoryIds: [],
          levels: []
        });
        
        // Refresh jobs list
        const jobsRes = await api.getApiV1JobByUserTalent();
        const arr = jobsRes.data || [];
        setJobs(arr);
        setSelectedJob(arr[0] || null);
        
        // Close dialog after a short delay
        setTimeout(() => {
          setCreateJobOpen(false);
          setCreateJobSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setCreateJobError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setCreateJobLoading(false);
    }
  };

  // Handle form field changes
  const handleFormChange = (field: keyof JobRequestDTO, value: any) => {
    setJobFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: number, level: string) => {
    setJobFormData(prev => {
      const existingIndex = prev.talentCategoryIds?.indexOf(categoryId) ?? -1;
      
      if (existingIndex >= 0) {
        // Update existing category level
        const newLevels = [...(prev.levels || [])];
        newLevels[existingIndex] = level;
        return { ...prev, levels: newLevels };
      } else {
        // Add new category
        const newCategoryIds = [...(prev.talentCategoryIds || []), categoryId];
        const newLevels = [...(prev.levels || []), level];
        return { ...prev, talentCategoryIds: newCategoryIds, levels: newLevels };
      }
    });
  };

  // Remove category
  const removeCategory = (categoryId: number) => {
    setJobFormData(prev => {
      const index = prev.talentCategoryIds?.indexOf(categoryId) ?? -1;
      if (index >= 0) {
        const newCategoryIds = prev.talentCategoryIds?.filter((_, i) => i !== index) || [];
        const newLevels = prev.levels?.filter((_, i) => i !== index) || [];
        return { ...prev, talentCategoryIds: newCategoryIds, levels: newLevels };
      }
      return prev;
    });
  };

  // Handle job update
  const handleUpdateJobSubmit = async () => {
    if (!selectedJob) return;
    
    setUpdateJobLoading(true);
    setUpdateJobError('');
    setUpdateJobSuccess('');
    
    try {
      const api = getJob();
      const res = await api.patchApiV1JobId(selectedJob.jobId || 0, updateJobFormData);
      
      if (res.data) {
        setUpdateJobSuccess('Job updated successfully!');
        
        // Refresh jobs list
        const jobsRes = await api.getApiV1JobByUserTalent();
        const arr = jobsRes.data || [];
        setJobs(arr);
        
        // Update selected job with new data
        const updatedJob = arr.find(job => job.jobId === selectedJob.jobId);
        setSelectedJob(updatedJob || null);
        
        // Close dialog after a short delay
        setTimeout(() => {
          setUpdateJobOpen(false);
          setUpdateJobSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setUpdateJobError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setUpdateJobLoading(false);
    }
  };

  // Handle update form field changes
  const handleUpdateFormChange = (field: keyof JobRequestDTO, value: any) => {
    setUpdateJobFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle update category selection
  const handleUpdateCategoryChange = (categoryId: number, level: string) => {
    setUpdateJobFormData(prev => {
      const existingIndex = prev.talentCategoryIds?.indexOf(categoryId) ?? -1;
      
      if (existingIndex >= 0) {
        // Update existing category level
        const newLevels = [...(prev.levels || [])];
        newLevels[existingIndex] = level;
        return { ...prev, levels: newLevels };
      } else {
        // Add new category
        const newCategoryIds = [...(prev.talentCategoryIds || []), categoryId];
        const newLevels = [...(prev.levels || []), level];
        return { ...prev, talentCategoryIds: newCategoryIds, levels: newLevels };
      }
    });
  };

  // Remove category from update form
  const removeUpdateCategory = (categoryId: number) => {
    setUpdateJobFormData(prev => {
      const index = prev.talentCategoryIds?.indexOf(categoryId) ?? -1;
      if (index >= 0) {
        const newCategoryIds = prev.talentCategoryIds?.filter((_, i) => i !== index) || [];
        const newLevels = prev.levels?.filter((_, i) => i !== index) || [];
        return { ...prev, talentCategoryIds: newCategoryIds, levels: newLevels };
      }
      return prev;
    });
  };

  // Handle job application
  const handleApplyJob = async () => {
    if (!selectedJob?.jobId) return;
    
    setApplyLoading(true);
    setApplyError('');
    setApplySuccess('');
    
    try {
      const api = getJobApplication();
      const applicationData: JobApplicationRequestDTO = {
        jobId: selectedJob.jobId,
        coverLetter: applyFormData.coverLetter,
        resumeUrl: applyFormData.resumeUrl
      };
      
      const res = await api.postApiV1JobApplicationApply(applicationData);
      
      if (res.data) {
        setApplySuccess('Application submitted successfully!');
        
        // Reset form
        setApplyFormData({
          jobId: undefined,
          coverLetter: '',
          resumeUrl: ''
        });
        
        // Refresh applications list to update button state
        await checkJobApplications();
        
        // Close dialog and clear success message after a delay
        setTimeout(() => {
          setApplyDialogOpen(false);
          setApplySuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setApplyError(err.response?.data?.message || 'Failed to submit application');
      
      // Clear error message after a delay
      setTimeout(() => {
        setApplyError('');
      }, 3000);
    } finally {
      setApplyLoading(false);
    }
  };

  // Check if user has applied to jobs
  const checkJobApplications = async () => {
    if (!jobs.length) return;
    
    try {
      const api = getJobApplication();
      const applicationPromises = jobs.map(async (job) => {
        if (!job.jobId) return;
        try {
          const res = await api.getApiV1JobApplicationJobJobIdHasApplied(job.jobId);
          return { jobId: job.jobId, hasApplied: res.data || false };
        } catch (err) {
          return { jobId: job.jobId, hasApplied: false };
        }
      });
      
      const results = await Promise.all(applicationPromises);
      const applicationsMap: {[jobId: number]: boolean} = {};
      
      results.forEach(result => {
        if (result) {
          applicationsMap[result.jobId] = result.hasApplied;
        }
      });
      
      setJobApplications(applicationsMap);
    } catch (err) {
      console.error('Failed to check job applications:', err);
    }
  };

  // Fetch applicants for a job
  const fetchApplicants = async (jobId: number) => {
    setApplicantsLoading(true);
    setApplicantsError('');
    
    try {
      const api = getJobApplication();
      const res = await api.getApiV1JobApplicationJobJobIdApplications(jobId);
      const applicantsList = res.data || [];
      setApplicants(applicantsList);
    } catch (err: any) {
      setApplicantsError(err.response?.data?.message || 'Failed to load applicants');
    } finally {
      setApplicantsLoading(false);
    }
  };

  // Handle view applicants
  const handleViewApplicants = () => {
    if (selectedJob?.jobId) {
      fetchApplicants(selectedJob.jobId);
      setApplicantsDialogOpen(true);
    }
  };

  // Fetch categories for job creation
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const api = getCategory();
        const res = await api.getApiV1Category();
        let cats = Array.isArray(res.data) ? res.data : (res.data && Array.isArray((res.data as any).items) ? (res.data as any).items : []);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const api = getJob();
        const res = await api.getApiV1JobByUserTalent();
        const arr = res.data || [];
        setJobs(arr);
        setSelectedJob(arr[0] || null);
      } catch (e) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Check job applications when jobs are loaded
  useEffect(() => {
    if (jobs.length > 0) {
      checkJobApplications();
    }
  }, [jobs]);

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, height: { md: "calc(100vh - 80px)" }, bgcolor: "#f4f6f8", position: 'relative' }}>
      {/* Left: Job List */}
      <Box sx={{ width: { xs: "100%", md: 420 }, borderRight: { md: "1px solid #e0e0e0" }, bgcolor: "white", height: { md: "100%" }, overflowY: "auto" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={0.5}>Top job picks for you</Typography>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Based on your profile, preferences, and activity like applies, searches, and saves
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}><b>{jobs.length} results</b></Typography>
            </Box>
          </Box>
            <Button 
              variant="contained" 
              color="primary" 
              size="small" 
              startIcon={<AddIcon />} 
              onClick={() => setCreateJobOpen(true)} 
              sx={{ minWidth: 100, px: 1.5, py: 0.5, fontSize: 14 }}
            >
              Create New Job
            </Button>
        </Box>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading jobs...</Typography></Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>
        ) : (
          <List sx={{ p: 0 }}>
            {jobs.map(job => (
              <ListItem key={job.jobId} alignItems="flex-start" disablePadding>
                <ListItemButton
                  selected={selectedJob?.jobId === job.jobId}
                  onClick={() => setSelectedJob(job)}
                  sx={{
                    bgcolor: selectedJob?.jobId === job.jobId ? "#eaf1fb" : "inherit",
                    borderLeft: selectedJob?.jobId === job.jobId ? "4px solid #0a66c2" : "4px solid transparent",
                    mb: 0.5,
                    borderRadius: 2,
                    transition: "background 0.2s, border 0.2s",
                    px: 1.5,
                    py: 1.2,
                    position: 'relative',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={undefined} sx={{ width: 48, height: 48, mr: 1 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight="bold" fontSize={16} color="#0a66c2" sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{job.jobTitle}</Typography>
                        {isJobExpired(job) && (
                          <Chip 
                            label="Expired" 
                            size="small" 
                            color="error" 
                            variant="outlined"
                            sx={{ fontSize: 10, height: 20 }}
                          />
                        )}
                        {hasAppliedToJob(job.jobId || 0) && (
                          <Chip 
                            label="Applied" 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ fontSize: 10, height: 20 }}
                          />
                        )}
                      </Box>
                      <Typography fontSize={14} color="text.secondary">{job.companyName}</Typography>
                    </>}
                    secondary={<>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: '#666' }}>{job.location}</span>
                      </span>
                      <span style={{ 
                        fontSize: 12, 
                        color: isJobExpired(job) ? '#d32f2f' : '#888', 
                        display: 'block',
                        fontWeight: isJobExpired(job) ? 'bold' : 'normal'
                      }}>
                        {job.expireAt ? `Expires at: ${formatDate(job.expireAt)}${isJobExpired(job) ? ' (EXPIRED)' : ''}` : ''}
                      </span>
                    </>}
                  />
                  {/* Nút X xoá job */}

                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      {/* Right: Job Detail */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflowY: "auto" }}>
        {selectedJob ? (
          <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 700, mx: "auto", boxShadow: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar src={undefined} sx={{ width: 56, height: 56 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">{selectedJob.jobTitle}</Typography>
                <Typography variant="subtitle1" color="text.secondary">{selectedJob.companyName} • {selectedJob.location}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedJob.expireAt ? `Expires at: ${formatDate(selectedJob.expireAt)}${isJobExpired(selectedJob) ? ' (EXPIRED)' : ''}` : ''}
                </Typography>
                {isJobExpired(selectedJob) && (
                  <Chip 
                    label="This job has expired" 
                    size="small" 
                    color="error" 
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
              <Box flex={1} />
              {selectedJob && isJobCreator(selectedJob) ? (
                // Job creator sees "View Applicants" button
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ minWidth: 140 }}
                  startIcon={<PeopleIcon />}
                  onClick={handleViewApplicants}
                >
                  View Applicants
                </Button>
              ) : (
                // Job applicant sees "Apply" button or "Alter CV" button
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ minWidth: 120 }}
                  onClick={() => {
                    if (selectedJob && !hasAppliedToJob(selectedJob.jobId || 0)) {
                      // User hasn't applied - show apply dialog
                      setApplyFormData({
                        jobId: selectedJob?.jobId,
                        coverLetter: '',
                        resumeUrl: ''
                      });
                      setApplyDialogOpen(true);
                    }
                  }}
                  disabled={selectedJob ? (isJobExpired(selectedJob) || hasAppliedToJob(selectedJob.jobId || 0) || applyLoading) : false}
                  startIcon={applyLoading ? <CircularProgress size={16} /> : null}
                >
                  {selectedJob && isJobExpired(selectedJob) ? 'Expired' : 
                   selectedJob && hasAppliedToJob(selectedJob.jobId || 0) ? 'Applied' :
                   applyLoading ? 'Processing...' : 'Apply'}
                </Button>
              )}
              
              <IconButton
                size="small"
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ 
                  display: selectedJob && isJobCreator(selectedJob) ? 'flex' : 'none'
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Stack>
            <Divider sx={{ my: 2 }} />
            
            {/* Application feedback messages */}
            {applyError && (
              <Alert severity="error" sx={{ mb: 2 }}>{applyError}</Alert>
            )}
            {applySuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>{applySuccess}</Alert>
            )}
            
            <Typography mb={2}>{selectedJob.jobDescription}</Typography>
            <Typography variant="h6" fontWeight="bold" mb={1}>What You'll Bring</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {(selectedJob.requirements ? selectedJob.requirements.split('\n') : []).map((req, idx) => (
                <li key={idx}>
                  <Typography>{req}</Typography>
                </li>
              ))}
            </ul>
          </Paper>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Select a job to view details</Typography></Box>
        )}
      </Box>

      {/* Create Job Dialog */}
      <Dialog 
        open={createJobOpen} 
        onClose={() => setCreateJobOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Create New Job
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Fill in the details to create a new job posting
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {createJobError && (
            <Alert severity="error" sx={{ mb: 2 }}>{createJobError}</Alert>
          )}
          {createJobSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{createJobSuccess}</Alert>
          )}
          
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Job Title"
                fullWidth
                value={jobFormData.jobTitle || ''}
                onChange={(e) => handleFormChange('jobTitle', e.target.value)}
                required
              />
              <TextField
                label="Company Name"
                fullWidth
                value={jobFormData.companyName || ''}
                onChange={(e) => handleFormChange('companyName', e.target.value)}
                required
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Location"
                fullWidth
                value={jobFormData.location || ''}
                onChange={(e) => handleFormChange('location', e.target.value)}
                required
              />
              <TextField
                label="Salary"
                fullWidth
                value={jobFormData.salary || ''}
                onChange={(e) => handleFormChange('salary', e.target.value)}
                placeholder="e.g., $50,000 - $70,000"
              />
            </Box>
            
            <TextField
              label="Job Description"
              multiline
              rows={4}
              fullWidth
              value={jobFormData.jobDescription || ''}
              onChange={(e) => handleFormChange('jobDescription', e.target.value)}
              required
            />
            
            <TextField
              label="Requirements"
              multiline
              rows={3}
              fullWidth
              value={jobFormData.requirements || ''}
              onChange={(e) => handleFormChange('requirements', e.target.value)}
              placeholder="Enter requirements, one per line"
            />
            
            <TextField
              label="Expiry Date"
              type="date"
              fullWidth
              value={jobFormData.expireAt || ''}
              onChange={(e) => handleFormChange('expireAt', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            
            {/* Talent Categories */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>Required Skills</Typography>
              
              {/* Selected categories */}
              <Box sx={{ mb: 2 }}>
                {jobFormData.talentCategoryIds?.map((categoryId, index) => {
                  const category = categories.find(c => c.id === categoryId);
                  const level = jobFormData.levels?.[index] || '';
                  return (
                    <Chip
                      key={categoryId}
                      label={`${category?.name || 'Unknown'} (${level})`}
                      onDelete={() => removeCategory(categoryId)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  );
                })}
              </Box>
              
              {/* Add new category */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Select Skill</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => {
                      const categoryId = Number(e.target.value);
                      if (categoryId && !jobFormData.talentCategoryIds?.includes(categoryId)) {
                        handleCategoryChange(categoryId, 'Fresher');
                      }
                    }}
                    label="Select Skill"
                  >
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => {
                      // This will be handled when a category is selected
                    }}
                    label="Level"
                    disabled
                  >
                    <MenuItem value="Fresher">Fresher</MenuItem>
                    <MenuItem value="Junior">Junior</MenuItem>
                    <MenuItem value="Middle">Middle</MenuItem>
                    <MenuItem value="Senior">Senior</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              {/* Skill level management */}
              {jobFormData.talentCategoryIds && jobFormData.talentCategoryIds.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>Manage Skill Levels</Typography>
                  <Stack spacing={1}>
                    {jobFormData.talentCategoryIds.map((categoryId, index) => {
                      const category = categories.find(c => c.id === categoryId);
                      const level = jobFormData.levels?.[index] || 'Fresher';
                      return (
                        <Box key={categoryId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                            {category?.name || 'Unknown'}:
                          </Typography>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={level}
                              onChange={(e) => {
                                const newLevel = e.target.value;
                                setJobFormData(prev => {
                                  const newLevels = [...(prev.levels || [])];
                                  newLevels[index] = newLevel;
                                  return { ...prev, levels: newLevels };
                                });
                              }}
                            >
                              <MenuItem value="Fresher">Fresher</MenuItem>
                              <MenuItem value="Junior">Junior</MenuItem>
                              <MenuItem value="Middle">Middle</MenuItem>
                              <MenuItem value="Senior">Senior</MenuItem>
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removeCategory(categoryId)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            Remove
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setCreateJobOpen(false)} 
            color="secondary"
            disabled={createJobLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateJob} 
            variant="contained" 
            color="primary"
            disabled={createJobLoading || !jobFormData.jobTitle || !jobFormData.companyName || !jobFormData.location || !jobFormData.jobDescription}
            startIcon={createJobLoading ? <CircularProgress size={16} /> : null}
          >
            {createJobLoading ? 'Creating...' : 'Create Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Job Dialog */}
      <Dialog 
        open={updateJobOpen} 
        onClose={() => setUpdateJobOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Update Job
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Update the job details
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {updateJobError && (
            <Alert severity="error" sx={{ mb: 2 }}>{updateJobError}</Alert>
          )}
          {updateJobSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{updateJobSuccess}</Alert>
          )}
          
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Job Title"
                fullWidth
                value={updateJobFormData.jobTitle || ''}
                onChange={(e) => handleUpdateFormChange('jobTitle', e.target.value)}
                required
                disabled={updateJobLoading}
              />
              <TextField
                label="Company Name"
                fullWidth
                value={updateJobFormData.companyName || ''}
                onChange={(e) => handleUpdateFormChange('companyName', e.target.value)}
                required
                disabled={updateJobLoading}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Location"
                fullWidth
                value={updateJobFormData.location || ''}
                onChange={(e) => handleUpdateFormChange('location', e.target.value)}
                required
                disabled={updateJobLoading}
              />
              <TextField
                label="Salary"
                fullWidth
                value={updateJobFormData.salary || ''}
                onChange={(e) => handleUpdateFormChange('salary', e.target.value)}
                placeholder="e.g., $50,000 - $70,000"
                disabled={updateJobLoading}
              />
            </Box>
            
            <TextField
              label="Job Description"
              multiline
              rows={4}
              fullWidth
              value={updateJobFormData.jobDescription || ''}
              onChange={(e) => handleUpdateFormChange('jobDescription', e.target.value)}
              required
              disabled={updateJobLoading}
            />
            
            <TextField
              label="Requirements"
              multiline
              rows={3}
              fullWidth
              value={updateJobFormData.requirements || ''}
              onChange={(e) => handleUpdateFormChange('requirements', e.target.value)}
              placeholder="Enter requirements, one per line"
              disabled={updateJobLoading}
            />
            
            <TextField
              label="Expiry Date"
              type="date"
              fullWidth
              value={updateJobFormData.expireAt || ''}
              onChange={(e) => handleUpdateFormChange('expireAt', e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={updateJobLoading}
            />
            
            {/* Talent Categories */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>Required Skills</Typography>
              
              {/* Selected categories */}
              <Box sx={{ mb: 2 }}>
                {updateJobFormData.talentCategoryIds?.map((categoryId, index) => {
                  const category = categories.find(c => c.id === categoryId);
                  const level = updateJobFormData.levels?.[index] || '';
                  return (
                    <Chip
                      key={categoryId}
                      label={`${category?.name || 'Unknown'} (${level})`}
                      onDelete={updateJobLoading ? undefined : () => removeUpdateCategory(categoryId)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  );
                })}
              </Box>
              
              {/* Add new category */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 200 }} disabled={updateJobLoading}>
                  <InputLabel>Select Skill</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => {
                      const categoryId = Number(e.target.value);
                      if (categoryId && !updateJobFormData.talentCategoryIds?.includes(categoryId)) {
                        handleUpdateCategoryChange(categoryId, 'Fresher');
                      }
                    }}
                    label="Select Skill"
                  >
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 120 }} disabled={updateJobLoading}>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => {
                      // This will be handled when a category is selected
                    }}
                    label="Level"
                    disabled
                  >
                    <MenuItem value="Fresher">Fresher</MenuItem>
                    <MenuItem value="Junior">Junior</MenuItem>
                    <MenuItem value="Middle">Middle</MenuItem>
                    <MenuItem value="Senior">Senior</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              {/* Skill level management */}
              {updateJobFormData.talentCategoryIds && updateJobFormData.talentCategoryIds.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>Manage Skill Levels</Typography>
                  <Stack spacing={1}>
                    {updateJobFormData.talentCategoryIds.map((categoryId, index) => {
                      const category = categories.find(c => c.id === categoryId);
                      const level = updateJobFormData.levels?.[index] || 'Fresher';
                      return (
                        <Box key={categoryId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                            {category?.name || 'Unknown'}:
                          </Typography>
                          <FormControl size="small" sx={{ minWidth: 120 }} disabled={updateJobLoading}>
                            <Select
                              value={level}
                              onChange={(e) => {
                                const newLevel = e.target.value;
                                setUpdateJobFormData(prev => {
                                  const newLevels = [...(prev.levels || [])];
                                  newLevels[index] = newLevel;
                                  return { ...prev, levels: newLevels };
                                });
                              }}
                            >
                              <MenuItem value="Fresher">Fresher</MenuItem>
                              <MenuItem value="Junior">Junior</MenuItem>
                              <MenuItem value="Middle">Middle</MenuItem>
                              <MenuItem value="Senior">Senior</MenuItem>
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removeUpdateCategory(categoryId)}
                            sx={{ minWidth: 'auto', px: 1 }}
                            disabled={updateJobLoading}
                          >
                            Remove
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setUpdateJobOpen(false)} 
            color="secondary"
            disabled={updateJobLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateJobSubmit} 
            variant="contained" 
            color="primary"
            disabled={updateJobLoading || !updateJobFormData.jobTitle || !updateJobFormData.companyName || !updateJobFormData.location || !updateJobFormData.jobDescription}
            startIcon={updateJobLoading ? <CircularProgress size={16} /> : null}
          >
            {updateJobLoading ? 'Updating...' : 'Update Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleUpdateJob}>Update</MenuItem>
      </Menu>

      {/* Apply Job Dialog */}
      <Dialog 
        open={applyDialogOpen} 
        onClose={() => {
          setApplyDialogOpen(false);
          setApplyFormData({
            jobId: undefined,
            coverLetter: '',
            resumeUrl: ''
          });
          setApplyError('');
          setApplySuccess('');
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Apply for Job
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Submit your application for this position
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {applyError && (
            <Alert severity="error" sx={{ mb: 2 }}>{applyError}</Alert>
          )}
          {applySuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{applySuccess}</Alert>
          )}
          
          <Stack spacing={3}>
            <TextField
              label="Cover Letter"
              multiline
              rows={4}
              fullWidth
              value={applyFormData.coverLetter}
              onChange={(e) => setApplyFormData({ ...applyFormData, coverLetter: e.target.value })}
              placeholder="Write a compelling cover letter explaining why you're a great fit for this position..."
              required
            />
            <TextField
              label="Resume URL"
              fullWidth
              value={applyFormData.resumeUrl}
              onChange={(e) => setApplyFormData({ ...applyFormData, resumeUrl: e.target.value })}
              placeholder="https://example.com/your-resume.pdf"
              required
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setApplyDialogOpen(false)} disabled={applyLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleApplyJob} 
            variant="contained" 
            disabled={applyLoading || !applyFormData.coverLetter || !applyFormData.resumeUrl}
            startIcon={applyLoading ? <CircularProgress size={16} /> : null}
          >
            {applyLoading ? 'Applying...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applicants Dialog */}
      <Dialog
        open={applicantsDialogOpen}
        onClose={() => {
          setApplicantsDialogOpen(false);
          setApplicants([]);
          setApplicantsError('');
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Applicants for {selectedJob?.jobTitle}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {applicantsError && (
            <Alert severity="error" sx={{ mb: 2 }}>{applicantsError}</Alert>
          )}
          
          {applicantsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : applicants.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No applicants yet</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {applicants.map((applicant, index) => (
                <Paper key={applicant.applicationId || index} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {applicant.applicantName || 'Unknown Applicant'}
                      </Typography>
                      <Chip 
                        label={applicant.status !== undefined ? 
                          (applicant.status === 1 ? 'Approved' : 
                           applicant.status === 2 ? 'Rejected' : 'Pending') : 'Pending'} 
                        color={applicant.status === 1 ? 'success' : 
                               applicant.status === 2 ? 'error' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Applied on: {applicant.appliedAt ? formatDate(applicant.appliedAt) : 'Unknown date'}
                    </Typography>
                    
                    {applicant.coverLetter && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                          Cover Letter:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          bgcolor: '#f5f5f5', 
                          p: 1.5, 
                          borderRadius: 1,
                          maxHeight: 100,
                          overflow: 'auto'
                        }}>
                          {applicant.coverLetter}
                        </Typography>
                      </Box>
                    )}
                    
                    {applicant.resumeUrl && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                          Resume:
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          href={applicant.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Resume
                        </Button>
                      </Box>
                    )}
                    
                    {applicant.applicantEmail && (
                      <Typography variant="body2">
                        <strong>Email:</strong> {applicant.applicantEmail}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setApplicantsDialogOpen(false);
              setApplicants([]);
              setApplicantsError('');
            }}
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 