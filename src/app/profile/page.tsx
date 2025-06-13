'use client';

import { Container, Box, Paper, Typography, Button, Avatar } from '@mui/material';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 4 }}>
        <Box sx={{ gridColumn: { md: 'span 4' } }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {user.email}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ gridColumn: { md: 'span 8' } }}>
          <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              About
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {user.bio}
            </Typography>

            <Typography variant="h5" sx={{ mb: 2 }}>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {user.skills.map((skill, index) => (
                <Paper
                  key={index}
                  elevation={1}
                  sx={{ px: 1.5, py: 0.5, bgcolor: 'primary.main', opacity: 0.1 }}
                >
                  <Typography variant="body2">{skill}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Experience
            </Typography>
            {user.experience.map((exp, index) => (
              <Box key={index} sx={{ mb: 2 }}>
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
        </Box>
      </Box>
    </Container>
  );
}