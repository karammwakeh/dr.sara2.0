import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

const CartPage = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { language } = useLanguage();
  const { items, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>{language === 'ar' ? 'السلة - د. سارة' : 'Cart - Dr. Sarah'}</title>
        </Helmet>

        <div className="min-h-screen bg-quinary/20 py-16">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag className="h-24 w-24 text-primary/20 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-dark mb-4">
              {language === 'ar' ? 'السلة فارغة' : 'Cart is Empty'}
            </h2>
            <p className="text-dark/70 mb-8">
              {language === 'ar' ? 'لم تقم بإضافة أي منتجات بعد' : 'You haven\'t added any products yet'}
            </p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-secondary text-white font-bold">
                {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{language === 'ar' ? 'السلة - د. سارة' : 'Cart - Dr. Sarah'}</title>
      </Helmet>

      <div className="min-h-screen bg-quinary/20 py-16">
        <div className="container mx-auto px-4">
          <h1 
            className="text-4xl font-bold text-dark mb-8"
            style={{ fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'serif' }}
          >
            {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-quaternary/20"
                >
                  <div className="flex gap-6">
                    <img
                      src={`${BASE_URL}${item.images[0]}`}
                      alt={item.name_ar}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark mb-2">{item.name_ar}</h3>
                      <p className="text-dark/70 mb-4">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-dark"
                          >
                            -
                          </button>
                          <span className="font-semibold text-dark">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-dark"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-primary">
                            ${(item.discount_price || item.price) * item.quantity}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div>
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24 border border-quaternary/20">
                <h3 className="text-2xl font-bold text-dark mb-6">
                  {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-dark/70">
                    <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>${getTotal()}</span>
                  </div>
                  <div className="flex justify-between text-dark/70">
                    <span>{language === 'ar' ? 'الضريبة' : 'Tax'}</span>
                    <span>${(getTotal() * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between text-xl font-bold text-dark">
                    <span>{language === 'ar' ? 'المجموع' : 'Total'}</span>
                    <span>${(getTotal() * 1.15).toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-secondary hover:bg-primary text-white font-bold py-3"
                >
                  {language === 'ar' ? 'إتمام الشراء' : 'Proceed to Checkout'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;