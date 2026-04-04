// src/redux/Store.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import authReducer from './Slice/AuthSlice';
import permissionReducer from './Slice/RoleSlice';
import userReducer from './Slice/UserSlice';
import categoryReducer from './Slice/CategorySlice';
import productReducer from './Slice/ProductSlice';
import videoReducer from './Slice/VideoSlice';
import invoiceReducer from './Slice/InvoiceSlice';
import orderReducer from './Slice/OrderSlice';
import customerReducer from './Slice/CustomerSlice';
import tagReducer from './Slice/TagSlice';
import dashboardReducer from './Slice/DashboardSlice';
import uomReducer from './Slice/UomSlice';
import bannerReducer from './Slice/BannerSlice';



export const Store = configureStore({
  reducer: {
    auth: authReducer,
    permissions: permissionReducer,
    users: userReducer,
    categories: categoryReducer,
    products: productReducer,
    videos: videoReducer,
    invoices: invoiceReducer,
    orders: orderReducer,
    customers: customerReducer,
    tags: tagReducer,
    dashboard: dashboardReducer,
    uoms: uomReducer,
    banners: bannerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;