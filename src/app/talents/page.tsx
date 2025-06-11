'use client';

import { Container, Grid, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';

// Mock data
const talents = [
  {
    id: 1,
    name: 'John Doe',
    title: 'Professional Dancer',
    image: 'https://source.unsplash.com/random/300x200?dance',
    description: 'Contemporary dancer with 10 years of experience'
  },
  {
    id: 2,
    name: 'Jane Smith',
    title: 'Classical Musician',
    image: 'https://source.unsplash.com/random/300x200?music',
    description: 'Pianist specializing in classical compositions'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    title: 'Visual Artist',
    image: 'https://source.unsplash.com/random/300x200?art',
    description: 'Digital artist and illustrator'
  }
];

export default function TalentsPage() {
  return (
    <Container maxWidth="lg" className="py-12">
      <Typography variant="h3" component="h1" className="mb-8">
        Discover Talents
      </Typography>
      
      <Grid container spacing={4}>
        {talents.map((talent) => (
          <Grid item xs={12} sm={6} md={4} key={talent.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={talent.image}
                alt={talent.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {talent.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" className="mb-2">
                  {talent.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mb-4">
                  {talent.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  href={`/talents/${talent.id}`}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 