import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Bill as Order } from '../types'; // Reusing Bill type for simplicity, adjust if needed

interface OrderState {
  orders: any[];
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

const initialState: OrderState = {
  orders: [],
  pagination: null,
  isLoading: false,
  error: null,
  success: false,
};

// Define response type
interface OrdersResponse {
  success: boolean;
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Async Thunks
export const fetchOrders = createAsyncThunk<
  OrdersResponse,
  { page?: number; limit?: number; status?: string; search?: string } | void,
  { rejectValue: string }
>('order/fetchOrders', async (params, { rejectWithValue }) => {
  try {
    const page = params && typeof params === 'object' ? params.page || 1 : 1;
    const limit = params && typeof params === 'object' ? params.limit || 10 : 10;
    const status = params && typeof params === 'object' ? params.status : '';
    const search = params && typeof params === 'object' ? params.search : '';

    let url = `/orders?page=${page}&limit=${limit}`;
    if (status && status !== 'all') url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await api.get<OrdersResponse>(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
  }
});

export const convertOrderToInvoice = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>('order/convertOrderToInvoice', async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.post<any>(`/orders/convert/${orderId}`);
    if (response.data.success) {
      return { orderId, invoice: response.data.invoice };
    }
    return rejectWithValue(response.data.message || 'Failed to convert order');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to convert order');
  }
});

export const deleteOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('order/deleteOrder', async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/orders/${orderId}`);
    if (response.data.success) {
      return orderId;
    }
    return rejectWithValue(response.data.message || 'Failed to delete order');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete order');
  }
});

const orderSlice = createSlice({
  name: 'order',
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
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<OrdersResponse>) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      .addCase(convertOrderToInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(convertOrderToInvoice.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Update order status in local state
        const index = state.orders.findIndex(o => o.id === action.payload.orderId);
        if (index !== -1) {
          state.orders[index].status = 'converted';
        }
        state.success = true;
      })
      .addCase(convertOrderToInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to convert order';
      })
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.orders = state.orders.filter(o => o.id !== action.payload);
        state.success = true;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete order';
      });
  },
});

export const { clearError, resetSuccess } = orderSlice.actions;
export default orderSlice.reducer;
