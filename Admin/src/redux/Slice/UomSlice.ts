// src/redux/Slice/UomSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Uom } from '../types';

interface UomState {
  uoms: Uom[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: UomState = {
  uoms: [],
  isLoading: false,
  error: null,
  success: false,
};

interface UomResponse {
  success: boolean;
  data: Uom;
  message?: string;
}

interface UomsResponse {
  success: boolean;
  data: Uom[];
  message?: string;
}

// Async Thunks
export const fetchUoms = createAsyncThunk<
  Uom[],
  void,
  { rejectValue: string }
>('uom/fetchUoms', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<UomsResponse>('/uom');
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to fetch UOMs');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch UOMs');
  }
});

export const createUom = createAsyncThunk<
  Uom,
  object,
  { rejectValue: string }
>('uom/createUom', async (uomData, { rejectWithValue }) => {
  try {
    const response = await api.post<UomResponse>('/uom', uomData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to create UOM');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create UOM');
  }
});

export const updateUom = createAsyncThunk<
  Uom,
  { id: string; uomData: object },
  { rejectValue: string }
>('uom/updateUom', async ({ id, uomData }, { rejectWithValue }) => {
  try {
    const response = await api.put<UomResponse>(`/uom/${id}`, uomData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.message || 'Failed to update UOM');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update UOM');
  }
});

export const deleteUom = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('uom/deleteUom', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<{ success: boolean; message?: string }>(`/uom/${id}`);
    if (response.data.success) {
      return id;
    }
    return rejectWithValue(response.data.message || 'Failed to delete UOM');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete UOM');
  }
});

const uomSlice = createSlice({
  name: 'uom',
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
      .addCase(fetchUoms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUoms.fulfilled, (state, action: PayloadAction<Uom[]>) => {
        state.isLoading = false;
        state.uoms = action.payload;
      })
      .addCase(fetchUoms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch UOMs';
      })
      .addCase(createUom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createUom.fulfilled, (state, action: PayloadAction<Uom>) => {
        state.isLoading = false;
        state.uoms.unshift(action.payload);
        state.success = true;
      })
      .addCase(createUom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create UOM';
      })
      .addCase(updateUom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUom.fulfilled, (state, action: PayloadAction<Uom>) => {
        state.isLoading = false;
        const index = state.uoms.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.uoms[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateUom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update UOM';
      })
      .addCase(deleteUom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUom.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.uoms = state.uoms.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete UOM';
      });
  },
});

export const { clearError, resetSuccess } = uomSlice.actions;
export default uomSlice.reducer;
