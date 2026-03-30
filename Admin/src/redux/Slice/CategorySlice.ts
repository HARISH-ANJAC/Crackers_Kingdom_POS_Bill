// src/redux/Slice/CategorySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Category } from '../types';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
  success: false,
};

// Define types for API responses
interface CategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

// Async Thunks
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>('category/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<CategoriesResponse>('/category');
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to fetch categories');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
  }
});

export const createCategory = createAsyncThunk<
  Category,
  FormData,
  { rejectValue: string }
>('category/createCategory', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post<CategoryResponse>('/category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to create category');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create category');
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  { id: string; formData: FormData },
  { rejectValue: string }
>('category/updateCategory', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await api.put<CategoryResponse>(`/category/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to update category');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update category');
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('category/deleteCategory', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<{ success: boolean; message?: string }>(`/category/${id}`);
    if (response.data.success) {
      return id;
    }
    return rejectWithValue(response.data.message || 'Failed to delete category');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
  }
});

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch categories';
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.categories.unshift(action.payload);
        state.success = true;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create category';
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update category';
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.categories = state.categories.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete category';
      });
  },
});

export const { clearError, resetSuccess } = categorySlice.actions;
export default categorySlice.reducer;
