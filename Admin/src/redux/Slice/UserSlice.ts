// src/redux/Slice/UserSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { User } from '../types';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  isLoading: false,
  error: null,
};

// Define types for API responses
interface UsersResponse {
  success: boolean;
  data: User[];
  msg?: string;
}

interface UserDetailResponse {
  success: boolean;
  data: User;
  msg?: string;
}

// Async Thunks
export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>('users/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<UsersResponse>('/users');
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to fetch users');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch users');
  }
});

export const createUser = createAsyncThunk<
  User,
  Partial<User> & { password?: string },
  { rejectValue: string }
>('users/createUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post<UserDetailResponse>('/auth/register', userData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to create user');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to create user');
  }
});

export const updateUser = createAsyncThunk<
  User,
  { id: string; userData: Partial<User> },
  { rejectValue: string }
>('users/updateUser', async ({ id, userData }, { rejectWithValue }) => {
  try {
    const response = await api.put<UserDetailResponse>(`/users/${id}`, userData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to update user');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to update user');
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('users/deleteUser', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<{ success: boolean; msg?: string }>(`/users/${id}`);
    if (response.data.success) {
      return id;
    }
    return rejectWithValue(response.data.msg || 'Failed to delete user');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete user');
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch users';
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create user';
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update user';
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete user';
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
