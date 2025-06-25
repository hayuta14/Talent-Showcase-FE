import { useState, useRef, useEffect } from 'react';
import { Button, TextField, CircularProgress, Alert, MenuItem, Checkbox, FormControlLabel, Select, InputLabel, FormControl, Avatar, IconButton, Tooltip } from '@mui/material';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CategoryIcon from '@mui/icons-material/Category';
import PublicIcon from '@mui/icons-material/Public';
import SendIcon from '@mui/icons-material/Send';
import { getPost } from '@/generated/api/endpoints/post/post';
import { getMedia } from '@/generated/api/endpoints/media/media';
import { useUserStore } from '@/stores/useUserStore';
import { getCategory } from '@/generated/api/endpoints/category/category';
import { useAuthStore } from '@/stores/authStore';

export default function ShareBox() {
  const user = useUserStore(s => s.user);
  const userImageUrl = useAuthStore(s => s.user?.userImageUrl);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(1); // default category
  const [isPublic, setIsPublic] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<{id:number, name:string}[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const api = getCategory();
        const res = await api.getApiV1Category();
        let cats = Array.isArray(res.data) ? res.data : (res.data && Array.isArray((res.data as any).items) ? (res.data as any).items : []);
        setCategories(cats);
        // Set default categoryId to first category if not set
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }
      } catch {}
    };
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload video
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const api = getMedia();
      const res = await api.postApiMediaUploadVideo({ file });
      const url = (res as any)?.url || (res as any)?.data?.url || '';
      if (url) setVideoUrl(url);
      else setError('No video URL returned');
    } catch {
      setError('Upload video failed');
    } finally {
      setUploading(false);
    }
  };

  // Tạo post
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const api = getPost();
      const postData: any = {
        categoryId,
        description,
        isPublic,
        videoUrl: videoUrl || '',
      };
      await api.postApiV1Post(postData);
      setSuccess('Post created successfully!');
      setDescription('');
      setVideoUrl(null);
      setCategoryId(1);
      setIsPublic(true);
      setShowOptions(false);
    } catch {
      setError('Create post failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => setShowOptions(true);
  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (
        !inputRef.current?.contains(active as Node) &&
        !document.querySelector('.sharebox-options')?.contains(active) &&
        !description
      ) {
        setShowOptions(false);
      }
    }, 100);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow flex flex-col gap-3">
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <div className="flex items-start gap-3">
        <Avatar
          src={userImageUrl || undefined}
          alt={user?.username || user?.email || 'User'}
          sx={{ width: 48, height: 48 }}
        >
          {(!userImageUrl && (user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase())}
        </Avatar>
        <div className="flex-1">
          <TextField
            label={`What's on your mind, ${user?.username || user?.email || ''}?`}
            multiline
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            onFocus={handleFocus}
            inputRef={inputRef}
            onBlur={handleBlur}
            fullWidth
          />
          {(showOptions || description) && (
            <div className="sharebox-options flex flex-col gap-2 mt-2 border-t pt-3" onBlur={handleBlur} tabIndex={-1}>
              <div className="flex items-center w-full">
                <div className="flex gap-2 items-center">
                  <Tooltip title="Upload Video">
                    <span>
                      <IconButton component="label" disabled={uploading} color="primary" sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3e3e3' } }}>
                        <VideoLibraryIcon />
                        <input type="file" accept="video/*" hidden onChange={handleVideoChange} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Category">
                    <FormControl size="small" className="min-w-[120px]">
                      <Select
                        value={categoryId || ''}
                        onChange={e => setCategoryId(Number(e.target.value))}
                        displayEmpty
                        renderValue={selected => {
                          if (!selected) {
                            return <span style={{ color: '#aaa' }}>Choose your category</span>;
                          }
                          const cat = categories.find(c => c.id === selected);
                          return cat ? cat.name : '';
                        }}
                      >
                        <MenuItem value="" disabled>Choose your category</MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Tooltip>
                  <Tooltip title="Public">
                    <FormControlLabel
                      control={<Checkbox checked={isPublic} onChange={e => setIsPublic(e.target.checked)} icon={<PublicIcon />} checkedIcon={<PublicIcon color="primary" />} />}
                      label=""
                    />
                  </Tooltip>
                  {uploading && <CircularProgress size={24} />}
                </div>
                <div className="flex-1" />
                <Tooltip title="Post">
                  <span>
                    <IconButton color="primary" onClick={handleSubmit} disabled={loading} sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3e3e3' } }}>
                      <SendIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </div>
              {videoUrl && <video src={videoUrl} controls className="max-h-40 rounded mt-2" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 