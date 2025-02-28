import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, features }) => (
  <Paper sx={{ p: 3, height: '100%' }}>
    <Typography variant="h5" gutterBottom>
      {title}
    </Typography>
    <Typography paragraph>
      {description}
    </Typography>
    <Box>
      {features.map((feature: string, index: number) => (
        <Typography key={index} variant="body2" sx={{ mt: 1 }}>
          • {feature}
        </Typography>
      ))}
    </Box>
  </Paper>
);

export const Services = () => {
  const services = [
    {
      title: 'Business Loans',
      description: 'Flexible financing solutions for your business growth',
      features: [
        'Quick approval process',
        'Competitive interest rates',
        'Flexible repayment terms',
        'No collateral required for qualified businesses'
      ]
    },
    {
      title: 'Personal Loans',
      description: 'Tailored personal financing solutions for your needs',
      features: [
        'Instant eligibility check',
        'Transparent fee structure',
        'Quick disbursement',
        'Multiple tenure options'
      ]
    },
    {
      title: 'Education Loans',
      description: 'Invest in your future with our education financing',
      features: [
        'Special rates for students',
        'Extended repayment period',
        'Grace period after course completion',
        'Cover tuition and living expenses'
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Our Services
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Discover our range of AI-powered lending solutions
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {services.map((service, index) => (
          <Grid item xs={12} md={4} key={index}>
            <ServiceCard {...service} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                AI-Powered Decision Making
              </Typography>
              <Typography>
                Our advanced AI algorithms analyze multiple data points to provide 
                fair and accurate loan decisions within minutes.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Transparent Process
              </Typography>
              <Typography>
                Clear terms, no hidden fees, and a straightforward application 
                process make borrowing stress-free.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 