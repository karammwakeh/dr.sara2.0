// src/services/api.js
// API Service للاتصال مع Backend الخاص

import axios from 'axios';

// Base URL للـ Backend
// في dev: vite.config.js عنده proxy من /api -> localhost:5000
// في production: VITE_API_URL يشير لرابط البيكند الفعلي
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// إنشاء Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor لإضافة Token تلقائياً
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor للـ Response Errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// ===================================
// PRODUCTS API
// ===================================

export const getProducts = async (params = {}) => {
    try {
        const response = await api.get('/products', { params });
        return response.data;
    } catch (error) {
        console.error('Get products error:', error);
        throw error;
    }
};

export const getProduct = async (id) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get product error:', error);
        throw error;
    }
};

export const createProduct = async (productData) => {
    try {
        // إذا في صور، استخدم FormData
        const formData = new FormData();
        
        Object.keys(productData).forEach(key => {
            if (key === 'images' && productData[key]) {
                // إضافة الصور
                productData[key].forEach(file => {
                    formData.append('images', file);
                });
            } else {
                formData.append(key, productData[key]);
            }
        });

        const response = await api.post('/admin/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Create product error:', error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const formData = new FormData();
        
        Object.keys(productData).forEach(key => {
            if (key === 'images' && productData[key]) {
                productData[key].forEach(file => {
                    if (file instanceof File) {
                        formData.append('images', file);
                    }
                });
            } else if (key === 'existing_images') {
                formData.append('existing_images', JSON.stringify(productData[key]));
            } else {
                formData.append(key, productData[key]);
            }
        });

        const response = await api.put(`/admin/products/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Update product error:', error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/admin/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete product error:', error);
        throw error;
    }
};

// ===================================
// CATEGORIES API
// ===================================

export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Get categories error:', error);
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await api.post('/admin/categories', categoryData);
        return response.data;
    } catch (error) {
        console.error('Create category error:', error);
        throw error;
    }
};

// ===================================
// ORDERS API
// ===================================

export const getOrders = async (params = {}) => {
    try {
        const response = await api.get('/admin/orders', { params });
        return response.data;
    } catch (error) {
        console.error('Get orders error:', error);
        throw error;
    }
};

export const getOrder = async (id) => {
    try {
        const response = await api.get(`/admin/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get order error:', error);
        throw error;
    }
};

export const updateOrderStatus = async (id, status, trackingNumber = null) => {
    try {
        const response = await api.patch(`/admin/orders/${id}/status`, {
            status,
            tracking_number: trackingNumber
        });
        return response.data;
    } catch (error) {
        console.error('Update order status error:', error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Create order error:', error);
        throw error;
    }
};

// ===================================
// CUSTOMERS API
// ===================================

export const getCustomers = async (params = {}) => {
    try {
        const response = await api.get('/admin/customers', { params });
        return response.data;
    } catch (error) {
        console.error('Get customers error:', error);
        throw error;
    }
};

// ===================================
// AUTH API
// ===================================

export const adminLogin = async (email, password) => {
    try {
        const response = await api.post('/admin/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
        }
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const adminLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
};

export const isAdminAuthenticated = () => {
    return !!localStorage.getItem('admin_token');
};

export const getAdminUser = () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
};

// ===================================
// DASHBOARD API
// ===================================

export const getDashboardStats = async () => {
    try {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        throw error;
    }
};

// ===================================
// PAYMENT API (Moyasar)
// ===================================

export const createPayment = async (orderData) => {
    try {
        const response = await api.post('/payments/create', orderData);
        return response.data;
    } catch (error) {
        console.error('Create payment error:', error);
        throw error;
    }
};

export const verifyPayment = async (paymentId) => {
    try {
        const response = await api.get(`/payments/verify/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error('Verify payment error:', error);
        throw error;
    }
};

// ===================================
// SHIPPING API
// ===================================

export const getShippingMethods = async () => {
    try {
        const response = await api.get('/shipping/methods');
        return response.data;
    } catch (error) {
        console.error('Get shipping methods error:', error);
        throw error;
    }
};

export const calculateShipping = async (address, items) => {
    try {
        const response = await api.post('/shipping/calculate', { address, items });
        return response.data;
    } catch (error) {
        console.error('Calculate shipping error:', error);
        throw error;
    }
};

export const createShipment = async (orderId, shippingData) => {
    try {
        const response = await api.post(`/shipping/create/${orderId}`, shippingData);
        return response.data;
    } catch (error) {
        console.error('Create shipment error:', error);
        throw error;
    }
};

export const trackShipment = async (trackingNumber) => {
    try {
        const response = await api.get(`/shipping/track/${trackingNumber}`);
        return response.data;
    } catch (error) {
        console.error('Track shipment error:', error);
        throw error;
    }
};

// Export default
export default {
    // Products
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Categories
    getCategories,
    createCategory,
    
    // Orders
    getOrders,
    getOrder,
    updateOrderStatus,
    createOrder,
    
    // Customers
    getCustomers,
    
    // Auth
    adminLogin,
    adminLogout,
    isAdminAuthenticated,
    getAdminUser,
    
    // Dashboard
    getDashboardStats,
    
    // Payment
    createPayment,
    verifyPayment,
    
    // Shipping
    getShippingMethods,
    calculateShipping,
    createShipment,
    trackShipment
};
