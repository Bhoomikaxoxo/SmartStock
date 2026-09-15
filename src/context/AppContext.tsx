import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  SalesRecord,
  Supplier,
  Alert,
  StockoutEvent,
  PurchaseOrder,
  ActiveTab,
  FinancialImpactConfig,
  ReorderRecommendation,
  UserRole,
  Recipe,
  WasteLog,
  WasteReason,
  SurgeModifiers,
  StockLot,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_ALERTS,
  INITIAL_STOCKOUTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RECIPES,
  INITIAL_WASTE_LOGS,
  INITIAL_STOCK_LOTS,
  generateSeedSales,
} from '../data/seedData';
import {
  computeAllReorderRecommendations,
  evaluateDynamicAlerts,
  BUFFER_DAYS_DEFAULT,
} from '../services/reorderEngine';
import { saveDebounced, flushPendingStorage } from '../utils/debouncedStorage';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface ActivityItem {
  id: string;
  type: 'sale' | 'reorder' | 'stockout' | 'restock' | 'alert_resolved' | 'production' | 'waste';
  title: string;
  description: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
}

interface AppContextType {
  products: Product[];
  sales: SalesRecord[];
  suppliers: Supplier[];
  alerts: Alert[];
  stockouts: StockoutEvent[];
  purchaseOrders: PurchaseOrder[];
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  stockLots: StockLot[];
  surgeModifiers: SurgeModifiers;
  surgeMultiplier: number;
  activeTab: ActiveTab;
  financialConfig: FinancialImpactConfig;
  reorderRecommendations: ReorderRecommendation[];
  activities: ActivityItem[];
  
  // State setters & actions
  setActiveTab: (tab: ActiveTab) => void;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateStock: (productId: string, newStock: number, reason?: string) => void;
  recordSale: (productId: string, unitsSold: number) => { success: boolean; error?: string };
  produceBatch: (recipeId: string, batchCount: number) => { success: boolean; shortages?: string[]; fifoDetails?: string[] };
  logWaste: (productId: string, quantity: number, reason: WasteReason, lotId?: string) => { success: boolean; error?: string };
  receiveStock: (productId: string, quantity: number, poId?: string, lotNumber?: string, expiryDate?: string) => void;
  getLotsForProduct: (productId: string) => StockLot[];
  getExpiringLots: (withinDays?: number) => (StockLot & { product?: Product; daysUntilExpiry: number })[];
  addStockLot: (lotData: Omit<StockLot, 'id' | 'status'>) => void;
  setSurgeModifiers: React.Dispatch<React.SetStateAction<SurgeModifiers>>;
  resolveAlert: (alertId: string) => void;
  createPurchaseOrder: (poData: {
    supplier_id: string;
    product_id: string;
    quantity: number;
    unit_cost: number;
    notes?: string;
  }) => PurchaseOrder | null;
  updateFinancialConfig: (config: Partial<FinancialImpactConfig>) => void;
  simulateWeekendEggStockout: () => void;
  resetToDemoData: () => void;
}

const STORAGE_KEYS = {
  PRODUCTS: 'smartstock_products_v3',
  SALES: 'smartstock_sales_v3',
  SUPPLIERS: 'smartstock_suppliers_v3',
  ALERTS: 'smartstock_alerts_v3',
  RESOLVED_ALERTS: 'smartstock_resolved_alerts_v4',
  STOCKOUTS: 'smartstock_stockouts_v3',
  POS: 'smartstock_pos_v3',
  ACTIVITIES: 'smartstock_activities_v3',
  FINANCIAL: 'smartstock_financial_v3',
  RECIPES: 'smartstock_recipes_v3',
  WASTE_LOGS: 'smartstock_waste_v3',
  LOTS: 'smartstock_lots_v4',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<SalesRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : generateSeedSales();
  });

  const [suppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  // Base/simulated alerts
  const [customAlerts, setCustomAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  // Persisted record of resolved alert IDs with resolved_at timestamp
  const [resolvedAlertMap, setResolvedAlertMap] = useState<Record<string, { resolved: boolean; resolved_at: string }>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESOLVED_ALERTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    // Pre-populate with initially resolved alerts if any
    const initialMap: Record<string, { resolved: boolean; resolved_at: string }> = {};
    INITIAL_ALERTS.forEach((a) => {
      if (a.resolved) {
        initialMap[a.id] = { resolved: true, resolved_at: a.resolved_at || a.created_at };
      }
    });
    return initialMap;
  });

  const [stockouts, setStockouts] = useState<StockoutEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCKOUTS);
    return saved ? JSON.parse(saved) : INITIAL_STOCKOUTS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POS);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'act-1',
            type: 'reorder',
            title: 'Purchase Order Dispatched',
            description: 'Amit Verma (Purchasing Staff) dispatched PO-2026-089 to Golden Grains (100 kg Flour, ₹4,200).',
            actorName: 'Amit Verma',
            actorRole: 'purchasing',
            timestamp: '2 hours ago',
          },
          {
            id: 'act-2',
            type: 'alert_resolved',
            title: 'Milk Stock Replenished',
            description: 'Priya Sharma (Staff) marked alert resolved: Received daily morning dairy crate (25 liters).',
            actorName: 'Priya Sharma',
            actorRole: 'staff',
            timestamp: '5 hours ago',
          },
          {
            id: 'act-3',
            type: 'stockout',
            title: 'Egg Stock Depleted Dangerously',
            description: 'System detected: Eggs inventory dropped to 24 units. Weekend batching threatened.',
            actorName: 'System',
            actorRole: 'owner',
            timestamp: 'Yesterday',
          },
        ];
  });

  const [financialConfig, setFinancialConfig] = useState<FinancialImpactConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
    return saved ? JSON.parse(saved) : {
      incidentsBefore: 5,
      avgLossPerIncident: 2000,
      incidentsAfter: 1,
    };
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WASTE_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_WASTE_LOGS;
  });

  const [stockLots, setStockLots] = useState<StockLot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOTS);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_LOTS;
  });

  const [surgeModifiers, setSurgeModifiers] = useState<SurgeModifiers>({
    rainyWeather: false,
    weekendRush: false,
    festiveSeason: false,
  });

  const surgeMultiplier = useMemo(() => {
    let multiplier = 1.0;
    if (surgeModifiers.rainyWeather) multiplier += 0.2;
    if (surgeModifiers.weekendRush) multiplier += 0.35;
    if (surgeModifiers.festiveSeason) multiplier += 0.5;
    return parseFloat(multiplier.toFixed(2));
  }, [surgeModifiers]);

  // Debounced persistence to avoid blocking main thread on high-frequency state updates
  useEffect(() => {
    saveDebounced(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.SALES, sales);
  }, [sales]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.ALERTS, customAlerts);
  }, [customAlerts]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.RESOLVED_ALERTS, resolvedAlertMap);
  }, [resolvedAlertMap]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.STOCKOUTS, stockouts);
  }, [stockouts]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.POS, purchaseOrders);
  }, [purchaseOrders]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.ACTIVITIES, activities);
  }, [activities]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.FINANCIAL, financialConfig);
  }, [financialConfig]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.RECIPES, recipes);
  }, [recipes]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.WASTE_LOGS, wasteLogs);
  }, [wasteLogs]);

  useEffect(() => {
    saveDebounced(STORAGE_KEYS.LOTS, stockLots);
  }, [stockLots]);

  // Pure derived alerts: Evaluates inventory thresholds & reconciles resolution status
  // Completely eliminates cascading setState inside useEffect
  const alerts = useMemo<Alert[]>(() => {
    const dynamic = evaluateDynamicAlerts(products, sales, suppliers);
    const combinedMap = new Map<string, Alert>();

    // Register custom/manual simulation alerts first
    customAlerts.forEach((a) => combinedMap.set(a.id, a));

    // Register dynamic evaluation alerts
    dynamic.forEach((da) => {
      if (!combinedMap.has(da.id)) {
        combinedMap.set(da.id, da);
      }
    });

    // Reconcile user resolution records
    return Array.from(combinedMap.values()).map((a) => {
      const res = resolvedAlertMap[a.id];
      if (res) {
        return { ...a, resolved: res.resolved, resolved_at: res.resolved_at };
      }
      return a;
    });
  }, [products, sales, suppliers, customAlerts, resolvedAlertMap]);

  // Optimized O(N + M) reorder recommendations computation
  const reorderRecommendations = useMemo(() => {
    return computeAllReorderRecommendations(products, sales, suppliers, BUFFER_DAYS_DEFAULT, surgeMultiplier);
  }, [products, sales, suppliers, surgeMultiplier]);

  const addActivity = useCallback((item: Omit<ActivityItem, 'id' | 'timestamp' | 'actorName' | 'actorRole'>) => {
    const newActivity: ActivityItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      actorName: currentUser?.name || 'System',
      actorRole: currentUser?.role || 'owner',
      timestamp: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 24)]);
  }, [currentUser]);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'created_at'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [...prev, newProduct]);
    addActivity({
      type: 'restock',
      title: 'New Product Added',
      description: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'staff'}) added "${newProduct.name}" (${newProduct.current_stock} ${newProduct.unit}).`,
    });
    showToast('success', `Added "${newProduct.name}" to inventory.`);
  }, [currentUser, addActivity, showToast]);

  const updateStock = useCallback((productId: string, newStock: number, reason: string = 'Stock adjustment') => {
    if (newStock < 0) {
      showToast('error', 'Stock count cannot be negative.');
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const diff = newStock - p.current_stock;
          const diffSign = diff >= 0 ? `+${diff}` : `${diff}`;
          addActivity({
            type: diff >= 0 ? 'restock' : 'sale',
            title: `Stock Adjusted: ${p.name}`,
            description: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'staff'}) adjusted stock: ${p.name} from ${p.current_stock} to ${newStock} ${p.unit} (${diffSign}). Reason: ${reason}`,
          });
          return { ...p, current_stock: newStock };
        }
        return p;
      })
    );
    showToast('success', 'Stock adjustment saved successfully.');
  }, [currentUser, addActivity, showToast]);

  const recordSale = useCallback((productId: string, unitsSold: number) => {
    let result: { success: boolean; error?: string } = { success: false, error: 'Product not found' };
    if (unitsSold <= 0) {
      return { success: false, error: 'Please enter a valid positive quantity.' };
    }

    setProducts((prev) => {
      const product = prev.find((p) => p.id === productId);
      if (!product) return prev;

      if (unitsSold > product.current_stock) {
        result = {
          success: false,
          error: `Cannot sell ${unitsSold} ${product.unit}. Only ${product.current_stock} ${product.unit} available in stock.`,
        };
        return prev;
      }

      const revenue = Math.round(unitsSold * product.selling_price);
      const today = new Date().toISOString().split('T')[0];

      const newSale: SalesRecord = {
        id: `sale-${Date.now()}`,
        product_id: productId,
        date: today,
        units_sold: unitsSold,
        revenue,
      };
      setSales((salesPrev) => [newSale, ...salesPrev]);

      const updatedStock = product.current_stock - unitsSold;

      addActivity({
        type: 'sale',
        title: `Sale Recorded: ${product.name}`,
        description: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'staff'}) recorded sale: ${unitsSold} ${product.unit} of ${product.name} (₹${revenue.toLocaleString('en-IN')}). Remaining: ${updatedStock}.`,
      });

      if (updatedStock === 0) {
        const newStockout: StockoutEvent = {
          id: `so-${Date.now()}`,
          product_id: productId,
          product_name: product.name,
          date: today,
          estimated_units_lost: Math.round(unitsSold * 1.5),
          estimated_revenue_lost: Math.round(unitsSold * 1.5 * product.selling_price),
          notes: `Depleted to 0 units during store sale.`,
        };
        setStockouts((soPrev) => [newStockout, ...soPrev]);
        addActivity({
          type: 'stockout',
          title: `OUT OF STOCK: ${product.name}`,
          description: `Product inventory reached 0 units. Immediate restock required.`,
        });
      }

      showToast('success', `Recorded sale of ${unitsSold} ${product.unit} (${product.name}).`);
      result = { success: true };
      return prev.map((p) => (p.id === productId ? { ...p, current_stock: updatedStock } : p));
    });

    return result;
  }, [currentUser, addActivity, showToast]);

  const resolveAlert = useCallback((alertId: string) => {
    setResolvedAlertMap((prev) => ({
      ...prev,
      [alertId]: { resolved: true, resolved_at: new Date().toISOString() },
    }));
    addActivity({
      type: 'alert_resolved',
      title: 'Alert Resolved',
      description: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'staff'}) marked alert resolved.`,
    });
    showToast('success', 'Alert marked as resolved.');
  }, [currentUser, addActivity, showToast]);

  const createPurchaseOrder = useCallback((poData: {
    supplier_id: string;
    product_id: string;
    quantity: number;
    unit_cost: number;
    notes?: string;
  }) => {
    // Only Owner and Purchasing Staff are authorized
    if (currentUser?.role === 'staff') {
      showToast('error', 'Unauthorized: Only Owner or Purchasing Staff can issue Purchase Orders.');
      return null;
    }

    const product = products.find((p) => p.id === poData.product_id);
    const supplier = suppliers.find((s) => s.id === poData.supplier_id);
    const totalCost = Math.round(poData.quantity * poData.unit_cost);
    const today = new Date();
    const leadTime = supplier?.lead_time_days || 2;
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + leadTime);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      po_number: `PO-${today.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      supplier_id: poData.supplier_id,
      supplier_name: supplier?.name || 'Supplier',
      product_id: poData.product_id,
      product_name: product?.name || 'Item',
      quantity: poData.quantity,
      unit: product?.unit || 'pieces',
      unit_cost: poData.unit_cost,
      total_cost: totalCost,
      order_date: today.toISOString().split('T')[0],
      expected_delivery_date: deliveryDate.toISOString().split('T')[0],
      status: 'Sent',
      notes: poData.notes || `Reorder generated.`,
      issued_by: `${currentUser?.name} (${currentUser?.role})`,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);

    // Mark matching reorder alerts as resolved
    setResolvedAlertMap((prev) => {
      const updated = { ...prev };
      alerts
        .filter((a) => a.product_id === poData.product_id && a.type === 'reorder_due')
        .forEach((a) => {
          updated[a.id] = { resolved: true, resolved_at: today.toISOString() };
        });
      return updated;
    });

    addActivity({
      type: 'reorder',
      title: `Purchase Order Issued: ${newPO.po_number}`,
      description: `${currentUser?.name || 'Purchasing'} (${currentUser?.role || 'purchasing'}) dispatched ${newPO.po_number} to ${newPO.supplier_name} (${newPO.quantity} ${newPO.unit} ${newPO.product_name}, ₹${totalCost.toLocaleString('en-IN')}).`,
    });

    showToast('success', `Purchase Order ${newPO.po_number} sent to ${newPO.supplier_name}.`);
    return newPO;
  }, [currentUser, products, suppliers, alerts, addActivity, showToast]);

  const produceBatch = useCallback((
    recipeId: string,
    batchCount: number
  ): { success: boolean; shortages?: string[]; fifoDetails?: string[] } => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) {
      showToast('error', 'Recipe not found.');
      return { success: false, shortages: ['Recipe not found'] };
    }

    if (batchCount <= 0) {
      showToast('error', 'Batch count must be at least 1.');
      return { success: false, shortages: ['Invalid batch count'] };
    }

    // Check availability of each ingredient
    const shortages: string[] = [];
    const deductions: { product: Product; needed: number }[] = [];

    for (const ing of recipe.ingredients) {
      const product = products.find((p) => p.id === ing.product_id);
      const needed = parseFloat((ing.quantity * batchCount).toFixed(2));
      if (!product) {
        shortages.push(`Unknown ingredient ID: ${ing.product_id}`);
      } else if (product.current_stock < needed) {
        shortages.push(
          `${product.name}: Requires ${needed} ${ing.unit}, available ${product.current_stock} ${ing.unit}`
        );
      } else {
        deductions.push({ product, needed });
      }
    }

    if (shortages.length > 0) {
      showToast('error', `Cannot bake: insufficient stock for ${batchCount} batch(es).`);
      return { success: false, shortages };
    }

    const today = new Date().toISOString().split('T')[0];

    // Deduct stock from products
    setProducts((prev) =>
      prev.map((p) => {
        const item = deductions.find((d) => d.product.id === p.id);
        if (!item) return p;
        const newStock = Math.max(0, parseFloat((p.current_stock - item.needed).toFixed(2)));
        if (newStock === 0) {
          const newStockout: StockoutEvent = {
            id: `so-${Date.now()}-${p.id}`,
            product_id: p.id,
            product_name: p.name,
            date: today,
            estimated_units_lost: Math.round(item.needed * 1.5),
            estimated_revenue_lost: Math.round(item.needed * 1.5 * p.selling_price),
            notes: `Depleted to 0 units after baking batch of ${recipe.name}.`,
          };
          setStockouts((so) => [newStockout, ...so]);
        }
        return { ...p, current_stock: newStock };
      })
    );

    // FIFO LOT DEDUCTION ENGINE
    const fifoDetails: string[] = [];
    setStockLots((prevLots) => {
      const updatedLots = prevLots.map((l) => ({ ...l }));
      for (const item of deductions) {
        let remaining = item.needed;
        const matchingLots = updatedLots
          .filter((l) => l.product_id === item.product.id && l.quantity > 0)
          .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));

        for (const lot of matchingLots) {
          if (remaining <= 0) break;
          const take = Math.min(lot.quantity, remaining);
          lot.quantity = parseFloat((lot.quantity - take).toFixed(2));
          remaining = parseFloat((remaining - take).toFixed(2));
          if (lot.quantity === 0) {
            lot.status = 'depleted';
          }
          fifoDetails.push(`${item.product.name}: ${take} ${item.product.unit} from ${lot.lot_number}`);
        }
      }
      return updatedLots;
    });

    // Write consumption records into rolling-window sales dataset
    const newConsumptionRecords: SalesRecord[] = deductions.map((d) => ({
      id: `consume-${Date.now()}-${d.product.id}`,
      product_id: d.product.id,
      date: today,
      units_sold: d.needed,
      revenue: 0,
    }));
    setSales((prev) => [...newConsumptionRecords, ...prev]);

    const totalYield = batchCount * recipe.yield_quantity;
    const fifoSummary = fifoDetails.slice(0, 3).join(', ');

    addActivity({
      type: 'production',
      title: `Bake Completed: ${recipe.name}`,
      description: `${currentUser?.name || 'Baker'} (${currentUser?.role || 'staff'}) baked ${batchCount} batch(es) of ${recipe.name} (${totalYield} ${recipe.yield_unit}). FIFO consumed oldest lots (${fifoSummary}${fifoDetails.length > 3 ? '...' : ''}).`,
    });

    showToast(
      'success',
      `Baked ${batchCount} batch(es) of ${recipe.name}. FIFO auto-consumed from oldest batches.`
    );
    return { success: true, fifoDetails };
  }, [recipes, products, currentUser, addActivity, showToast]);

  const logWaste = useCallback((
    productId: string,
    quantity: number,
    reason: WasteReason,
    lotId?: string
  ): { success: boolean; error?: string } => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      showToast('error', 'Product not found.');
      return { success: false, error: 'Product not found' };
    }

    if (quantity <= 0) {
      showToast('error', 'Waste quantity must be greater than 0.');
      return { success: false, error: 'Quantity must be positive' };
    }

    if (quantity > product.current_stock) {
      showToast('error', `Cannot log ${quantity} ${product.unit}. Current stock is only ${product.current_stock} ${product.unit}.`);
      return { success: false, error: 'Quantity exceeds available stock' };
    }

    const estimatedCost = Math.round(quantity * product.cost_price);
    const newStock = Math.max(0, parseFloat((product.current_stock - quantity).toFixed(2)));

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, current_stock: newStock } : p))
    );

    // Deduct from specified lot or oldest active lot
    setStockLots((prevLots) => {
      const updated = prevLots.map((l) => ({ ...l }));
      if (lotId) {
        const target = updated.find((l) => l.id === lotId);
        if (target) {
          target.quantity = Math.max(0, parseFloat((target.quantity - quantity).toFixed(2)));
          if (target.quantity === 0) target.status = 'depleted';
        }
      } else {
        const oldest = updated
          .filter((l) => l.product_id === productId && l.quantity > 0)
          .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date))[0];
        if (oldest) {
          oldest.quantity = Math.max(0, parseFloat((oldest.quantity - quantity).toFixed(2)));
          if (oldest.quantity === 0) oldest.status = 'depleted';
        }
      }
      return updated;
    });

    // Create waste log entry
    const newLog: WasteLog = {
      id: `waste-${Date.now()}`,
      product_id: productId,
      product_name: product.name,
      quantity,
      unit: product.unit,
      reason,
      estimated_cost: estimatedCost,
      logged_by: currentUser?.name || 'Staff Member',
      logged_by_role: currentUser?.role || 'staff',
      logged_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setWasteLogs((prev) => [newLog, ...prev]);

    if (newStock === 0) {
      const today = new Date().toISOString().split('T')[0];
      const newStockout: StockoutEvent = {
        id: `so-${Date.now()}-${productId}`,
        product_id: productId,
        product_name: product.name,
        date: today,
        estimated_units_lost: Math.round(quantity * 1.5),
        estimated_revenue_lost: Math.round(quantity * 1.5 * product.selling_price),
        notes: `Depleted to 0 units after shrinkage write-off (${reason}).`,
      };
      setStockouts((so) => [newStockout, ...so]);
    }

    addActivity({
      type: 'waste',
      title: `Shrinkage Recorded: ${product.name}`,
      description: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'staff'}) logged waste: ${quantity} ${product.unit} of ${product.name} (${reason}, loss ₹${estimatedCost.toLocaleString('en-IN')}).`,
    });

    showToast('success', `Logged ${quantity} ${product.unit} ${product.name} as waste (${reason}).`);
    return { success: true };
  }, [products, currentUser, addActivity, showToast]);

  const receiveStock = useCallback((
    productId: string,
    quantity: number,
    poId?: string,
    lotNumber?: string,
    expiryDate?: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      showToast('error', 'Product not found.');
      return;
    }

    if (quantity <= 0) {
      showToast('error', 'Received quantity must be positive.');
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const shelfLife = product.shelf_life_days || 14;
    const defaultExpDate = new Date(today);
    defaultExpDate.setDate(defaultExpDate.getDate() + shelfLife);
    const assignedExpiry = expiryDate || defaultExpDate.toISOString().split('T')[0];
    const assignedLotNum =
      lotNumber ||
      `LOT-${product.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newStock = parseFloat((product.current_stock + quantity).toFixed(2));
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              current_stock: newStock,
              expiry_date:
                p.expiry_date && p.expiry_date < assignedExpiry ? p.expiry_date : assignedExpiry,
            }
          : p
      )
    );

    // Create new StockLot
    const newLot: StockLot = {
      id: `lot-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      product_id: productId,
      lot_number: assignedLotNum,
      quantity: quantity,
      initial_quantity: quantity,
      received_date: todayStr,
      expiry_date: assignedExpiry,
      status: 'active',
      notes: poId ? `Received from PO delivery` : `Dockside scan intake`,
    };
    setStockLots((prev) => [newLot, ...prev]);

    // If PO was matched, mark it as Delivered
    if (poId) {
      setPurchaseOrders((prev) =>
        prev.map((po) => (po.id === poId ? { ...po, status: 'Delivered' } : po))
      );
    }

    // Resolve matching low_stock / reorder_due alerts
    setResolvedAlertMap((prev) => {
      const updated = { ...prev };
      alerts
        .filter((a) => a.product_id === productId && !a.resolved)
        .forEach((a) => {
          updated[a.id] = { resolved: true, resolved_at: new Date().toISOString() };
        });
      return updated;
    });

    addActivity({
      type: 'restock',
      title: `Stock Received: ${product.name}`,
      description: `${currentUser?.name || 'Receiving Staff'} (${currentUser?.role || 'staff'}) received ${quantity} ${product.unit} ${product.name} (Lot: ${assignedLotNum}, exp: ${assignedExpiry}).`,
    });

    showToast(
      'success',
      `Received ${quantity} ${product.unit} of ${product.name}. Registered lot ${assignedLotNum} (Exp: ${assignedExpiry}).`
    );
  }, [products, alerts, currentUser, addActivity, showToast]);

  const getLotsForProduct = useCallback((productId: string): StockLot[] => {
    return stockLots.filter((lot) => lot.product_id === productId);
  }, [stockLots]);

  const getExpiringLots = useCallback((withinDays: number = 7) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const productMap = new Map(products.map((p) => [p.id, p]));

    return stockLots
      .filter((lot) => lot.quantity > 0)
      .map((lot) => {
        const exp = new Date(lot.expiry_date);
        exp.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const product = productMap.get(lot.product_id);
        return {
          ...lot,
          product,
          daysUntilExpiry: diffDays,
        };
      })
      .filter((lot) => lot.daysUntilExpiry <= withinDays)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [stockLots, products]);

  const addStockLot = useCallback((lotData: Omit<StockLot, 'id' | 'status'>) => {
    const newLot: StockLot = {
      ...lotData,
      id: `lot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'active',
    };
    setStockLots((prev) => [newLot, ...prev]);

    // Reconcile product current_stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === lotData.product_id
          ? {
              ...p,
              current_stock: parseFloat((p.current_stock + lotData.quantity).toFixed(2)),
              expiry_date:
                p.expiry_date && p.expiry_date < lotData.expiry_date
                  ? p.expiry_date
                  : lotData.expiry_date,
            }
          : p
      )
    );

    addActivity({
      type: 'restock',
      title: `Batch Lot Registered: ${newLot.lot_number}`,
      description: `${currentUser?.name || 'Staff'} registered new lot ${newLot.lot_number} (${newLot.quantity} units, exp: ${newLot.expiry_date}).`,
    });
    showToast('success', `Added lot ${newLot.lot_number} (${newLot.quantity} units).`);
  }, [currentUser, addActivity, showToast]);

  const updateFinancialConfig = useCallback((config: Partial<FinancialImpactConfig>) => {
    setFinancialConfig((prev) => ({ ...prev, ...config }));
  }, []);

  const simulateWeekendEggStockout = useCallback(() => {
    updateStock('prod-eggs', 6, 'Friday morning pre-weekend stock count alert');
    
    const newAlert: Alert = {
      id: `alert-eggs-sim-${Date.now()}`,
      product_id: 'prod-eggs',
      product_name: 'Farm Fresh Brown Eggs',
      type: 'low_stock',
      severity: 'critical',
      message: 'SIMULATION ALERT: Eggs inventory at only 6 pieces on Friday morning! Sunbeam Farm supplier lead time is 2 days. Weekend cakes at severe risk!',
      created_at: new Date().toISOString().split('T')[0],
      resolved: false,
    };
    setCustomAlerts((prev) => [newAlert, ...prev]);
    setActiveTab('alerts');
  }, [updateStock]);

  const resetToDemoData = useCallback(() => {
    flushPendingStorage();

    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.RESOLVED_ALERTS);
    localStorage.removeItem(STORAGE_KEYS.STOCKOUTS);
    localStorage.removeItem(STORAGE_KEYS.POS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.FINANCIAL);
    localStorage.removeItem(STORAGE_KEYS.RECIPES);
    localStorage.removeItem(STORAGE_KEYS.WASTE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.LOTS);

    setProducts(INITIAL_PRODUCTS);
    setSales(generateSeedSales());
    setCustomAlerts(INITIAL_ALERTS);
    setResolvedAlertMap({});
    setStockouts(INITIAL_STOCKOUTS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setRecipes(INITIAL_RECIPES);
    setWasteLogs(INITIAL_WASTE_LOGS);
    setSurgeModifiers({
      rainyWeather: false,
      weekendRush: false,
      festiveSeason: false,
    });
    setFinancialConfig({
      incidentsBefore: 5,
      avgLossPerIncident: 2000,
      incidentsAfter: 1,
    });
    setStockLots(INITIAL_STOCK_LOTS);
    setActivities([
      {
        id: 'act-reset',
        type: 'restock',
        title: 'Demo Environment Reset',
        description: `${currentUser?.name || 'Owner'} (${currentUser?.role || 'owner'}) restored benchmark 90-day bakery dataset.`,
        actorName: currentUser?.name || 'Owner',
        actorRole: currentUser?.role || 'owner',
        timestamp: 'Just now',
      },
    ]);
  }, [currentUser]);

  // Context value memoization: guarantees children don't re-render unless values actually change
  const contextValue = useMemo<AppContextType>(
    () => ({
      products,
      sales,
      suppliers,
      alerts,
      stockouts,
      purchaseOrders,
      recipes,
      wasteLogs,
      stockLots,
      surgeModifiers,
      surgeMultiplier,
      activeTab,
      financialConfig,
      reorderRecommendations,
      activities,
      setActiveTab,
      addProduct,
      updateStock,
      recordSale,
      produceBatch,
      logWaste,
      receiveStock,
      getLotsForProduct,
      getExpiringLots,
      addStockLot,
      setSurgeModifiers,
      resolveAlert,
      createPurchaseOrder,
      updateFinancialConfig,
      simulateWeekendEggStockout,
      resetToDemoData,
    }),
    [
      products,
      sales,
      suppliers,
      alerts,
      stockouts,
      purchaseOrders,
      recipes,
      wasteLogs,
      stockLots,
      surgeModifiers,
      surgeMultiplier,
      activeTab,
      financialConfig,
      reorderRecommendations,
      activities,
      addProduct,
      updateStock,
      recordSale,
      produceBatch,
      logWaste,
      receiveStock,
      getLotsForProduct,
      getExpiringLots,
      addStockLot,
      resolveAlert,
      createPurchaseOrder,
      updateFinancialConfig,
      simulateWeekendEggStockout,
      resetToDemoData,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
