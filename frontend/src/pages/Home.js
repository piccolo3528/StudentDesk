import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia,
  CardActions
} from '@mui/material';
import { 
  Restaurant as RestaurantIcon,
  School as SchoolIcon,
  VerifiedUser as VerifiedUserIcon,
  LocalShipping as DeliveryIcon,
  Star as StarIcon,
  QueryBuilder as TimerIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import useAuth from '../context/useAuth';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <RestaurantIcon fontSize="large" color="primary" />,
      title: 'Quality Meals',
      description: 'Enjoy nutritious and delicious home-style meals prepared by verified providers.'
    },
    {
      icon: <SchoolIcon fontSize="large" color="primary" />,
      title: 'Student Focused',
      description: 'Designed specifically for students who need convenient meal solutions.'
    },
    {
      icon: <VerifiedUserIcon fontSize="large" color="primary" />,
      title: 'Verified Providers',
      description: 'All meal providers undergo a verification process to ensure quality standards.'
    },
    {
      icon: <DeliveryIcon fontSize="large" color="primary" />,
      title: 'Reliable Delivery',
      description: 'Get your meals delivered on time, every time, right to your doorstep.'
    },
    {
      icon: <StarIcon fontSize="large" color="primary" />,
      title: 'Rating System',
      description: 'Rate your experience and help other students choose the best providers.'
    },
    {
      icon: <TimerIcon fontSize="large" color="primary" />,
      title: 'Flexible Plans',
      description: 'Choose from various subscription plans that fit your schedule and preferences.'
    }
  ];

  const howItWorks = [
    {
      title: 'For Students',
      steps: [
        'Create an account as a student',
        'Browse through available meal providers',
        'Select a suitable meal plan',
        'Subscribe and make payment',
        'Start receiving meals as per your plan'
      ],
      image: 'https://source.unsplash.com/random/400x300/?student',
      buttonText: 'Find Providers',
      buttonLink: '/providers'
    },
    {
      title: 'For Providers',
      steps: [
        'Register as a meal provider',
        'Create your menu and meal plans',
        'Set delivery areas and timings',
        'Get verified by our team',
        'Start receiving subscriptions'
      ],
      image: 'https://source.unsplash.com/random/400x300/?cooking',
      buttonText: 'Register as Provider',
      buttonLink: '/register'
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 4, md: 8 },
          pb: { xs: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="primary"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Student Mess Delivery
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          paragraph
          sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
        >
          Connecting students with quality meal providers. Subscribe for monthly meal plans and enjoy
          delicious food without any hassle.
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {!isAuthenticated ? (
            <>
              <Grid item>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  color="primary"
                >
                  Get Started
                </Button>
              </Grid>
              <Grid item>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="large"
                >
                  Sign In
                </Button>
              </Grid>
            </>
          ) : (
            <Grid item>
              <Button
                component={Link}
                to={user?.role === 'student' ? '/providers' : '/provider/dashboard'}
                variant="contained"
                size="large"
                color="primary"
              >
                {user?.role === 'student' ? 'Browse Providers' : 'Go to Dashboard'}
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 6 }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Our Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h5" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 6 }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
        >
          How It Works
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {howItWorks.map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={section.image}
                  alt={section.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h4" component="h3">
                    {section.title}
                  </Typography>
                  <Box component="ol" sx={{ pl: 2 }}>
                    {section.steps.map((step, i) => (
                      <Typography component="li" variant="body1" key={i} sx={{ mb: 1 }}>
                        {step}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button
                    component={Link}
                    to={section.buttonLink}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    {section.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: 'primary.light',
          borderRadius: 4,
          py: 6,
          px: 4,
          mt: 6,
          mb: 6,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" color="white" gutterBottom>
          Ready to simplify your meals?
        </Typography>
        <Typography variant="body1" color="white" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
          Join our platform today and experience hassle-free meal planning. Whether you're a student or a provider, we've got you covered.
        </Typography>
        <Button
          component={Link}
          to="/register"
          variant="contained"
          color="secondary"
          size="large"
          sx={{ mt: 2 }}
        >
          Get Started Now
        </Button>
      </Box>
    </Container>
  );
};

export default Home; 