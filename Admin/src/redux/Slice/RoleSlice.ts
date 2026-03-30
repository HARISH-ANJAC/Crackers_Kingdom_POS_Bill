// src/redux/Slice/RoleSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PermissionState,
  Role,
  Module,
  RolePermission,
  MenuItem
} from '../types';
import {
  LayoutDashboard,
  Layers,
  Settings,
  Users,
  ShoppingBag,
  BarChart3,
  Video,
  Barcode,
  UserCog,
  Shield,
  Package,
  UploadCloud,
  ShoppingCart,
  Tag
} from 'lucide-react-native';
import { BACKEND_API_URL } from '../../Constants';

const API_URL = BACKEND_API_URL;

// Define types for API responses
interface RolesResponse {
  success: boolean;
  data: Role[];
  msg?: string;
}

interface PermissionMetadataResponse {
  success: boolean;
  data: {
    modules: Module[];
    actions: any[];
  };
  msg?: string;
}

interface RolePermissionsResponse {
  success: boolean;
  data: RolePermission[];
  msg?: string;
}

// Helper function to get auth header
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return { Authorization: `Bearer ${token}` };
};

// Async Thunks with proper typing
export const fetchRoles = createAsyncThunk<
  Role[],
  void,
  { rejectValue: string }
>('permissions/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get<RolesResponse>(`${API_URL}/users/roles`, { headers });

    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to fetch roles');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch roles');
  }
});

export const fetchPermissionMetadata = createAsyncThunk<
  { modules: Module[]; actions: any[] },
  void,
  { rejectValue: string }
>('permissions/fetchMetadata', async (_, { rejectWithValue }) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get<PermissionMetadataResponse>(`${API_URL}/users/permission-metadata`, { headers });

    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to fetch permissions metadata');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch permissions metadata');
  }
});

export const fetchRolePermissions = createAsyncThunk<
  RolePermission[],
  string,
  { rejectValue: string }
>('permissions/fetchRolePermissions', async (roleId, { rejectWithValue }) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.get<RolePermissionsResponse>(`${API_URL}/users/roles/${roleId}/permissions`, { headers });

    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue(response.data.msg || 'Failed to fetch role permissions');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || 'Failed to fetch role permissions');
  }
});

// Static menu configuration with permissions mapping
export const STATIC_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: 'dashboard',
    module: 'dashboard',
    order: 1,
    permissions: { read: true }
  },
  {
    id: 'bills',
    label: 'Manage Bills',
    icon: BarChart3,
    path: 'bills',
    module: 'bills',
    order: 2,
    permissions: { read: true, write: true, create: true, delete: true }
  },
  {
    id: 'orders',
    label: 'Manage Orders',
    icon: ShoppingCart,
    path: 'orders',
    module: 'orders',
    order: 2.5,
    permissions: { read: true, write: true, create: true, delete: true }
  },
  {
    id: 'products-section',
    label: 'Products',
    icon: Package,
    path: '',
    module: 'products',
    order: 3,
    children: [
      {
        id: 'products',
        label: 'All Products',
        icon: ShoppingBag,
        path: 'products',
        module: 'products',
        order: 1,
        permissions: { read: true, write: true, create: true, delete: true }
      },
      {
        id: 'category',
        label: 'Categories',
        icon: Layers,
        path: 'category',
        module: 'category',
        order: 3,
        permissions: { read: true, write: true, create: true, delete: true }
      },
      {
        id: 'tag',
        label: 'Manage Tags',
        icon: Tag,
        path: 'tag',
        module: 'tag',
        order: 5,
        permissions: { read: true, write: true, create: true, delete: true }
      }
    ]
  },
  {
    id: 'users-section',
    label: 'User Management',
    icon: Users,
    path: '',
    module: 'users',
    order: 4,
    children: [
      {
        id: 'users',
        label: 'All Users',
        icon: UserCog,
        path: 'users',
        module: 'users',
        order: 1,
        permissions: { read: true, write: true, create: true, delete: true }
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        icon: Shield,
        path: 'roles',
        module: 'roles',
        order: 2,
        permissions: { read: true, write: true, create: true, delete: true }
      },
      {
        id: 'customers',
        label: 'Customers',
        icon: Users,
        path: 'customers',
        module: 'customers',
        order: 3,
        permissions: { read: true, write: true }
      }
    ]
  },
  {
    id: 'media-section',
    label: 'Media',
    icon: Video,
    path: '',
    module: 'media',
    order: 5,
    children: [
      {
        id: 'video',
        label: 'Manage Videos',
        icon: Video,
        path: 'video',
        module: 'video',
        order: 1,
        permissions: { read: true, write: true, delete: true }
      },
      {
        id: 'uploads',
        label: 'Uploads',
        icon: UploadCloud,
        path: 'uploads',
        module: 'uploads',
        order: 3,
        permissions: { read: true, write: true, create: true, delete: true }
      }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: 'settings',
    module: 'settings',
    order: 6,
    permissions: { read: true, write: true }
  }
];

// Filter menu items based on permissions
const filterMenuByPermissions = (
  menuItems: MenuItem[],
  permissions: Record<string, Record<string, boolean>>
): MenuItem[] => {
  return menuItems
    .filter(item => {
      // If item has no module, show it (e.g., section headers)
      if (!item.module) return true;

      const modulePermissions = permissions[item.module];
      
      // If no permissions for this module, hide the item
      if (!modulePermissions) {
        return false;
      }

      // If item has specific permission requirements
      if (item.permissions) {
        const hasRequiredPermission = Object.entries(item.permissions).some(([action, required]) => {
          if (!required) return false;
          return modulePermissions[action] === true;
        });
        
        if (!hasRequiredPermission) {
          return false;
        }
      } else {
        // Default: require at least read permission
        if (modulePermissions.read !== true) {
          return false;
        }
      }

      return true;
    })
    .map(item => {
      if (item.children) {
        const filteredChildren = filterMenuByPermissions(item.children, permissions);
        return {
          ...item,
          children: filteredChildren
        };
      }
      return item;
    })
    .filter(item => {
      // Filter out empty section headers (no visible children)
      if (item.children) {
        return item.children.length > 0;
      }
      return true;
    });
};

// Build permissions map from role permissions
const buildPermissionsMap = (
  permissions: RolePermission[],
  modules: Module[]
): Record<string, Record<string, boolean>> => {
  const permissionMap: Record<string, Record<string, boolean>> = {};

  // Initialize all modules with default false permissions
  modules.forEach(module => {
    if (module.slug) {
      permissionMap[module.slug] = {
        read: false,
        write: false,
        create: false,
        delete: false,
        import: false,
        export: false
      };
    }
  });

  // Apply actual permissions
  permissions.forEach(perm => {
    const module = modules.find(m => m.id === perm.moduleId);
    const moduleSlug = module?.slug;
    
    if (moduleSlug) {
      if (!permissionMap[moduleSlug]) {
        permissionMap[moduleSlug] = {
          read: false,
          write: false,
          create: false,
          delete: false,
          import: false,
          export: false
        };
      }

      if (perm.allowAll) {
        permissionMap[moduleSlug] = {
          read: true,
          write: true,
          create: true,
          delete: true,
          import: true,
          export: true
        };
      } else {
        // Now actionId is the action name string (read, write, etc.)
        const actionName = perm.actionId;
        if (actionName && perm.isAllowed) {
          permissionMap[moduleSlug][actionName] = true;
        }
      }
    }
  });

  return permissionMap;
};

const initialState: PermissionState = {
  roles: [],
  modules: [],
  permissions: [],
  userPermissions: {},
  menuItems: [],
  isLoading: false,
  error: null,
};

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserPermissions: (state, action: PayloadAction<{
      permissions: RolePermission[];
      modules: Module[];
    }>) => {
      const { permissions, modules } = action.payload;
      state.userPermissions = buildPermissionsMap(permissions, modules);
      state.menuItems = filterMenuByPermissions(STATIC_MENU_ITEMS, state.userPermissions);
    },
    resetPermissions: (state) => {
      state.roles = [];
      state.modules = [];
      state.permissions = [];
      state.userPermissions = {};
      state.menuItems = [];
      state.error = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.isLoading = false;
        state.roles = action.payload;
        console.log('📋 Roles loaded:', state.roles.length);
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch roles';
      })

      // Fetch Permission Metadata
      .addCase(fetchPermissionMetadata.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissionMetadata.fulfilled, (state, action: PayloadAction<{ modules: Module[]; actions: any[] }>) => {
        state.isLoading = false;
        state.modules = action.payload.modules;
        
        console.log('=================================');
        console.log('📋 MODULES LOADED');
        console.log('=================================');
        console.log('Modules:', state.modules.map(m => ({ 
          id: m.id, 
          name: m.name, 
          slug: m.slug 
        })));
        console.log('=================================');
      })
      .addCase(fetchPermissionMetadata.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch permissions metadata';
      })

      // Fetch Role Permissions
      .addCase(fetchRolePermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action: PayloadAction<RolePermission[]>) => {
        state.isLoading = false;
        state.permissions = action.payload;

        // Update user permissions and menu items only if modules are loaded
        if (state.modules.length > 0) {
          state.userPermissions = buildPermissionsMap(action.payload, state.modules);
          state.menuItems = filterMenuByPermissions(STATIC_MENU_ITEMS, state.userPermissions);
        }
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch role permissions';
      });
  },
});

export const { clearError, setUserPermissions, resetPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;
