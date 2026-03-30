// src/redux/Slice/VideoSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Video } from '../types';

interface VideoState {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: VideoState = {
  videos: [],
  isLoading: false,
  error: null,
  success: false,
};

// Define types for API responses
interface VideoResponse {
  success: boolean;
  data: Video;
  msg?: string;
}

interface VideosResponse {
  success: boolean;
  data: Video[];
  msg?: string;
}

// Async Thunks
export const fetchVideos = createAsyncThunk<
  Video[],
  void,
  { rejectValue: string }
>('video/fetchVideos', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<VideosResponse>('/video');
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to fetch videos');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch videos');
  }
});

export const createVideo = createAsyncThunk<
  Video,
  FormData | any,
  { rejectValue: string }
>('video/createVideo', async (data, { rejectWithValue }) => {
  try {
    const isFormData = data instanceof FormData;
    const response = await api.post<VideoResponse>('/video', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to create video');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to create video');
  }
});

export const updateVideo = createAsyncThunk<
  Video,
  { id: string; data: FormData | any },
  { rejectValue: string }
>('video/updateVideo', async ({ id, data }, { rejectWithValue }) => {
  try {
    const isFormData = data instanceof FormData;
    const response = await api.put<VideoResponse>(`/video/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to update video');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to update video');
  }
});

export const deleteVideo = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('video/deleteVideo', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<{ success: boolean; msg?: string }>(`/video/${id}`);
    if (response.data.success) {
      return id;
    }
    return rejectWithValue(response.data.msg || 'Failed to delete video');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete video');
  }
});

const videoSlice = createSlice({
  name: 'video',
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
      // Fetch Videos
      .addCase(fetchVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.isLoading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch videos';
      })
      // Create Video
      .addCase(createVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createVideo.fulfilled, (state, action: PayloadAction<Video>) => {
        state.isLoading = false;
        state.videos.unshift(action.payload);
        state.success = true;
      })
      .addCase(createVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create video';
      })
      // Update Video
      .addCase(updateVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateVideo.fulfilled, (state, action: PayloadAction<Video>) => {
        state.isLoading = false;
        const index = state.videos.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.videos[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update video';
      })
      // Delete Video
      .addCase(deleteVideo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.videos = state.videos.filter((v) => v.id !== action.payload);
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete video';
      });
  },
});

export const { clearError, resetSuccess } = videoSlice.actions;
export default videoSlice.reducer;
