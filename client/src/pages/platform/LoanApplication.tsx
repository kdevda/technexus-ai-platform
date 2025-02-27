import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  MenuItem,
  Box 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const LoanApplication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    term: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle loan application submission
    navigate('/platform/dashboard');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Loan Application
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Loan Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                label="Loan Purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
              >
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="debt_consolidation">Debt Consolidation</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                label="Loan Term (months)"
                name="term"
                value={formData.term}
                onChange={handleChange}
              >
                <MenuItem value="12">12 months</MenuItem>
                <MenuItem value="24">24 months</MenuItem>
                <MenuItem value="36">36 months</MenuItem>
                <MenuItem value="48">48 months</MenuItem>
                <MenuItem value="60">60 months</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
              >
                Submit Application
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}; 