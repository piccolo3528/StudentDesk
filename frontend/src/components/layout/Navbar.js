import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Avatar, 
  Button, 
  Tooltip, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
  Login as LoginIcon,
  HowToReg as RegisterIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Subscriptions as SubscriptionsIcon,
  LocalDining as MenuItemsIcon,
  People as SubscribersIcon,
  Receipt as OrdersIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import useAuth from '../../context/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const themeContext = React.useContext(ThemeContext);
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleCloseUserMenu();
  };

  // Common nav items for all users
  const commonNavItems = [
    {
      title: 'Home',
      path: '/',
      icon: <HomeIcon />
    }
  ];

  // Nav items for student users
  const studentNavItems = [
    {
      title: 'Providers',
      path: '/providers',
      icon: <RestaurantIcon />
    },
    {
      title: 'My Subscriptions',
      path: '/student/subscriptions',
      icon: <SubscriptionsIcon />
    },
    {
      title: 'My Orders',
      path: '/student/orders',
      icon: <OrdersIcon />
    }
  ];

  // Nav items for provider users
  const providerNavItems = [
    {
      title: 'Dashboard',
      path: '/provider/dashboard',
      icon: <DashboardIcon />
    },
    {
      title: 'Meal Plans',
      path: '/provider/meal-plans',
      icon: <MenuItemsIcon />
    },
    {
      title: 'Menu Items',
      path: '/provider/menu-items',
      icon: <RestaurantIcon />
    },
    {
      title: 'Subscribers',
      path: '/provider/subscribers',
      icon: <SubscribersIcon />
    },
    {
      title: 'Orders',
      path: '/provider/orders',
      icon: <OrdersIcon />
    }
  ];

  // Determine which nav items to show based on user role
  let navItems = [...commonNavItems];
  
  if (isAuthenticated) {
    if (user?.role === 'student') {
      navItems = [...navItems, ...studentNavItems];
    } else if (user?.role === 'provider') {
      navItems = [...navItems, ...providerNavItems];
    }
  }

  // Drawer content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Student Mess
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.title} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path} 
              sx={{ textAlign: 'left' }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile menu icon */}
          <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            STUDENT MESS
          </Typography>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.title}
                component={Link}
                to={item.path}
                sx={{ my: 2, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}
                startIcon={item.icon}
              >
                {item.title}
              </Button>
            ))}
          </Box>

          {/* Theme toggle button */}
          <IconButton 
            color="inherit" 
            sx={{ mr: 2 }}
            onClick={themeContext.toggleMode}
          >
            {themeContext.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* User menu */}
          {isAuthenticated ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user?.name}
                    src={user?.profilePicture}
                    sx={{ bgcolor: 'secondary.main' }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => { 
                  handleCloseUserMenu();
                  navigate('/profile');
                }}>
                  <ListItemIcon>
                    <ProfileIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex' }}>
              <Button
                component={Link}
                to="/login"
                color="inherit"
                startIcon={<LoginIcon />}
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="secondary"
                startIcon={<RegisterIcon />}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 