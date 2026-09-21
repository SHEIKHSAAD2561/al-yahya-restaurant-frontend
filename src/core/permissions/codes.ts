/**
 * Mirrors al-yahya-restaurant-backend/src/modules/permissions/permission-catalog.ts.
 * Hand-synced — keep in step with that file when the backend catalog changes.
 */
export const PERMISSIONS = {
  POS_ACCESS: 'pos.access',
  POS_MANAGE_CASH: 'pos.manage_cash',
  POS_PARK_SALE: 'pos.park_sale',
  POS_REMOVE_CART_ITEMS: 'pos.remove_cart_items',
  POS_EDIT_PRICES_DISCOUNTS: 'pos.edit_prices_discounts',
  POS_SELL_WHOLESALE: 'pos.sell_wholesale',
  POS_CHECKOUT_POST_PAYMENT: 'pos.checkout_post_payment',

  CUSTOMERS_ACCESS: 'customers.access',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',
  CUSTOMERS_EXPORT: 'customers.export',
  CUSTOMERS_VIEW_BALANCES: 'customers.view_balances',
  CUSTOMERS_MANAGE_SETTLEMENTS: 'customers.manage_settlements',

  ECOMMERCE_ORDERS_ACCESS: 'ecommerce_orders.access',
  ECOMMERCE_ORDERS_MANAGE: 'ecommerce_orders.manage',

  PRODUCTS_ACCESS: 'products.access',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  PRODUCTS_VIEW_COST: 'products.view_cost',
  PRODUCTS_EXPORT: 'products.export',
  PRODUCTS_PRINT_BARCODE: 'products.print_barcode',

  STOCK_ACCESS: 'stock.access',
  STOCK_RECORD_DRAFT: 'stock.record_draft',
  STOCK_MANAGE_MOVEMENTS: 'stock.manage_movements',
  STOCK_MANAGE_COUNTS: 'stock.manage_counts',
  STOCK_REQUEST_TRANSFER: 'stock.request_transfer',
  STOCK_APPROVE_TRANSFER: 'stock.approve_transfer',

  PURCHASES_SUPPLIERS_ACCESS: 'purchases_suppliers.access',
  PURCHASES_SUPPLIERS_RECORD_DRAFT: 'purchases_suppliers.record_draft',
  PURCHASES_SUPPLIERS_MANAGE_INVOICES: 'purchases_suppliers.manage_invoices',
  PURCHASES_SUPPLIERS_RECORD_RETURNS: 'purchases_suppliers.record_returns',
  PURCHASES_SUPPLIERS_VIEW_CREDIT_BALANCE: 'purchases_suppliers.view_credit_balance',
  PURCHASES_SUPPLIERS_MANAGE_SUPPLIERS_PAYABLES: 'purchases_suppliers.manage_suppliers_payables',

  EXPENSES_ACCESS: 'expenses.access',
  EXPENSES_CREATE: 'expenses.create',
  EXPENSES_EDIT: 'expenses.edit',
  EXPENSES_DELETE: 'expenses.delete',
  EXPENSES_VIEW_CASHFLOW_SUMMARY: 'expenses.view_cashflow_summary',
  EXPENSES_MANAGE_WALLET: 'expenses.manage_wallet',

  ACCOUNTING_ACCESS: 'accounting.access',
  ACCOUNTING_MANAGE_CHART_OF_ACCOUNTS: 'accounting.manage_chart_of_accounts',
  ACCOUNTING_RECORD_JOURNAL_ENTRIES: 'accounting.record_journal_entries',
  ACCOUNTING_MANAGE_JOURNAL_ENTRIES: 'accounting.manage_journal_entries',
  ACCOUNTING_VIEW_FINANCIAL_REPORTS: 'accounting.view_financial_reports',

  DASHBOARD_ACCESS: 'dashboard.access',
  DASHBOARD_SALES_INSIGHTS: 'dashboard.sales_insights',
  DASHBOARD_SALES_BREAKDOWNS: 'dashboard.sales_breakdowns',
  DASHBOARD_VIEW_FINANCIAL_METRICS: 'dashboard.view_financial_metrics',
  DASHBOARD_VIEW_REGISTER_INSIGHTS: 'dashboard.view_register_insights',

  REPORTS_ACCESS: 'reports.access',
  REPORTS_VIEW_SALES_REPORTS: 'reports.view_sales_reports',
  REPORTS_VIEW_PRODUCTS_STOCK_REPORTS: 'reports.view_products_stock_reports',
  REPORTS_VIEW_FINANCIAL_REPORTS: 'reports.view_financial_reports',
  REPORTS_VIEW_TAX_REPORTS: 'reports.view_tax_reports',
  REPORTS_EXPORT_REPORTS: 'reports.export_reports',

  SETTINGS_ACCESS: 'settings.access',
  SETTINGS_USERS_VIEW: 'settings.users.view',
  SETTINGS_USERS_MANAGE: 'settings.users.manage',
  SETTINGS_ROLES_VIEW: 'settings.roles.view',
  SETTINGS_ROLES_MANAGE: 'settings.roles.manage',
  SETTINGS_LOCATIONS_MANAGE: 'settings.locations.manage',
  SETTINGS_GENERAL_ACCOUNT_SETUP: 'settings.general_account_setup',
  SETTINGS_FINANCIAL_SETTINGS: 'settings.financial_settings',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Mirrors al-yahya-restaurant-backend/src/modules/permissions/permission-module.enum.ts.
 */
export const PERMISSION_MODULES = {
  POS: 'POS',
  CUSTOMERS: 'CUSTOMERS',
  ECOMMERCE_ORDERS: 'ECOMMERCE_ORDERS',
  PRODUCTS: 'PRODUCTS',
  STOCK: 'STOCK',
  PURCHASES_SUPPLIERS: 'PURCHASES_SUPPLIERS',
  EXPENSES: 'EXPENSES',
  ACCOUNTING: 'ACCOUNTING',
  DASHBOARD: 'DASHBOARD',
  REPORTS: 'REPORTS',
  SETTINGS: 'SETTINGS',
} as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[keyof typeof PERMISSION_MODULES];
