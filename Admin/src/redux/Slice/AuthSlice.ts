// src/redux/Slice/AuthSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';
import { BACKEND_API_URL } from '../../Constants';
import { fetchPermissionMetadata, fetchRolePermissions, resetPermissions } from './RoleSlice';
import { AppDispatch } from '../Store';

const API_URL = BACKEND_API_URL;

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  msg: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Async Thunks
export const login = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string; dispatch: AppDispatch }
>('auth/login', async (credentials, { rejectWithValue, dispatch }) => {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/login`,
      credentials
    );

    if (response.data.success) {
      // Store tokens in AsyncStorage
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data;
    }
    return rejectWithValue(response.data.msg);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Login failed');
  }
});

export const logout = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string; dispatch: AppDispatch }
>('auth/logout', async (_, { rejectWithValue, dispatch }) => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (refreshToken) {
      await axios.post(`${API_URL}/auth/logout`, { refreshToken });
    }

    // Clear storage
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    
    // Clear permissions state
    dispatch(resetPermissions());

    return true;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Logout failed');
  }
});

export const refreshToken = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) {
      return rejectWithValue('No refresh token');
    }

    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    });

    if (response.data.success) {
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      return response.data.accessToken;
    }

    return rejectWithValue('Token refresh failed');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Token refresh failed');
  }
});

interface CheckAuthStateReturn {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const checkAuthState = createAsyncThunk<
  CheckAuthStateReturn | null,
  void,
  { dispatch: AppDispatch }
>('auth/checkState', async (_, { dispatch }) => {
  try {
    const [accessToken, refreshToken, userStr] = await AsyncStorage.multiGet([
      'accessToken',
      'refreshToken',
      'user',
    ]);

    if (accessToken[1] && refreshToken[1] && userStr[1]) {
      const user = JSON.parse(userStr[1]);
      
      // Load permissions when restoring state
      if (user.roleId) {
        await dispatch(loadUserPermissions(user.roleId));
      }
      
      return {
        accessToken: accessToken[1],
        refreshToken: refreshToken[1],
        user,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
});

// New thunk to load permissions after login
export const loadUserPermissions = createAsyncThunk<
  boolean,
  string,
  { rejectValue: string; dispatch: AppDispatch }
>('auth/loadPermissions', async (roleId, { dispatch, rejectWithValue }) => {
  try {
    console.log('🔐 Loading permissions for role:', roleId);
    
    // First fetch permission metadata (modules)
    const metadataResult = await dispatch(fetchPermissionMetadata()).unwrap();
    console.log('✅ Permission metadata loaded:', metadataResult.modules.length, 'modules');
    
    // Then fetch role permissions
    const permissionsResult = await dispatch(fetchRolePermissions(roleId)).unwrap();
    console.log('✅ Role permissions loaded:', permissionsResult.length, 'permissions');
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to load permissions:', error);
    return rejectWithValue(error?.message || 'Failed to load permissions');
  }
});

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload ?? 'Login failed';
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      })

      // Check Auth State
      .addCase(checkAuthState.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuthState.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<string>) => {
        state.accessToken = action.payload;
      })
      
      // Load User Permissions
      .addCase(loadUserPermissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserPermissions.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(loadUserPermissions.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;