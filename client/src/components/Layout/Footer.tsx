import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

export const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'grey.200', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" href="/">
            TechNexus
          </Link>{' '}
          {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  );
}; 