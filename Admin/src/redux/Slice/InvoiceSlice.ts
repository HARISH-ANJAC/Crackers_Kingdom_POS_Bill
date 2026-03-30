import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Bill as Invoice } from '../types';

interface InvoiceState {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: InvoiceState = {
  invoices: [],
  pagination: null,
  isLoading: false,
  error: null,
  success: false,
};

// Define types for API responses
interface InvoiceResponse {
  success: boolean;
  data: Invoice;
  msg?: string;
}

interface InvoicesResponse {
  success: boolean;
  data: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Async Thunks
export const fetchInvoices = createAsyncThunk<
  InvoicesResponse,
  { page?: number; limit?: number; search?: string; paymentMethod?: string } | void,
  { rejectValue: string }
>('invoice/fetchInvoices', async (params, { rejectWithValue }) => {
  try {
    const page = params && typeof params === 'object' ? params.page || 1 : 1;
    const limit = params && typeof params === 'object' ? params.limit || 10 : 10;
    const search = params && typeof params === 'object' ? params.search : '';
    const paymentMethod = params && typeof params === 'object' ? params.paymentMethod : 'all';

    let url = `/invoices?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (paymentMethod && paymentMethod !== 'all') url += `&paymentMethod=${paymentMethod}`;

    const response = await api.get<InvoicesResponse>(url);
    if (response.data.success) {
      return response.data;
    }
    return rejectWithValue('Failed to fetch invoices');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
  }
});

export const getInvoiceById = createAsyncThunk<
  Invoice,
  string,
  { rejectValue: string }
>('invoice/getInvoiceById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get<InvoiceResponse>(`/invoices/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to fetch invoice');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch invoice');
  }
});

export const createInvoice = createAsyncThunk<
  Invoice,
  any,
  { rejectValue: string }
>('invoice/createInvoice', async (invoiceData, { rejectWithValue }) => {
  try {
    const response = await api.post<InvoiceResponse>('/invoices', invoiceData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to create invoice');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to create invoice');
  }
});

export const updateInvoice = createAsyncThunk<
  Invoice,
  { id: string; invoiceData: any },
  { rejectValue: string }
>('invoice/updateInvoice', async ({ id, invoiceData }, { rejectWithValue }) => {
  try {
    const response = await api.put<InvoiceResponse>(`/invoices/${id}`, invoiceData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to update invoice');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to update invoice');
  }
});

export const deleteInvoice = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('invoice/deleteInvoice', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<{ success: boolean; msg?: string }>(`/invoices/${id}`);
    if (response.data.success) {
      return id;
    }
    return rejectWithValue(response.data.msg || 'Failed to delete invoice');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete invoice');
  }
});

const invoiceSlice = createSlice({
  name: 'invoice',
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
      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action: PayloadAction<InvoicesResponse>) => {
        state.isLoading = false;
        state.invoices = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch invoices';
      })
      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload);
        state.success = true;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create invoice';
      })
      // Update Invoice
      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
        state.isLoading = false;
        const index = state.invoices.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update invoice';
      })
      // Delete Invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.invoices = state.invoices.filter((i) => i.id !== action.payload);
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete invoice';
      });
  },
});

export const { clearError, resetSuccess } = invoiceSlice.actions;
export default invoiceSlice.reducer;
