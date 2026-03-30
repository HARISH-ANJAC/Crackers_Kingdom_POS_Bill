// src/redux/Slice/TagSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Tag } from '../types';

interface TagState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: TagState = {
  tags: [],
  isLoading: false,
  error: null,
  success: false,
};

// Define types for API responses
interface TagResponse {
  success: boolean;
  data: Tag;
  message?: string;
}

interface TagsResponse {
  success: boolean;
  data: Tag[];
  message?: string;
}

// Async Thunks
export const fetchTags = createAsyncThunk<
  Tag[],
  void,
  { rejectValue: string }
>('tag/fetchTags', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<TagsResponse>('/tag');
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to fetch tags');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
  }
});

export const createTag = createAsyncThunk<
  Tag,
  object,
  { rejectValue: string }
>('tag/createTag', async (tagData, { rejectWithValue }) => {
  try {
    const response = await api.post<TagResponse>('/tag', tagData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to create tag');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create tag');
  }
});

export const updateTag = createAsyncThunk<
  Tag,
  { id: string; tagData: object },
  { rejectValue: string }
>('tag/updateTag', async ({ id, tagData }, { rejectWithValue }) => {
  try {
    const response = await api.put<TagResponse>(`/tag/${id}`, tagData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to update tag');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update tag');
  }
});

export const deleteTag = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('tag/deleteTag', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<{ success: boolean; message?: string }>(`/tag/${id}`);
    if (response.data.success) {
      return id;
    }
    return rejectWithValue(response.data.message || 'Failed to delete tag');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete tag');
  }
});

const tagSlice = createSlice({
  name: 'tag',
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
      // Fetch Tags
      .addCase(fetchTags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action: PayloadAction<Tag[]>) => {
        state.isLoading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch tags';
      })
      // Create Tag
      .addCase(createTag.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTag.fulfilled, (state, action: PayloadAction<Tag>) => {
        state.isLoading = false;
        state.tags.unshift(action.payload);
        state.success = true;
      })
      .addCase(createTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create tag';
      })
      // Update Tag
      .addCase(updateTag.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTag.fulfilled, (state, action: PayloadAction<Tag>) => {
        state.isLoading = false;
        const index = state.tags.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update tag';
      })
      // Delete Tag
      .addCase(deleteTag.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTag.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.tags = state.tags.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete tag';
      });
  },
});

export const { clearError, resetSuccess } = tagSlice.actions;
export default tagSlice.reducer;
