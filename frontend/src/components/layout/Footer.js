import React from 'react';
import { Box, Container, Typography, Link, IconButton, Divider, Grid } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        {/* eslint-disable-next-line */}
        <Grid container spacing={3}>
          {/* eslint-disable-next-line */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Student Mess Delivery
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Providing quality meals for students with convenient delivery and subscription options.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="primary" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
          
          {/* eslint-disable-next-line */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Useful Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="/" color="inherit" underline="hover" sx={{ mb: 1 }}>Home</Link>
              <Link href="/about" color="inherit" underline="hover" sx={{ mb: 1 }}>About Us</Link>
              <Link href="/providers" color="inherit" underline="hover" sx={{ mb: 1 }}>Providers</Link>
              <Link href="/faq" color="inherit" underline="hover" sx={{ mb: 1 }}>FAQ</Link>
              <Link href="/contact" color="inherit" underline="hover" sx={{ mb: 1 }}>Contact Us</Link>
            </Box>
          </Grid>
          
          {/* eslint-disable-next-line */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Personal Project
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Ranchi, Jharkhand
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Email: info@studentmess.com
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Phone: +91 9876543210
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 4, mb: 2 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}{' '}
          <Link color="inherit" href="/">
            Student Mess
          </Link>
          {' - All Rights Reserved.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 