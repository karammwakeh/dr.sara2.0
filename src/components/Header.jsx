import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const { t, toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/services', label: language === 'ar' ? 'الخدمات' : 'Services' },
    { to: '/courses', label: t('nav.courses') },
    { to: '/booking', label: t('nav.booking') },
    { to: '/blog', label: language === 'ar' ? 'المدونة' : 'Blog' },
    { to: '/contact', label: t('nav.contact') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform text-white">
              <span className="font-bold text-xl font-playfair">DS</span>
            </div>
            <span className={cn(
              "text-lg lg:text-xl font-bold transition-colors font-cairo",
              isScrolled ? "text-primary" : "text-primary"
            )}>
              د.سارة عبدالله عبدالعزيز المزيعل
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "font-medium transition-colors hover:text-secondary relative group",
                  location.pathname === item.to ? "text-primary font-bold" : "text-dark",
                )}
              >
                {item.label}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full",
                  location.pathname === item.to && "w-full"
                )} />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full hover:bg-quinary hover:text-primary text-dark"
            >
              <Globe className="h-5 w-5" />
            </Button>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-quinary hover:text-primary text-dark">
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in">
                    {getItemCount()}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="icon" className="hover:text-primary text-dark">
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button variant="ghost" size="icon" className="hover:text-primary text-dark">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:text-destructive text-dark">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                 <Link to="/login">
                  <Button variant="ghost" className="hover:text-primary text-dark hover:bg-quinary">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-primary hover:bg-secondary text-white font-bold">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-primary hover:bg-quinary rounded-md transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-md rounded-b-2xl shadow-xl border-t border-quinary mt-2"
            >
              <div className="p-4 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "block py-2 text-lg font-medium hover:text-primary transition-colors",
                      location.pathname === item.to ? "text-primary font-bold" : "text-dark"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-dark">
                      {language === 'ar' ? 'اللغة' : 'Language'}
                    </span>
                    <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-2 border-quaternary hover:bg-quinary hover:text-primary">
                      <Globe className="h-4 w-4" />
                      {language === 'ar' ? 'English' : 'العربية'}
                    </Button>
                  </div>

                  <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center justify-between">
                    <span className="font-medium text-dark">{t('nav.cart')}</span>
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      {getItemCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {getItemCount()}
                        </span>
                      )}
                    </div>
                  </Link>

                  {user ? (
                    <div className="space-y-2">
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-start hover:bg-quinary hover:text-primary" variant="outline">
                          <User className="h-4 w-4 mr-2" />
                          {t('nav.dashboard')}
                        </Button>
                      </Link>
                      <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('nav.logout')}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full border-primary text-primary hover:bg-quinary">{t('nav.login')}</Button>
                      </Link>
                      <Link to="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-primary text-white hover:bg-secondary">
                          {t('nav.signup')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;