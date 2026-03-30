import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface DashboardState {
    data: any | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    data: null,
    isLoading: false,
    error: null,
};

export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchData',
    async (params: { startDate?: string; endDate?: string } | undefined, { rejectWithValue }) => {
        try {
            let url = '/dashboard/stats';
            if (params?.startDate && params?.endDate) {
                url += `?startDate=${params.startDate}&endDate=${params.endDate}`;
            }
            const response = await api.get(url);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue('Failed to fetch dashboard data');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default dashboardSlice.reducer;
