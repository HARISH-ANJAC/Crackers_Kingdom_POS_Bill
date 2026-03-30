import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Customer } from '../types';

interface CustomerState {
  customers: Customer[];
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

const initialState: CustomerState = {
  customers: [],
  pagination: null,
  isLoading: false,
  error: null,
  success: false,
};

// Define types for API responses
interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CustomerDetailResponse {
  success: boolean;
  data: Customer;
  msg?: string;
}

// Async Thunks
export const fetchCustomers = createAsyncThunk<
  CustomersResponse,
  { page?: number; limit?: number; search?: string } | void,
  { rejectValue: string }
>('customer/fetchCustomers', async (params, { rejectWithValue }) => {
  try {
    const page = params && typeof params === 'object' ? params.page || 1 : 1;
    const limit = params && typeof params === 'object' ? params.limit || 10 : 10;
    const search = params && typeof params === 'object' ? params.search : '';

    let url = `/customers?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await api.get<CustomersResponse>(url);
    if (response.data.success) {
      return response.data;
    }
    return rejectWithValue('Failed to fetch customers');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
  }
});

export const createCustomer = createAsyncThunk<
  Customer,
  Partial<Customer>,
  { rejectValue: string }
>('customer/createCustomer', async (customerData, { rejectWithValue }) => {
  try {
    const response = await api.post<CustomerDetailResponse>('/customers', customerData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to create customer');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to create customer');
  }
});

export const updateCustomer = createAsyncThunk<
  Customer,
  { id: string; customerData: Partial<Customer> },
  { rejectValue: string }
>('customer/updateCustomer', async ({ id, customerData }, { rejectWithValue }) => {
  try {
    const response = await api.put<CustomerDetailResponse>(`/customers/${id}`, customerData);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to update customer');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to update customer');
  }
});

export const deleteCustomer = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('customer/deleteCustomer', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<{ success: boolean; msg?: string }>(`/customers/${id}`);
    if (response.data.success) {
      return id;
    }
    return rejectWithValue(response.data.msg || 'Failed to delete customer');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete customer');
  }
});

const customerSlice = createSlice({
  name: 'customer',
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
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<CustomersResponse>) => {
        state.isLoading = false;
        state.customers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch customers';
      })
      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.isLoading = false;
        state.customers.unshift(action.payload);
        state.success = true;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create customer';
      })
      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.isLoading = false;
        const index = state.customers.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update customer';
      })
      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.customers = state.customers.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete customer';
      });
  },
});

export const { clearError, resetSuccess } = customerSlice.actions;
export default customerSlice.reducer;
