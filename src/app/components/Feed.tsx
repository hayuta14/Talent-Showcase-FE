import { useEffect, useRef, useState, createContext, useContext } from 'react';
import { Avatar, Box, Typography, Paper, Stack, CircularProgress } from '@mui/material';

const allPosts = Array.from({ length: 50 }).map((_, idx) => ({
  user: `User ${idx + 1}`,
  avatar: `https://randomuser.me/api/portraits/men/${30 + (idx % 20)}.jpg`,
  time: `${2 + idx} hours ago`,
  job: 'Web Developer at StackBros',
  content: `This is a fake post number ${idx + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  image: idx % 3 === 0 ? `https://picsum.photos/seed/${idx}/400/200` : undefined,
}));

const PAGE_SIZE = 10;

export const FeedContext = createContext({
  addPost: (post: any) => {},
});

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState(allPosts.slice(0, PAGE_SIZE));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loader = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loader.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLoading(true);
          setTimeout(() => {
            setPosts((prev) => [
              ...prev,
              ...allPosts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
            ]);
            setPage((p) => p + 1);
            setLoading(false);
          }, 700);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [loader, loading, page]);

  const addPost = (post: any) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <FeedContext.Provider value={{ addPost }}>
      {children}
      <FeedInner posts={posts} loader={loader} loading={loading} />
    </FeedContext.Provider>
  );
}

function FeedInner({ posts, loader, loading }: { posts: any[]; loader: any; loading: boolean }) {
  return (
    <Stack spacing={3}>
      {posts.map((post, idx) => (
        <Paper key={idx} className="p-4 rounded-xl shadow">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={post.avatar} />
            <Box>
              <Typography variant="subtitle1" className="font-bold">{post.user}</Typography>
              <Typography variant="caption" color="text.secondary">{post.job} • {post.time}</Typography>
            </Box>
          </Stack>
          <Typography className="mt-3 mb-2">{post.content}</Typography>
          {post.image && (
            <Box className="rounded-lg overflow-hidden">
              <img src={post.image} alt="post" className="w-full h-60 object-cover" />
            </Box>
          )}
        </Paper>
      ))}
      <div ref={loader} />
      {loading && <Box className="flex justify-center"><CircularProgress /></Box>}
    </Stack>
  );
}

export default FeedProvider; 