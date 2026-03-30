// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { logout, refreshToken } from '../redux/Slice/AuthSlice';
import { BACKEND_API_URL } from '../Constants';
import { Store } from '../redux/Store';

const API_URL = BACKEND_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const result = await Store.dispatch(refreshToken());
        if (refreshToken.fulfilled.match(result)) {
          const token = await AsyncStorage.getItem('accessToken');
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          // Refresh failed
          Store.dispatch(logout());
          return Promise.reject(new Error('Session expired'));
        }
      } catch (refreshError) {
        Store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;