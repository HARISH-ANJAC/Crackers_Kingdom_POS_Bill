// src/redux/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleId: string;
  roleName?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Module {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface PermissionAction {
  id: string;
  action: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  moduleId: string;
  actionId: string;
  isAllowed: boolean;
  allowAll: boolean;
  createdAt?: string;
  module?: Module;
  action?: PermissionAction;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: any; // LucideIcon components from lucide-react-native
  path: string;
  module?: string;
  parentId?: string;
  order: number;
  children?: MenuItem[];
  permissions?: {
    read?: boolean;
    write?: boolean;
    create?: boolean;
    delete?: boolean;
    import?: boolean;
    export?: boolean;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  rank: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Uom {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  badgeIcon?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  rank: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  uomId: string;
  uom?: Uom;
  name: string;
  slug: string;
  image?: string;
  images?: string;
  rank: number;
  mrp: string | number;
  sellingPrice: string | number;
  conversionQty?: number;
  isActive: boolean;
  tags?: string[]; // Array of tag IDs or tag names
  quantity?: number;
  stock?: {
    id: string;
    quantity: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type VideoType = 'upload' | 'youtube';

export interface Video {
  id: string;
  productId: string;
  name?: string;
  type: VideoType;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  product?: Product;
  productName?: string; // Kept for UI compatibility if needed
}

export interface Bill {
  id: string;
  invoiceNumber: string;
  billNumber?: string; // Alias for UI
  customerId: string;
  customer?: Customer;
  subTotal: string | number;
  discountAmount: string | number;
  taxAmount: string | number;
  totalAmount: string | number;
  paymentMethod: 'cash' | 'upi' | 'card';
  notes?: string;
  userId?: string;
  createdBy?: string; // Alias for UI
  status?: string; // Kept for UI compatibility
  createdAt?: string;
  updatedAt?: string;
  items?: BillItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  createdAt?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customer?: Customer;
  totalAmount: string | number;
  totalItems: number;
  status: 'pending' | 'confirmed' | 'converted' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
}


export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PermissionState {
  roles: Role[];
  modules: Module[];
  permissions: RolePermission[];
  userPermissions: Record<string, Record<string, boolean>>;
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
}