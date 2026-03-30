// src/redux/Slice/ProductSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ProductState = {
  products: [],
  isLoading: false,
  error: null,
  success: false,
};

// Define types for API responses
interface ProductResponse {
  success: boolean;
  data: Product;
  msg?: string;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  msg?: string;
}

// Async Thunks
export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>('product/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ProductsResponse>('/product');
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to fetch products');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch products');
  }
});

export const createProduct = createAsyncThunk<
  Product,
  FormData,
  { rejectValue: string }
>('product/createProduct', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post<ProductResponse>('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to create product');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to create product');
  }
});

export const updateProduct = createAsyncThunk<
  Product,
  { id: string; formData: FormData },
  { rejectValue: string }
>('product/updateProduct', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await api.put<ProductResponse>(`/product/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to update product');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to update product');
  }
});

export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('product/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<{ success: boolean; msg?: string }>(`/product/${id}`);
    if (response.data.success) {
      return id;
    }
    return rejectWithValue(response.data.msg || 'Failed to delete product');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to delete product');
  }
});

export const updateProductStock = createAsyncThunk<
  { productId: string; quantity: number },
  { id: string; quantity: number },
  { rejectValue: string }
>('product/updateStock', async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.put<{ success: boolean; data: any }>(`/product/${id}/stock`, { quantity });
    if (response.data.success) {
      return { productId: id, quantity: response.data.data.quantity };
    }
    return rejectWithValue('Failed to update stock');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to update stock');
  }
});

const productSlice = createSlice({
  name: 'product',
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
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create product';
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update product';
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete product';
      })
      // Update Stock
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const product = state.products.find(p => p.id === action.payload.productId);
        if (product) {
          product.quantity = action.payload.quantity;
        }
      });
  },
});

export const { clearError, resetSuccess } = productSlice.actions;
export default productSlice.reducer;
