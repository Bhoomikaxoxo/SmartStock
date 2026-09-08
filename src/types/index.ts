export type UnitType = 'kg' | 'pieces' | 'liters' | 'tins' | 'bottles' | 'packs';

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: UnitType;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  minimum_required: number;
  supplier_id: string;
  expiry_date?: string; // YYYY-MM-DD
  barcode?: string;
  created_at: string;
  description?: string;
}

export interface SalesRecord {
  id: string;
  product_id: string;
  date: string; // YYYY-MM-DD
  units_sold: number;
  revenue: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  lead_time_days: number;
  products_supplied: string[];
}

export interface ReorderRecommendation {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  unit: UnitType;
  avg_daily_consumption: number;
  days_until_stockout: number;
  reorder_trigger_point: number;
  recommended_quantity: number;
  recommended_by_date: string;
  reasoning: string;
  lead_time_days: number;
  estimated_cost: number;
  status: 'pending' | 'ordered' | 'dismissed';
}

export interface StockoutEvent {
  id: string;
  product_id: string;
  product_name: string;
  date: string;
  estimated_units_lost: number;
  estimated_revenue_lost: number;
  notes?: string;
}

export type AlertType = 'low_stock' | 'expiring_soon' | 'reorder_due';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  product_id: string;
  product_name: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: UnitType;
  unit_cost: number;
  total_cost: number;
  order_date: string;
  expected_delivery_date: string;
  status: 'Sent' | 'Delivered' | 'Draft';
  notes?: string;
  issued_by?: string;
}

export type UserRole = 'owner' | 'staff' | 'purchasing';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitial: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number; // Unix timestamp in ms
}

export type ActiveTab = 'dashboard' | 'inventory' | 'production' | 'analytics' | 'alerts' | 'impact' | 'settings';

export interface FinancialImpactConfig {
  incidentsBefore: number;
  avgLossPerIncident: number;
  incidentsAfter: number;
}

export interface RecipeIngredient {
  product_id: string;
  quantity: number; // per batch
  unit: UnitType;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  yield_quantity: number;
  yield_unit: string;
  prep_time_mins: number;
  selling_price: number; // per yield unit
  ingredients: RecipeIngredient[];
  description: string;
}

export type WasteReason = 'Expired' | 'Damaged in Kitchen' | 'Over-Proofed / Burned' | 'Quality Reject';

export interface WasteLog {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: UnitType;
  reason: WasteReason;
  estimated_cost: number;
  logged_by: string;
  logged_by_role: UserRole;
  logged_at: string;
}

export interface SurgeModifiers {
  rainyWeather: boolean; // +20%
  weekendRush: boolean;  // +35%
  festiveSeason: boolean; // +50%
}
