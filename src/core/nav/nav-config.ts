import {
  Home,
  ShoppingCart,
  Wallet,
  UtensilsCrossed,
  FileText,
  Percent,
  Store,
  Users,
  CreditCard,
  SlidersHorizontal,
  Package,
  FolderTree,
  ListPlus,
  PackageSearch,
  ClipboardList,
  ArrowRightLeft,
  Truck,
  Undo2,
  Building2,
  Receipt,
  Calculator,
  BookOpen,
  Landmark,
  NotebookPen,
  ListTree,
  TrendingUp,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSIONS, type PermissionCode } from '@/core/permissions/codes';

export interface NavLink {
  type: 'link';
  href: string;
  labelKey: string;
  icon: LucideIcon;
  /** null = always visible to any signed-in user (just Home). */
  permission: PermissionCode | null;
}

export interface NavGroup {
  type: 'group';
  labelKey: string;
  icon: LucideIcon;
  children: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

/**
 * Single source of truth for the sidebar. Two kinds of entries:
 * - `link`: a direct route, gated by one permission code.
 * - `group`: a collapsible section (Rewaa-style) — visible only if the
 *   signed-in user has at least one of its children's permissions, and only
 *   the children they actually have render inside it. A user with just
 *   `pos.access` sees "Sales & Customers" with only "Point of Sale" inside.
 *
 * Every leaf here maps to a real permission code in the catalog (see
 * al-yahya-restaurant-backend/src/modules/permissions/permission-catalog.ts) —
 * none of these are fake/undischarged nav items. Most still land on a
 * "coming soon" stub page until their real feature is built (same as
 * before) — the permission gating is real even where the page isn't yet.
 */
export const NAV_ENTRIES: NavEntry[] = [
  { type: 'link', href: '/', labelKey: 'home', icon: Home, permission: null },
  {
    type: 'group',
    labelKey: 'salesCustomers',
    icon: Store,
    children: [
      { type: 'link', href: '/pos', labelKey: 'pos', icon: ShoppingCart, permission: PERMISSIONS.POS_ACCESS },
      {
        type: 'link',
        href: '/cash-management',
        labelKey: 'cashManagement',
        icon: Wallet,
        permission: PERMISSIONS.POS_MANAGE_CASH,
      },
      {
        type: 'link',
        href: '/digital-menu',
        labelKey: 'digitalMenu',
        icon: UtensilsCrossed,
        permission: PERMISSIONS.POS_MANAGE_DIGITAL_MENU,
      },
      {
        type: 'link',
        href: '/sale-invoices',
        labelKey: 'saleInvoices',
        icon: FileText,
        permission: PERMISSIONS.POS_VIEW_SALE_INVOICES,
      },
      {
        type: 'link',
        href: '/promotions',
        labelKey: 'promotions',
        icon: Percent,
        permission: PERMISSIONS.POS_MANAGE_PROMOTIONS,
      },
      {
        type: 'link',
        href: '/ecommerce-orders',
        labelKey: 'ecommerceOrders',
        icon: Store,
        permission: PERMISSIONS.ECOMMERCE_ORDERS_ACCESS,
      },
      {
        type: 'link',
        href: '/customers',
        labelKey: 'customers',
        icon: Users,
        permission: PERMISSIONS.CUSTOMERS_ACCESS,
      },
      {
        type: 'link',
        href: '/customer-payments',
        labelKey: 'customerPayments',
        icon: CreditCard,
        permission: PERMISSIONS.CUSTOMERS_VIEW_BALANCES,
      },
      {
        type: 'link',
        href: '/sale-settings',
        labelKey: 'saleSettings',
        icon: SlidersHorizontal,
        permission: PERMISSIONS.POS_MANAGE_SALE_SETTINGS,
      },
    ],
  },
  {
    type: 'group',
    labelKey: 'productsInventory',
    icon: Package,
    children: [
      {
        type: 'link',
        href: '/products',
        labelKey: 'products',
        icon: Package,
        permission: PERMISSIONS.PRODUCTS_ACCESS,
      },
      {
        type: 'link',
        href: '/category-management',
        labelKey: 'categoryManagement',
        icon: FolderTree,
        permission: PERMISSIONS.PRODUCTS_MANAGE_CATEGORIES,
      },
      {
        type: 'link',
        href: '/modifiers',
        labelKey: 'modifiers',
        icon: ListPlus,
        permission: PERMISSIONS.PRODUCTS_MANAGE_MODIFIERS,
      },
      {
        type: 'link',
        href: '/stock-operations',
        labelKey: 'stockOperations',
        icon: PackageSearch,
        permission: PERMISSIONS.STOCK_ACCESS,
      },
      {
        type: 'link',
        href: '/stock-count',
        labelKey: 'stockCount',
        icon: ClipboardList,
        permission: PERMISSIONS.STOCK_MANAGE_COUNTS,
      },
      {
        type: 'link',
        href: '/stock-transfer',
        labelKey: 'stockTransfer',
        icon: ArrowRightLeft,
        permission: PERMISSIONS.STOCK_REQUEST_TRANSFER,
      },
    ],
  },
  {
    type: 'group',
    labelKey: 'purchasesSuppliers',
    icon: Truck,
    children: [
      {
        type: 'link',
        href: '/purchase-invoices',
        labelKey: 'purchaseInvoices',
        icon: FileText,
        permission: PERMISSIONS.PURCHASES_SUPPLIERS_MANAGE_INVOICES,
      },
      {
        type: 'link',
        href: '/return-invoices',
        labelKey: 'returnInvoices',
        icon: Undo2,
        permission: PERMISSIONS.PURCHASES_SUPPLIERS_RECORD_RETURNS,
      },
      {
        type: 'link',
        href: '/suppliers',
        labelKey: 'suppliers',
        icon: Building2,
        permission: PERMISSIONS.PURCHASES_SUPPLIERS_MANAGE_SUPPLIERS_PAYABLES,
      },
      {
        type: 'link',
        href: '/supplier-payments',
        labelKey: 'supplierPayments',
        icon: CreditCard,
        permission: PERMISSIONS.PURCHASES_SUPPLIERS_VIEW_CREDIT_BALANCE,
      },
    ],
  },
  {
    type: 'group',
    labelKey: 'accounting',
    icon: Calculator,
    children: [
      {
        type: 'link',
        href: '/setup-guide',
        labelKey: 'setupGuide',
        icon: BookOpen,
        permission: PERMISSIONS.ACCOUNTING_VIEW_SETUP_GUIDE,
      },
      {
        type: 'link',
        href: '/expenses',
        labelKey: 'expenses',
        icon: Receipt,
        permission: PERMISSIONS.EXPENSES_ACCESS,
      },
      {
        type: 'link',
        href: '/fixed-assets',
        labelKey: 'fixedAssets',
        icon: Landmark,
        permission: PERMISSIONS.ACCOUNTING_MANAGE_FIXED_ASSETS,
      },
      {
        type: 'link',
        href: '/journal-entries',
        labelKey: 'journalEntries',
        icon: NotebookPen,
        permission: PERMISSIONS.ACCOUNTING_RECORD_JOURNAL_ENTRIES,
      },
      {
        type: 'link',
        href: '/chart-of-accounts',
        labelKey: 'chartOfAccounts',
        icon: ListTree,
        permission: PERMISSIONS.ACCOUNTING_MANAGE_CHART_OF_ACCOUNTS,
      },
      {
        type: 'link',
        href: '/financial-reports',
        labelKey: 'financialReports',
        icon: TrendingUp,
        permission: PERMISSIONS.ACCOUNTING_VIEW_FINANCIAL_REPORTS,
      },
    ],
  },
  {
    type: 'link',
    href: '/reports',
    labelKey: 'reports',
    icon: BarChart3,
    permission: PERMISSIONS.REPORTS_ACCESS,
  },
  {
    type: 'link',
    href: '/settings',
    labelKey: 'settings',
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_ACCESS,
  },
];

/** Flattened leaves, for consumers that don't care about grouping (e.g.
 * deriving the current page's breadcrumb label from the active route). */
export const NAV_LEAVES: NavLink[] = NAV_ENTRIES.flatMap((entry) =>
  entry.type === 'link' ? [entry] : entry.children,
);

export const SETTINGS_TABS = [
  {
    href: '/settings/company',
    labelKey: 'company',
    permission: PERMISSIONS.SETTINGS_GENERAL_ACCOUNT_SETUP,
  },
  { href: '/settings/users', labelKey: 'users', permission: PERMISSIONS.SETTINGS_USERS_VIEW },
  { href: '/settings/roles', labelKey: 'roles', permission: PERMISSIONS.SETTINGS_ROLES_VIEW },
  {
    href: '/settings/locations',
    labelKey: 'locations',
    permission: PERMISSIONS.SETTINGS_LOCATIONS_MANAGE,
  },
  { href: '/settings/taxes', labelKey: 'taxes', permission: PERMISSIONS.SETTINGS_FINANCIAL_SETTINGS },
  {
    href: '/settings/configuration',
    labelKey: 'configuration',
    permission: PERMISSIONS.SETTINGS_FINANCIAL_SETTINGS,
  },
  {
    href: '/settings/payment-methods',
    labelKey: 'paymentMethods',
    permission: PERMISSIONS.SETTINGS_FINANCIAL_SETTINGS,
  },
] as const;
