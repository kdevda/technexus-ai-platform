import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom>About TechNexus</Typography>
      <Typography paragraph>
        Your company description and mission statement...
      </Typography>
    </Container>
  );
}; 