import type { Href } from 'expo-router';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface AdminFeature {
  /** The `feature` key of GET /admin/menu (the web route name without 'admin.' and '.index'). */
  key: string;
  title: string;
  icon: IconName;
  /** The screen that opens it — a folder under src/app/(admin)/. */
  href: Href;
}

/**
 * Every admin screen of the app, by menu feature key. The sidebar groups and their order come from the server
 * (GET /admin/menu — only what the role may open); this table says which screen a menu entry opens.
 * A screen module adds its folder under src/app/(admin)/<path> and nothing else: the entry already exists here.
 */
export const ADMIN_FEATURES: Record<string, AdminFeature> = {
  dashboard: { key: 'dashboard', title: 'Dashboard', icon: 'speedometer-outline', href: '/dashboard' },
  // Role Mgmt
  roles: { key: 'roles', title: 'Roles', icon: 'shield-checkmark-outline', href: '/roles' },
  'user-role-assignment': { key: 'user-role-assignment', title: 'User Roles', icon: 'person-add-outline', href: '/user-role-assignment' },
  'web-events': { key: 'web-events', title: 'Web Report', icon: 'calendar-outline', href: '/web-events' },
  'web-menus': { key: 'web-menus', title: 'Web Menu', icon: 'list-outline', href: '/web-menus' },
  permissions: { key: 'permissions', title: 'Role Web Event', icon: 'key-outline', href: '/permissions' },
  'menu-permissions': { key: 'menu-permissions', title: 'Role Web Menu', icon: 'git-network-outline', href: '/menu-permissions' },
  'role-web-reports': { key: 'role-web-reports', title: 'Role Web Report', icon: 'document-lock-outline', href: '/role-web-reports' },
  'super-admin': { key: 'super-admin', title: 'Create Super Admin', icon: 'shield-half-outline', href: '/super-admin' },
  // Access Report
  'payroll-report-access': { key: 'payroll-report-access', title: 'Payroll Report Access', icon: 'lock-open-outline', href: '/payroll-report-access' },
  'monthly-payroll-report-access': { key: 'monthly-payroll-report-access', title: 'Monthly Payroll Report Access', icon: 'calendar-number-outline', href: '/monthly-payroll-report-access' },
  // User Control
  users: { key: 'users', title: 'Users', icon: 'people-outline', href: '/users' },
  'users-by-role': { key: 'users-by-role', title: 'Users by Role', icon: 'person-circle-outline', href: '/users-by-role' },
  'users-by-company': { key: 'users-by-company', title: 'Users by Company', icon: 'business-outline', href: '/users-by-company' },
  // Others
  companies: { key: 'companies', title: 'Add Companies', icon: 'business-outline', href: '/companies' },
  'upload-header': { key: 'upload-header', title: 'Upload Header', icon: 'image-outline', href: '/upload-header' },
  'invalid-credentials': { key: 'invalid-credentials', title: 'Invalid Credentials Report', icon: 'warning-outline', href: '/invalid-credentials' },
  'payroll-history': { key: 'payroll-history', title: 'Payroll History', icon: 'time-outline', href: '/payroll-history' },
  'pf-year': { key: 'pf-year', title: 'PF Year', icon: 'calendar-outline', href: '/pf-year' },
  'pf-balance-upload': { key: 'pf-balance-upload', title: 'PF Balance Upload', icon: 'cloud-upload-outline', href: '/pf-balance-upload' },
  'pf-profit-allocation': { key: 'pf-profit-allocation', title: 'Profit Upload', icon: 'trending-up-outline', href: '/pf-profit-allocation' },
  // Employee Mgmt
  'employee-basic-info': { key: 'employee-basic-info', title: 'Employee Basic Info', icon: 'id-card-outline', href: '/employee-basic-info' },
  'job-info': { key: 'job-info', title: 'Employee Job Info', icon: 'briefcase-outline', href: '/job-info' },
  'upload-excel': { key: 'upload-excel', title: 'Upload Excel', icon: 'document-text-outline', href: '/upload-excel' },
  'audit-log': { key: 'audit-log', title: 'Change Report', icon: 'git-compare-outline', href: '/audit-log' },
  'lookup-master': { key: 'lookup-master', title: 'Salary Circle, Tax Zone, Bank', icon: 'library-outline', href: '/lookup-master' },
  // Salary Sheet
  'salary-reports': { key: 'salary-reports', title: 'Salary Sheet Report', icon: 'cash-outline', href: '/salary-reports' },
  'cost-analysis-report': { key: 'cost-analysis-report', title: 'Cost Analysis Report', icon: 'stats-chart-outline', href: '/cost-analysis-report' },
  'salary-approval': { key: 'salary-approval', title: 'Salary Approval', icon: 'checkmark-done-outline', href: '/salary-approval' },
  // Component Mgmt
  'salary-components.groups': { key: 'salary-components.groups', title: 'Sal Comp Group', icon: 'albums-outline', href: '/salary-components/groups' },
  'salary-components.mapping': { key: 'salary-components.mapping', title: 'Sal Comp Mapping', icon: 'git-merge-outline', href: '/salary-components/mapping' },
  'salary-components.sorting': { key: 'salary-components.sorting', title: 'Sal Comp Sorting and Grouping', icon: 'swap-vertical-outline', href: '/salary-components/sorting' },
  'deduction-components.groups': { key: 'deduction-components.groups', title: 'Deduction Comp Group', icon: 'albums-outline', href: '/deduction-components/groups' },
  'deduction-components.mapping': { key: 'deduction-components.mapping', title: 'Deduction Comp Mapping', icon: 'git-merge-outline', href: '/deduction-components/mapping' },
  'deduction-components.sorting': { key: 'deduction-components.sorting', title: 'Deduction Comp Sorting and Grouping', icon: 'swap-vertical-outline', href: '/deduction-components/sorting' },
  'section-50-mapping': { key: 'section-50-mapping', title: 'Section 50 Mapping', icon: 'link-outline', href: '/section-50-mapping' },
  'instant-message': { key: 'instant-message', title: 'Instant Message', icon: 'chatbubble-ellipses-outline', href: '/instant-message' },
};

/**
 * Pages that have no row of their own in the server menu but belong to a menu group the role holds; they are listed under
 * the group's hub (key = the group's MenuName on the server, lower-cased).
 */
export const EXTRA_FEATURES_BY_GROUP: Record<string, string[]> = {
  'role mgmt': ['role-web-reports'],
  'employee mgmt': ['lookup-master'],
  'salary sheet': ['salary-approval'],
};

/** The groups shown as bottom tabs; every other group lives under "More". */
export const TAB_GROUPS = ['access report', 'salary sheet', 'employee mgmt'] as const;
