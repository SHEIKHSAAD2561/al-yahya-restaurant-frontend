import {
  Home,
  ShoppingCart,
  Users,
  Store,
  Package,
  Boxes,
  Truck,
  Receipt,
  Calculator,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSIONS, type PermissionCode } from '@/core/permissions/codes';

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  /** null = always visible to any signed-in user (just Home, for now). */
  permission: PermissionCode | null;
  isStub: boolean;
}

/** Single source of truth for the sidebar AND for each stub route's
 * `requirePermission()` call — one map, two consumers, no drift. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'home', icon: Home, permission: null, isStub: false },
  {
    href: '/pos',
    labelKey: 'pos',
    icon: ShoppingCart,
    permission: PERMISSIONS.POS_ACCESS,
    isStub: true,
  },
  {
    href: '/customers',
    labelKey: 'customers',
    icon: Users,
    permission: PERMISSIONS.CUSTOMERS_ACCESS,
    isStub: true,
  },
  {
    href: '/ecommerce-orders',
    labelKey: 'ecommerceOrders',
    icon: Store,
    permission: PERMISSIONS.ECOMMERCE_ORDERS_ACCESS,
    isStub: true,
  },
  {
    href: '/products',
    labelKey: 'products',
    icon: Package,
    permission: PERMISSIONS.PRODUCTS_ACCESS,
    isStub: true,
  },
  {
    href: '/stock',
    labelKey: 'stock',
    icon: Boxes,
    permission: PERMISSIONS.STOCK_ACCESS,
    isStub: true,
  },
  {
    href: '/purchases-suppliers',
    labelKey: 'purchasesSuppliers',
    icon: Truck,
    permission: PERMISSIONS.PURCHASES_SUPPLIERS_ACCESS,
    isStub: true,
  },
  {
    href: '/expenses',
    labelKey: 'expenses',
    icon: Receipt,
    permission: PERMISSIONS.EXPENSES_ACCESS,
    isStub: true,
  },
  {
    href: '/accounting',
    labelKey: 'accounting',
    icon: Calculator,
    permission: PERMISSIONS.ACCOUNTING_ACCESS,
    isStub: true,
  },
  {
    href: '/reports',
    labelKey: 'reports',
    icon: BarChart3,
    permission: PERMISSIONS.REPORTS_ACCESS,
    isStub: true,
  },
  {
    href: '/settings',
    labelKey: 'settings',
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_ACCESS,
    isStub: false,
  },
];

export const SETTINGS_TABS = [
  { href: '/settings/users', labelKey: 'users', permission: PERMISSIONS.SETTINGS_USERS_VIEW },
  { href: '/settings/roles', labelKey: 'roles', permission: PERMISSIONS.SETTINGS_ROLES_VIEW },
  {
    href: '/settings/locations',
    labelKey: 'locations',
    permission: PERMISSIONS.SETTINGS_LOCATIONS_MANAGE,
  },
] as const;
