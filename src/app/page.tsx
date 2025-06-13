'use client';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ProfileCard from './components/ProfileCard';
import SidebarMenu from './components/SidebarMenu';
import Stories from './components/Stories';
import ShareBox from './components/ShareBox';
import FeedProvider from './components/Feed';
import WhoToFollow from './components/WhoToFollow';
import News from './components/News';

export default function Home() {
  const router = useRouter();
  

  return (
    <Container maxWidth="xl" className="py-8">
      <SidebarMenu />
      <Grid container spacing={4} columns={12}>
        {/* Left Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <div className="sticky top-4">
            <ProfileCard />
          </div>
        </Grid>
        {/* Main Content */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stories />
          <FeedProvider>
            <ShareBox />
          </FeedProvider>
        </Grid>
        {/* Right Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <div className="sticky top-4">
            <WhoToFollow />
            <News />
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}
