'use client';

import { Container, Box, Typography, Paper, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useParams } from 'next/navigation';

// Mock data - in real app, this would come from an API
const talentDetails = {
  1: {
    name: 'John Doe',
    title: 'Professional Dancer',
    image: 'https://source.unsplash.com/random/800x400?dance',
    description: 'Contemporary dancer with 10 years of experience',
    bio: 'John is a passionate contemporary dancer who has performed in numerous international festivals. His unique style combines traditional and modern dance techniques.',
    skills: ['Contemporary Dance', 'Ballet', 'Choreography', 'Dance Teaching'],
    achievements: [
      'First Place in International Dance Competition 2022',
      'Featured Performer at Dance Festival 2021',
      'Guest Choreographer at National Ballet'
    ]
  }
};

export default function TalentDetailPage() {
  const params = useParams();
  const talentId = Number(params.id);
  const key = String(talentId) as unknown as keyof typeof talentDetails;
  const talent = Object.prototype.hasOwnProperty.call(talentDetails, key) ? talentDetails[key] : undefined;

  if (!talent) {
    return (
      <Container maxWidth="lg" className="py-12">
        <Typography variant="h4">Talent not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-12">
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} className="p-4">
            <Box className="aspect-w-1 aspect-h-1 mb-4">
              <img
                src={talent.image}
                alt={talent.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </Box>
            <Typography variant="h4" component="h1" className="mb-2">
              {talent.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" className="mb-4">
              {talent.title}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className="mb-4"
            >
              Contact
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} className="p-6">
            <Typography variant="h5" className="mb-4">
              About
            </Typography>
            <Typography variant="body1" className="mb-6">
              {talent.bio}
            </Typography>

            <Typography variant="h5" className="mb-4">
              Skills
            </Typography>
            <Box className="flex flex-wrap gap-2 mb-6">
              {talent.skills.map((skill, index) => (
                <Paper
                  key={index}
                  elevation={1}
                  className="px-3 py-1 bg-primary/10"
                >
                  <Typography variant="body2">{skill}</Typography>
                </Paper>
              ))}
            </Box>

            <Typography variant="h5" className="mb-4">
              Achievements
            </Typography>
            <ul className="list-disc pl-6 space-y-2">
              {talent.achievements.map((achievement, index) => (
                <li key={index}>
                  <Typography variant="body1">{achievement}</Typography>
                </li>
              ))}
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 