'use client';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ProfileCard from './components/ProfileCard';
import ShareBox from './components/ShareBox';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import WhoToFollow from './components/WhoToFollow';
import News from './components/News';

const FeedProvider = dynamic(() => import('./components/Feed'), { ssr: false });

export default function Home() {

  

  return (
    <Container maxWidth="xl" className="py-8">
      <Grid container spacing={4} columns={12}>
        {/* Left Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <div className="sticky top-4">
            <ProfileCard />
          </div>
        </Grid>
        {/* Main Content */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Suspense fallback={<div style={{textAlign:'center',padding:'2rem'}}><span>Loading feed...</span></div>}>
            <FeedProvider>
              <ShareBox />
            </FeedProvider>
          </Suspense>
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
