import { Product, Supplier, SalesRecord, StockoutEvent, Alert, PurchaseOrder, Recipe, WasteLog, StockLot } from '../types';

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

const daysFromNow = (days: number): string => formatDate(addDays(now, days));
const daysAgo = (days: number): string => formatDate(addDays(now, -days));

// Date 6 days from now for chocolate chips expiry alert
const chocoExpiryDate = daysFromNow(6);

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
    barcode: 'BAR-EGGS-202',
    is_perishable: true,
    shelf_life_days: 14,
    expiry_date: daysFromNow(4),
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
    barcode: 'BAR-FLOUR-101',
    is_perishable: false,
    shelf_life_days: 90,
    expiry_date: daysFromNow(45),
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
    barcode: 'BAR-BUTTER-303',
    is_perishable: true,
    shelf_life_days: 21,
    expiry_date: daysFromNow(2), // Urgent: 2 days!
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
    barcode: 'BAR-CHOCO-404',
    is_perishable: true,
    shelf_life_days: 90,
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
    barcode: 'BAR-SUGAR-505',
    is_perishable: false,
    shelf_life_days: 365,
    expiry_date: daysFromNow(180),
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
    barcode: 'BAR-MILK-606',
    is_perishable: true,
    shelf_life_days: 5,
    expiry_date: daysFromNow(2), // Urgent: 2 days!
    created_at: '2026-01-01',
    description: 'Fresh dairy milk delivered daily, shelf life 3-5 days.',
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
    barcode: 'BAR-VANILLA-707',
    is_perishable: false,
    shelf_life_days: 365,
    expiry_date: daysFromNow(300),
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
    barcode: 'BAR-BAKING-808',
    is_perishable: false,
    shelf_life_days: 180,
    expiry_date: daysFromNow(150),
    created_at: '2026-01-01',
    description: 'Aluminum-free leavening agent for muffins, scones, and quick breads.',
  },
];

export const INITIAL_STOCK_LOTS: StockLot[] = [
  // 1. Butter (18 kg total = 6 kg urgent + 12 kg fresh)
  {
    id: 'lot-butter-1',
    product_id: 'prod-butter',
    lot_number: 'LOT-BTR-2601',
    quantity: 6,
    initial_quantity: 10,
    received_date: daysAgo(10),
    expiry_date: daysFromNow(2),
    status: 'expiring_soon',
    notes: '82% butterfat European block (prioritize for laminating)',
  },
  {
    id: 'lot-butter-2',
    product_id: 'prod-butter',
    lot_number: 'LOT-BTR-2602',
    quantity: 12,
    initial_quantity: 12,
    received_date: daysAgo(2),
    expiry_date: daysFromNow(18),
    status: 'active',
    notes: 'Fresh dairy crate from Creamy Valley',
  },

  // 2. Milk (15 L total = 5 L urgent + 10 L active)
  {
    id: 'lot-milk-1',
    product_id: 'prod-milk',
    lot_number: 'LOT-MLK-2601',
    quantity: 5,
    initial_quantity: 10,
    received_date: daysAgo(3),
    expiry_date: daysFromNow(2),
    status: 'expiring_soon',
    notes: 'Pasteurized whole milk crate #1',
  },
  {
    id: 'lot-milk-2',
    product_id: 'prod-milk',
    lot_number: 'LOT-MLK-2602',
    quantity: 10,
    initial_quantity: 10,
    received_date: daysAgo(1),
    expiry_date: daysFromNow(5),
    status: 'active',
    notes: 'Morning dairy delivery',
  },

  // 3. Eggs (24 pcs total = 12 pcs soon + 12 pcs active)
  {
    id: 'lot-eggs-1',
    product_id: 'prod-eggs',
    lot_number: 'LOT-EGG-2601',
    quantity: 12,
    initial_quantity: 30,
    received_date: daysAgo(8),
    expiry_date: daysFromNow(4),
    status: 'active',
    notes: 'Grade A Brown Farm eggs tray 1',
  },
  {
    id: 'lot-eggs-2',
    product_id: 'prod-eggs',
    lot_number: 'LOT-EGG-2602',
    quantity: 12,
    initial_quantity: 12,
    received_date: daysAgo(2),
    expiry_date: daysFromNow(12),
    status: 'active',
    notes: 'Grade A Brown Farm eggs tray 2',
  },

  // 4. Chocolate Chips (22 kg total = 6 kg expiring soon + 16 kg active)
  {
    id: 'lot-choco-1',
    product_id: 'prod-choco',
    lot_number: 'LOT-CHC-2601',
    quantity: 6,
    initial_quantity: 10,
    received_date: daysAgo(20),
    expiry_date: chocoExpiryDate,
    status: 'expiring_soon',
    notes: 'Dark Couverture 70% drops (expiring soon alert)',
  },
  {
    id: 'lot-choco-2',
    product_id: 'prod-choco',
    lot_number: 'LOT-CHC-2602',
    quantity: 16,
    initial_quantity: 16,
    received_date: daysAgo(5),
    expiry_date: daysFromNow(75),
    status: 'active',
    notes: 'Imported couverture sack',
  },

  // 5. Flour (65 kg total = 25 kg + 40 kg)
  {
    id: 'lot-flour-1',
    product_id: 'prod-flour',
    lot_number: 'LOT-FLR-2601',
    quantity: 25,
    initial_quantity: 50,
    received_date: daysAgo(20),
    expiry_date: daysFromNow(45),
    status: 'active',
    notes: 'Unbleached maida sack A',
  },
  {
    id: 'lot-flour-2',
    product_id: 'prod-flour',
    lot_number: 'LOT-FLR-2602',
    quantity: 40,
    initial_quantity: 40,
    received_date: daysAgo(5),
    expiry_date: daysFromNow(75),
    status: 'active',
    notes: 'Unbleached maida sack B',
  },

  // 6. Sugar (145 kg total = 45 kg + 100 kg)
  {
    id: 'lot-sugar-1',
    product_id: 'prod-sugar',
    lot_number: 'LOT-SGR-2601',
    quantity: 45,
    initial_quantity: 50,
    received_date: daysAgo(30),
    expiry_date: daysFromNow(180),
    status: 'active',
    notes: 'Fine granulated sack',
  },
  {
    id: 'lot-sugar-2',
    product_id: 'prod-sugar',
    lot_number: 'LOT-SGR-2602',
    quantity: 100,
    initial_quantity: 100,
    received_date: daysAgo(10),
    expiry_date: daysFromNow(240),
    status: 'active',
    notes: 'Bulk pallet store',
  },

  // 7. Vanilla (9 bottles total)
  {
    id: 'lot-vanilla-1',
    product_id: 'prod-vanilla',
    lot_number: 'LOT-VAN-2601',
    quantity: 9,
    initial_quantity: 12,
    received_date: daysAgo(40),
    expiry_date: daysFromNow(300),
    status: 'active',
    notes: 'Madagascar Bourbon 500ml amber bottles',
  },

  // 8. Baking Powder (28 tins total)
  {
    id: 'lot-bp-1',
    product_id: 'prod-bakingpowder',
    lot_number: 'LOT-BKP-2601',
    quantity: 28,
    initial_quantity: 30,
    received_date: daysAgo(15),
    expiry_date: daysFromNow(150),
    status: 'active',
    notes: 'Double-acting 500g tin carton',
  },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-croissant',
    name: 'French Butter Croissants',
    category: 'Viennoiserie',
    yield_quantity: 24,
    yield_unit: 'pieces',
    prep_time_mins: 180,
    selling_price: 110,
    description: 'Flaky 27-layer laminated French croissants with 82% butterfat.',
    ingredients: [
      { product_id: 'prod-flour', quantity: 1.5, unit: 'kg' },
      { product_id: 'prod-butter', quantity: 0.8, unit: 'kg' },
      { product_id: 'prod-sugar', quantity: 0.25, unit: 'kg' },
      { product_id: 'prod-milk', quantity: 0.5, unit: 'liters' },
      { product_id: 'prod-eggs', quantity: 4, unit: 'pieces' },
    ],
  },
  {
    id: 'rec-sourdough',
    name: 'Artisan Country Sourdough',
    category: 'Artisan Breads',
    yield_quantity: 20,
    yield_unit: 'loaves',
    prep_time_mins: 720,
    selling_price: 160,
    description: 'Naturally fermented 36-hour slow cold-retarded sourdough with wild starter.',
    ingredients: [
      { product_id: 'prod-flour', quantity: 9.0, unit: 'kg' },
      { product_id: 'prod-sugar', quantity: 0.2, unit: 'kg' },
    ],
  },
  {
    id: 'rec-brioche-choco',
    name: 'Dark Chocolate Brioche Buns',
    category: 'Sweet Breads',
    yield_quantity: 16,
    yield_unit: 'buns',
    prep_time_mins: 120,
    selling_price: 140,
    description: 'Enriched golden brioche stuffed with 70% dark Belgian couverture drops.',
    ingredients: [
      { product_id: 'prod-flour', quantity: 1.2, unit: 'kg' },
      { product_id: 'prod-butter', quantity: 0.4, unit: 'kg' },
      { product_id: 'prod-choco', quantity: 0.5, unit: 'kg' },
      { product_id: 'prod-eggs', quantity: 6, unit: 'pieces' },
      { product_id: 'prod-sugar', quantity: 0.3, unit: 'kg' },
      { product_id: 'prod-milk', quantity: 0.3, unit: 'liters' },
    ],
  },
  {
    id: 'rec-vanilla-cake',
    name: 'Madagascar Celebration Sponge',
    category: 'Cakes & Pastries',
    yield_quantity: 2,
    yield_unit: 'cakes',
    prep_time_mins: 90,
    selling_price: 850,
    description: 'Three-tiered fluffy vanilla sponge with double-fold Bourbon extract.',
    ingredients: [
      { product_id: 'prod-flour', quantity: 0.8, unit: 'kg' },
      { product_id: 'prod-sugar', quantity: 0.6, unit: 'kg' },
      { product_id: 'prod-butter', quantity: 0.4, unit: 'kg' },
      { product_id: 'prod-eggs', quantity: 8, unit: 'pieces' },
      { product_id: 'prod-milk', quantity: 0.4, unit: 'liters' },
      { product_id: 'prod-bakingpowder', quantity: 1, unit: 'tins' },
      { product_id: 'prod-vanilla', quantity: 1, unit: 'bottles' },
    ],
  },
];

export const INITIAL_WASTE_LOGS: WasteLog[] = [
  {
    id: 'waste-1',
    product_id: 'prod-milk',
    product_name: 'Whole Milk Pasteurized',
    quantity: 3,
    unit: 'liters',
    reason: 'Expired',
    estimated_cost: 162,
    logged_by: 'Priya Sharma',
    logged_by_role: 'staff',
    logged_at: '2026-03-05 08:30',
  },
  {
    id: 'waste-2',
    product_id: 'prod-eggs',
    product_name: 'Farm Fresh Brown Eggs',
    quantity: 6,
    unit: 'pieces',
    reason: 'Damaged in Kitchen',
    estimated_cost: 39,
    logged_by: 'Amit Verma',
    logged_by_role: 'purchasing',
    logged_at: '2026-03-06 11:15',
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
