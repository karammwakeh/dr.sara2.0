import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ServicesPage from '@/pages/ServicesPage';
import CertificationsPage from '@/pages/CertificationsPage';
import MediaPage from '@/pages/MediaPage';
import CoursesPage from '@/pages/CoursesPage';
import ProductsPage from '@/pages/ProductsPage';
import BookingPage from '@/pages/BookingPage';
import ContactPage from '@/pages/ContactPage';
import BlogPage from '@/pages/BlogPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import CartPage from '@/pages/CartPage';
import DashboardPage from '@/pages/DashboardPage';
import TestimonialsPage from '@/pages/TestimonialsPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import CheckoutPage from '@/pages/checkout/CheckoutPage';
import OrderSuccessPage from '@/pages/checkout/OrderSuccessPage';
import AdminLayout from '@/pages/admin/AdminLayout';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen font-sans">
              <Routes>
                {/* Admin routes - no Header/Footer */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                />
                {/* Public routes - with Header/Footer */}
                <Route path="*" element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/certifications" element={<CertificationsPage />} />
                        <Route path="/media" element={<MediaPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/booking" element={<BookingPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/testimonials" element={<TestimonialsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success" element={<OrderSuccessPage />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <DashboardPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>
              <Toaster />
            </div>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
