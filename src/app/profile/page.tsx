'use client';

import { Container, Grid, Paper, Typography, Box, Button, Avatar } from '@mui/material';

export default function ProfilePage() {
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://source.unsplash.com/random/200x200?portrait',
    bio: 'Professional dancer with a passion for contemporary art.',
    skills: ['Dancing', 'Choreography', 'Teaching'],
    experience: [
      {
        title: 'Lead Dancer',
        company: 'Modern Dance Company',
        period: '2020 - Present'
      },
      {
        title: 'Dance Instructor',
        company: 'Arts Academy',
        period: '2018 - 2020'
      }
    ]
  };

  return (
    <Container maxWidth="lg" className="py-12">
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} className="p-6">
            <Box className="flex flex-col items-center">
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{ width: 120, height: 120 }}
                className="mb-4"
              />
              <Typography variant="h4" component="h1" className="mb-2">
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" className="mb-4">
                {user.email}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                className="mb-4"
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} className="p-6 mb-4">
            <Typography variant="h5" className="mb-4">
              About
            </Typography>
            <Typography variant="body1" className="mb-6">
              {user.bio}
            </Typography>

            <Typography variant="h5" className="mb-4">
              Skills
            </Typography>
            <Box className="flex flex-wrap gap-2 mb-6">
              {user.skills.map((skill, index) => (
                <Paper
                  key={index}
                  elevation={1}
                  className="px-3 py-1 bg-primary/10"
                >
                  <Typography variant="body2">{skill}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>

          <Paper elevation={3} className="p-6">
            <Typography variant="h5" className="mb-4">
              Experience
            </Typography>
            {user.experience.map((exp, index) => (
              <Box key={index} className="mb-4">
                <Typography variant="h6">{exp.title}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {exp.company}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {exp.period}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 