// src/redux/Slice/BannerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Banner } from '../types';

interface BannerState {
  banners: Banner[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: BannerState = {
  banners: [],
  isLoading: false,
  error: null,
  success: false,
};

interface BannerResponse {
  success: boolean;
  data: Banner;
  message?: string;
}

interface BannersResponse {
  success: boolean;
  data: Banner[];
  message?: string;
}

// Async Thunks
export const fetchBanners = createAsyncThunk<
  Banner[],
  void,
  { rejectValue: string }
>('banner/fetchBanners', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<BannersResponse>('/banner');
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to fetch banners');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch banners');
  }
});

export const createBanner = createAsyncThunk<
  Banner,
  FormData,
  { rejectValue: string }
>('banner/createBanner', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post<BannerResponse>('/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to create banner');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create banner');
  }
});

export const updateBanner = createAsyncThunk<
  Banner,
  { id: string; formData: FormData },
  { rejectValue: string }
>('banner/updateBanner', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await api.put<BannerResponse>(`/banner/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to update banner');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update banner');
  }
});

export const deleteBanner = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('banner/deleteBanner', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<{ success: boolean; message?: string }>(`/banner/${id}`);
    if (response.data.success) {
      return id;
    }
    return rejectWithValue(response.data.message || 'Failed to delete banner');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete banner');
  }
});

const bannerSlice = createSlice({
  name: 'banner',
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
      .addCase(fetchBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action: PayloadAction<Banner[]>) => {
        state.isLoading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch banners';
      })
      .addCase(createBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBanner.fulfilled, (state, action: PayloadAction<Banner>) => {
        state.isLoading = false;
        state.banners.unshift(action.payload);
        state.success = true;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create banner';
      })
      .addCase(updateBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBanner.fulfilled, (state, action: PayloadAction<Banner>) => {
        state.isLoading = false;
        const index = state.banners.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update banner';
      })
      .addCase(deleteBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.banners = state.banners.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete banner';
      });
  },
});

export const { clearError, resetSuccess } = bannerSlice.actions;
export default bannerSlice.reducer;
