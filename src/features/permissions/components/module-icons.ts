import {
  ShoppingCart,
  Users,
  Store,
  Package,
  Boxes,
  Truck,
  Receipt,
  Calculator,
  LayoutDashboard,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSION_MODULES, type PermissionModule } from '@/core/permissions/codes';

export const MODULE_ICONS: Record<PermissionModule, LucideIcon> = {
  [PERMISSION_MODULES.POS]: ShoppingCart,
  [PERMISSION_MODULES.CUSTOMERS]: Users,
  [PERMISSION_MODULES.ECOMMERCE_ORDERS]: Store,
  [PERMISSION_MODULES.PRODUCTS]: Package,
  [PERMISSION_MODULES.STOCK]: Boxes,
  [PERMISSION_MODULES.PURCHASES_SUPPLIERS]: Truck,
  [PERMISSION_MODULES.EXPENSES]: Receipt,
  [PERMISSION_MODULES.ACCOUNTING]: Calculator,
  [PERMISSION_MODULES.DASHBOARD]: LayoutDashboard,
  [PERMISSION_MODULES.REPORTS]: BarChart3,
  [PERMISSION_MODULES.SETTINGS]: Settings,
};
