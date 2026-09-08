import { Product, Supplier, SalesRecord, StockoutEvent, Alert, PurchaseOrder } from '../types';

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-sunbeam',
    name: 'Sunbeam Farm Supplies',
    contact: 'Rajesh Sharma',
    phone: '+91 98201 44521',
    email: 'orders@sunbeamfarms.in',
    lead_time_days: 2,
    products_supplied: ['prod-eggs'],
  },
  {
    id: 'sup-golden',
    name: 'Golden Grains Millers & Staples',
    contact: 'Anita Deshmukh',
    phone: '+91 98450 11902',
    email: 'anita@goldengrains.co.in',
    lead_time_days: 4,
    products_supplied: ['prod-flour', 'prod-sugar', 'prod-bakingpowder'],
  },
  {
    id: 'sup-creamy',
    name: 'Creamy Valley Dairies',
    contact: 'Vikram Patel',
    phone: '+91 97123 88410',
    email: 'supply@creamyvalleydairy.com',
    lead_time_days: 3,
    products_supplied: ['prod-butter', 'prod-milk'],
  },
  {
    id: 'sup-cocoa',
    name: 'Cocoa Craft Imports',
    contact: 'Meera Sengupta',
    phone: '+91 99800 33419',
    email: 'meera@cocoacraftimports.com',
    lead_time_days: 5,
    products_supplied: ['prod-choco', 'prod-vanilla'],
  },
];

// Reference date for relative dates (format: YYYY-MM-DD)
const now = new Date();
const formatDate = (d: Date): string => d.toISOString().split('T')[0];

const addDays = (d: Date, days: number): Date => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};

// Date 6 days from now for chocolate chips expiry alert
const chocoExpiryDate = formatDate(addDays(now, 6));

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-eggs',
    name: 'Farm Fresh Brown Eggs',
    category: 'Poultry & Dairy',
    unit: 'pieces',
    cost_price: 6.5,
    selling_price: 9.0,
    current_stock: 24, // below minimum 60 -> CRITICAL
    minimum_required: 60,
    supplier_id: 'sup-sunbeam',
    created_at: '2026-01-01',
    description: 'Grade A brown eggs, critical for cakes, brioche, and morning pastries.',
  },
  {
    id: 'prod-flour',
    name: 'All-Purpose Maida Flour',
    category: 'Dry Staples',
    unit: 'kg',
    cost_price: 42.0,
    selling_price: 65.0,
    current_stock: 65, // minimum 80 -> Reorder due
    minimum_required: 80,
    supplier_id: 'sup-golden',
    created_at: '2026-01-01',
    description: 'High-protein unbleached flour, foundational staple for all bakery lines.',
  },
  {
    id: 'prod-butter',
    name: 'Unsalted Pure Butter',
    category: 'Dairy',
    unit: 'kg',
    cost_price: 420.0,
    selling_price: 580.0,
    current_stock: 18, // runs out in ~4 days (4.5kg/day)
    minimum_required: 25,
    supplier_id: 'sup-creamy',
    created_at: '2026-01-01',
    description: '82% butterfat European-style butter for croissants, puff pastries, and cookies.',
  },
  {
    id: 'prod-choco',
    name: 'Dark Couverture Chocolate Chips 70%',
    category: 'Baking Essentials',
    unit: 'kg',
    cost_price: 550.0,
    selling_price: 820.0,
    current_stock: 22,
    minimum_required: 15,
    supplier_id: 'sup-cocoa',
    expiry_date: chocoExpiryDate, // expiring in 6 days
    created_at: '2026-01-01',
    description: 'Single-origin dark chocolate chips for muffins, ganache, and cookies.',
  },
  {
    id: 'prod-sugar',
    name: 'Fine Granulated Sugar',
    category: 'Dry Staples',
    unit: 'kg',
    cost_price: 45.0,
    selling_price: 60.0,
    current_stock: 145, // healthy
    minimum_required: 50,
    supplier_id: 'sup-golden',
    created_at: '2026-01-01',
    description: 'Pure cane sugar with uniform granule size for sponges and syrups.',
  },
  {
    id: 'prod-milk',
    name: 'Whole Milk Pasteurized',
    category: 'Dairy',
    unit: 'liters',
    cost_price: 54.0,
    selling_price: 74.0,
    current_stock: 15, // minimum 30
    minimum_required: 30,
    supplier_id: 'sup-creamy',
    created_at: '2026-01-01',
    description: 'Fresh dairy milk delivered daily, shelf life 3 days.',
  },
  {
    id: 'prod-vanilla',
    name: 'Madagascar Bourbon Vanilla Extract',
    category: 'Flavors & Extracts',
    unit: 'bottles',
    cost_price: 950.0,
    selling_price: 1450.0,
    current_stock: 9, // slow-moving, high-margin
    minimum_required: 4,
    supplier_id: 'sup-cocoa',
    created_at: '2026-01-01',
    description: 'Double-fold pure natural vanilla extract for signature custards and cakes.',
  },
  {
    id: 'prod-bakingpowder',
    name: 'Double-Acting Baking Powder',
    category: 'Baking Essentials',
    unit: 'tins',
    cost_price: 180.0,
    selling_price: 260.0,
    current_stock: 28, // healthy
    minimum_required: 10,
    supplier_id: 'sup-golden',
    created_at: '2026-01-01',
    description: 'Aluminum-free leavening agent for muffins, scones, and quick breads.',
  },
];

// Helper to generate 90 days of daily sales per product with realistic seasonality
export function generateSeedSales(): SalesRecord[] {
  const records: SalesRecord[] = [];
  const today = new Date();
  
  // Base daily sales targets & trends
  const productProfiles: Record<string, { base: number; weekendMultiplier: number; monthlyGrowth: number; variance: number }> = {
    'prod-eggs': { base: 28, weekendMultiplier: 1.6, monthlyGrowth: 0.05, variance: 6 },
    'prod-flour': { base: 16, weekendMultiplier: 1.35, monthlyGrowth: 0.12, variance: 3 }, // growing demand: ~420 -> ~480 -> ~560
    'prod-butter': { base: 4.5, weekendMultiplier: 1.4, monthlyGrowth: 0.04, variance: 0.8 },
    'prod-choco': { base: 1.8, weekendMultiplier: 1.5, monthlyGrowth: 0.02, variance: 0.5 },
    'prod-sugar': { base: 9.0, weekendMultiplier: 1.25, monthlyGrowth: 0.03, variance: 1.8 },
    'prod-milk': { base: 14.0, weekendMultiplier: 1.5, monthlyGrowth: 0.04, variance: 2.5 },
    'prod-vanilla': { base: 0.15, weekendMultiplier: 1.1, monthlyGrowth: 0.01, variance: 0.1 }, // slow moving
    'prod-bakingpowder': { base: 0.7, weekendMultiplier: 1.2, monthlyGrowth: 0.02, variance: 0.2 },
  };

  INITIAL_PRODUCTS.forEach((product) => {
    const profile = productProfiles[product.id] || { base: 5, weekendMultiplier: 1.2, monthlyGrowth: 0.02, variance: 1 };
    
    for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() - dayOffset);
      const dayOfWeek = dateObj.getDay(); // 0 is Sun, 6 is Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Month factor: 0-29 days ago (month 3), 30-59 (month 2), 60-89 (month 1)
      const monthIndex = Math.floor((89 - dayOffset) / 30); // 0 (oldest) to 2 (recent)
      const growthFactor = 1 + (monthIndex * profile.monthlyGrowth);
      
      const weekendFactor = isWeekend ? profile.weekendMultiplier : 1.0;
      // Deterministic pseudo-random variation based on dayOffset and product ID length
      const pseudoNoise = (Math.sin(dayOffset * 13 + product.id.charCodeAt(5)) + 1) / 2; // 0 to 1
      const noise = (pseudoNoise - 0.5) * 2 * profile.variance;

      let units = (profile.base * growthFactor * weekendFactor) + noise;
      if (product.unit === 'pieces' || product.unit === 'bottles' || product.unit === 'tins') {
        units = Math.max(0, Math.round(units));
      } else {
        units = Math.max(0, parseFloat(units.toFixed(1)));
      }

      // Ensure some non-zero activity
      if (units === 0 && Math.random() > 0.8) units = 1;

      const revenue = Math.round(units * product.selling_price);

      records.push({
        id: `sale-${product.id}-${dayOffset}`,
        product_id: product.id,
        date: formatDate(dateObj),
        units_sold: units,
        revenue,
      });
    }
  });

  return records;
}

export const INITIAL_STOCKOUTS: StockoutEvent[] = [
  {
    id: 'so-1',
    product_id: 'prod-eggs',
    product_name: 'Farm Fresh Brown Eggs',
    date: formatDate(addDays(now, -14)), // 2 weeks ago Friday
    estimated_units_lost: 48,
    estimated_revenue_lost: 3200,
    notes: 'Ran out Friday morning before weekend rush. Cancelled 12 whole cake orders.',
  },
  {
    id: 'so-2',
    product_id: 'prod-butter',
    product_name: 'Unsalted Pure Butter',
    date: formatDate(addDays(now, -28)),
    estimated_units_lost: 8,
    estimated_revenue_lost: 4640,
    notes: 'Croissant batch delayed by 24 hours. Supplier took 3 days over weekend.',
  },
  {
    id: 'so-3',
    product_id: 'prod-milk',
    product_name: 'Whole Milk Pasteurized',
    date: formatDate(addDays(now, -42)),
    estimated_units_lost: 22,
    estimated_revenue_lost: 1628,
    notes: 'Turned away 15 latte/custard customers on festive Sunday morning.',
  },
  {
    id: 'so-4',
    product_id: 'prod-eggs',
    product_name: 'Farm Fresh Brown Eggs',
    date: formatDate(addDays(now, -65)),
    estimated_units_lost: 60,
    estimated_revenue_lost: 4100,
    notes: 'Major stockout during local food festival weekend.',
  },
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alert-eggs-crit',
    product_id: 'prod-eggs',
    product_name: 'Farm Fresh Brown Eggs',
    type: 'low_stock',
    severity: 'critical',
    message: 'Eggs below threshold (24/60 units). At 28 units/day, stockout expected in less than 24 hours!',
    created_at: formatDate(now),
    resolved: false,
  },
  {
    id: 'alert-butter-warn',
    product_id: 'prod-butter',
    product_name: 'Unsalted Pure Butter',
    type: 'reorder_due',
    severity: 'warning',
    message: 'Butter will run out in 4 days at current consumption rate. Lead time is 3 days.',
    created_at: formatDate(now),
    resolved: false,
  },
  {
    id: 'alert-choco-exp',
    product_id: 'prod-choco',
    product_name: 'Dark Couverture Chocolate Chips 70%',
    type: 'expiring_soon',
    severity: 'warning',
    message: `Chocolate chips batch expiring in 6 days (${chocoExpiryDate}) — 12 units remaining unsold.`,
    created_at: formatDate(now),
    resolved: false,
  },
  {
    id: 'alert-flour-info',
    product_id: 'prod-flour',
    product_name: 'All-Purpose Maida Flour',
    type: 'reorder_due',
    severity: 'info',
    message: 'Flour reorder recommended — order 85 kg within 4 days to maintain safety buffer.',
    created_at: formatDate(addDays(now, -1)),
    resolved: false,
  },
  {
    id: 'alert-milk-warn',
    product_id: 'prod-milk',
    product_name: 'Whole Milk Pasteurized',
    type: 'low_stock',
    severity: 'warning',
    message: 'Milk stock low (15/30 liters). Next supply scheduled in 24 hours.',
    created_at: formatDate(now),
    resolved: false,
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    po_number: 'PO-2026-089',
    supplier_id: 'sup-golden',
    supplier_name: 'Golden Grains Millers & Staples',
    product_id: 'prod-flour',
    product_name: 'All-Purpose Maida Flour',
    quantity: 100,
    unit: 'kg',
    unit_cost: 42,
    total_cost: 4200,
    order_date: formatDate(addDays(now, -3)),
    expected_delivery_date: formatDate(addDays(now, 1)),
    status: 'Sent',
    notes: 'Regular bi-weekly bulk restock',
  },
  {
    id: 'po-100',
    po_number: 'PO-2026-088',
    supplier_id: 'sup-sunbeam',
    supplier_name: 'Sunbeam Farm Supplies',
    product_id: 'prod-eggs',
    product_name: 'Farm Fresh Brown Eggs',
    quantity: 120,
    unit: 'pieces',
    unit_cost: 6.5,
    total_cost: 780,
    order_date: formatDate(addDays(now, -7)),
    expected_delivery_date: formatDate(addDays(now, -5)),
    status: 'Delivered',
    notes: 'Last week emergency refill',
  },
];
