import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/utils/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';

// Student Pages
import Providers from './pages/student/Providers';
import ProviderDetails from './pages/student/ProviderDetails';
import StudentSubscriptions from './pages/student/Subscriptions';
import StudentOrders from './pages/student/Orders';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';
import MealPlans from './pages/provider/MealPlans';
import MenuItems from './pages/provider/MenuItems';
import ProviderSubscribers from './pages/provider/Subscribers';
import ProviderOrders from './pages/provider/Orders';

// Common Pages
import Profile from './pages/Profile';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes - Student */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/providers" element={<Providers />} />
                <Route path="/providers/:id" element={<ProviderDetails />} />
                <Route path="/student/subscriptions" element={<StudentSubscriptions />} />
                <Route path="/student/orders" element={<StudentOrders />} />
              </Route>

              {/* Protected Routes - Provider */}
              <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
                <Route path="/provider/dashboard" element={<ProviderDashboard />} />
                <Route path="/provider/meal-plans" element={<MealPlans />} />
                <Route path="/provider/menu-items" element={<MenuItems />} />
                <Route path="/provider/subscribers" element={<ProviderSubscribers />} />
                <Route path="/provider/orders" element={<ProviderOrders />} />
              </Route>

              {/* Common Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
