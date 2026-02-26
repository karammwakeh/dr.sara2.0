import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = { status: 'published' };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      setError('فشل تحميل المنتجات. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (product) => {
    localStorage.setItem('selectedProduct', JSON.stringify({
      id: product.id,
      name: product.name_ar,
      price: product.sale_price || product.price,
      image: product.images?.[0]
    }));
    window.location.href = '/booking';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 mb-6 text-lg">{error}</p>
            <button 
              onClick={loadProducts}
              className="bg-[#D4AF37] text-white px-8 py-3 rounded-lg hover:bg-[#B8941F] transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            متجر د. سارة
          </h1>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            استكشف مجموعتنا المتميزة من الكتب والكورسات والاستشارات المتخصصة في التربية والتطوير الذاتي
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Product Image */}
                <div className="relative h-72 overflow-hidden bg-gray-100">
                  <img 
                    src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : 'https://via.placeholder.com/400x300?text=منتج'}
                    alt={product.name_ar}
                    className="w-full h-full object-cover"
                  />
                  {product.sale_price && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      خصم {Math.round((1 - product.sale_price / product.price) * 100)}%
                    </div>
                  )}
                  {product.is_featured && (
                    <div className="absolute top-4 left-4 bg-[#D4AF37] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ مميز
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Category Badge */}
                  {product.category_name && (
                    <span className="inline-block bg-[#FFF8F0] text-[#D4AF37] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {product.category_name}
                    </span>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {product.name_ar}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.short_description || product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      {product.sale_price ? (
                        <>
                          <span className="text-3xl font-bold text-[#D4AF37]">
                            {product.sale_price} ر.س
                          </span>
                          <span className="text-gray-400 line-through text-lg">
                            {product.price} ر.س
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-[#D4AF37]">
                          {product.price} ر.س
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    {product.stock_quantity > 0 ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">متوفر في المخزون</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 text-sm">
                        <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">غير متوفر حالياً</span>
                      </div>
                    )}
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuyNow(product)}
                    disabled={product.stock_quantity === 0}
                    className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                      product.stock_quantity > 0
                        ? 'bg-[#D4AF37] text-white hover:bg-[#B8941F] shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.stock_quantity > 0 ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        اشتري الآن
                      </span>
                    ) : (
                      'غير متوفر'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                لا توجد منتجات متاحة حالياً
              </h3>
              <p className="text-gray-600 mb-8">
                نعمل على إضافة منتجات جديدة قريباً. تابعونا للحصول على التحديثات!
              </p>
              <button 
                onClick={loadProducts}
                className="bg-[#D4AF37] text-white px-8 py-3 rounded-lg hover:bg-[#B8941F] transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
              >
                تحديث الصفحة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;