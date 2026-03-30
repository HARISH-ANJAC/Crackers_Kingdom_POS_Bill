// src/components/Navigation/MenuItem.tsx
import {
  LayoutDashboard,
  Layers,
  GitBranch,
  Award,
  Settings,
  Users,
  ShoppingBag,
  BarChart3,
  Video,
  Barcode,
  UserCog,
  Shield,
  Package,
  Store
} from 'lucide-react-native';
import { MenuItem } from '../../redux/types';

// This is now just an export of the static configuration
// The actual filtering happens in the Redux slice
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
    id: 'orders',
    label: 'Billing & POS',
    icon: BarChart3,
    path: 'orders',
    module: 'orders',
    order: 2,
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
        id: 'createProduct',
        label: 'Create Product',
        icon: ShoppingBag,
        path: 'createProduct',
        module: 'products',
        order: 2,
        permissions: { create: true }
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
        id: 'barcode',
        label: 'Barcode',
        icon: Barcode,
        path: 'barcode',
        module: 'barcode',
        order: 6,
        permissions: { read: true, create: true }
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
        id: 'createVideo',
        label: 'Create Video',
        icon: Video,
        path: 'createVideo',
        module: 'video',
        order: 2,
        permissions: { create: true }
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