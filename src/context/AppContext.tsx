import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_ALERTS,
  INITIAL_STOCKOUTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RECIPES,
  INITIAL_WASTE_LOGS,
  generateSeedSales,
} from '../data/seedData';
import {
  computeReorderRecommendation,
  evaluateDynamicAlerts,
  BUFFER_DAYS_DEFAULT,
} from '../services/reorderEngine';
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
  produceBatch: (recipeId: string, batchCount: number) => { success: boolean; shortages?: string[] };
  logWaste: (productId: string, quantity: number, reason: WasteReason) => { success: boolean; error?: string };
  receiveStock: (productId: string, quantity: number, poId?: string) => void;
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
  STOCKOUTS: 'smartstock_stockouts_v3',
  POS: 'smartstock_pos_v3',
  ACTIVITIES: 'smartstock_activities_v3',
  FINANCIAL: 'smartstock_financial_v3',
  RECIPES: 'smartstock_recipes_v3',
  WASTE_LOGS: 'smartstock_waste_v3',
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

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCKOUTS, JSON.stringify(stockouts));
  }, [stockouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POS, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(financialConfig));
  }, [financialConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WASTE_LOGS, JSON.stringify(wasteLogs));
  }, [wasteLogs]);

  // Synchronize alerts with dynamic evaluator whenever products or sales change
  useEffect(() => {
    const dynamicAlerts = evaluateDynamicAlerts(products, sales, suppliers);
    setAlerts((prevAlerts) => {
      const existingMap = new Map(prevAlerts.map((a) => [a.id, a]));
      dynamicAlerts.forEach((da) => {
        if (!existingMap.has(da.id)) {
          existingMap.set(da.id, da);
        }
      });
      return Array.from(existingMap.values());
    });
  }, [products, sales, suppliers]);

  // Reorder recommendations computation (with surge multiplier applied to burn rates)
  const reorderRecommendations = useMemo(() => {
    return products.map((product) => {
      const supplier = suppliers.find((s) => s.id === product.supplier_id);
      return computeReorderRecommendation(product, sales, supplier, BUFFER_DAYS_DEFAULT, surgeMultiplier);
    });
  }, [products, sales, suppliers, surgeMultiplier]);

  const addActivity = (item: Omit<ActivityItem, 'id' | 'timestamp' | 'actorName' | 'actorRole'>) => {
    const newActivity: ActivityItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      actorName: currentUser?.name || 'System',
      actorRole: currentUser?.role || 'owner',
      timestamp: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 24)]);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'created_at'>) => {
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
  };

  const updateStock = (productId: string, newStock: number, reason: string = 'Stock adjustment') => {
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
  };

  const recordSale = (productId: string, unitsSold: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'Product not found' };

    if (unitsSold <= 0) {
      return { success: false, error: 'Please enter a valid positive quantity.' };
    }

    if (unitsSold > product.current_stock) {
      return {
        success: false,
        error: `Cannot sell ${unitsSold} ${product.unit}. Only ${product.current_stock} ${product.unit} available in stock.`,
      };
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
    setSales((prev) => [newSale, ...prev]);

    const updatedStock = product.current_stock - unitsSold;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, current_stock: updatedStock } : p))
    );

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
      setStockouts((prev) => [newStockout, ...prev]);
      addActivity({
        type: 'stockout',
        title: `OUT OF STOCK: ${product.name}`,
        description: `Product inventory reached 0 units. Immediate restock required.`,
      });
    }

    showToast('success', `Recorded sale of ${unitsSold} ${product.unit} (${product.name}).`);
    return { success: true };
  };

  const resolveAlert = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, resolved: true, resolved_at: new Date().toISOString() } : a
      )
    );
    if (alert) {
      addActivity({
        type: 'alert_resolved',
        title: 'Alert Resolved',
        description: `${currentUser?.name || 'Staff'} (${currentUser?.role || 'staff'}) marked alert resolved: ${alert.message.substring(0, 60)}...`,
      });
      showToast('success', 'Alert marked as resolved.');
    }
  };

  const createPurchaseOrder = (poData: {
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

    // Resolve matching alerts
    setAlerts((prev) =>
      prev.map((a) =>
        a.product_id === poData.product_id && a.type === 'reorder_due'
          ? { ...a, resolved: true, resolved_at: today.toISOString() }
          : a
      )
    );

    addActivity({
      type: 'reorder',
      title: `Purchase Order Issued: ${newPO.po_number}`,
      description: `${currentUser?.name || 'Purchasing'} (${currentUser?.role || 'purchasing'}) dispatched ${newPO.po_number} to ${newPO.supplier_name} (${newPO.quantity} ${newPO.unit} ${newPO.product_name}, ₹${totalCost.toLocaleString('en-IN')}).`,
    });

    showToast('success', `Purchase Order ${newPO.po_number} sent to ${newPO.supplier_name}.`);
    return newPO;
  };

  const produceBatch = (recipeId: string, batchCount: number): { success: boolean; shortages?: string[] } => {
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

    // CRITICAL RECONCILIATION: write consumption records into the same rolling-window sales dataset
    // so the forecasting and reorder engine immediately reflects production burn rate
    const newConsumptionRecords: SalesRecord[] = deductions.map((d) => ({
      id: `consume-${Date.now()}-${d.product.id}`,
      product_id: d.product.id,
      date: today,
      units_sold: d.needed,
      revenue: 0,
    }));
    setSales((prev) => [...newConsumptionRecords, ...prev]);

    const totalYield = batchCount * recipe.yield_quantity;
    addActivity({
      type: 'production',
      title: `Bake Completed: ${recipe.name}`,
      description: `${currentUser?.name || 'Baker'} (${currentUser?.role || 'staff'}) baked ${batchCount} batch(es) of ${recipe.name} (${totalYield} ${recipe.yield_unit}). Raw ingredients deducted & consumption reconciled into forecasting engine.`,
    });

    showToast('success', `Baked ${batchCount} batch(es) of ${recipe.name} (${totalYield} ${recipe.yield_unit}).`);
    return { success: true };
  };

  const logWaste = (productId: string, quantity: number, reason: WasteReason): { success: boolean; error?: string } => {
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
  };

  const receiveStock = (productId: string, quantity: number, poId?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      showToast('error', 'Product not found.');
      return;
    }

    if (quantity <= 0) {
      showToast('error', 'Received quantity must be positive.');
      return;
    }

    const newStock = parseFloat((product.current_stock + quantity).toFixed(2));
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, current_stock: newStock } : p))
    );

    // If PO was matched, mark it as Delivered
    if (poId) {
      setPurchaseOrders((prev) =>
        prev.map((po) => (po.id === poId ? { ...po, status: 'Delivered' } : po))
      );
    }

    // Resolve matching low_stock / reorder_due alerts
    setAlerts((prev) =>
      prev.map((a) =>
        a.product_id === productId && !a.resolved
          ? { ...a, resolved: true, resolved_at: new Date().toISOString() }
          : a
      )
    );

    addActivity({
      type: 'restock',
      title: `Stock Received: ${product.name}`,
      description: `${currentUser?.name || 'Receiving Staff'} (${currentUser?.role || 'staff'}) scanned & received ${quantity} ${product.unit} of ${product.name}${poId ? ` against open purchase order.` : '.'}`,
    });

    showToast('success', `Received ${quantity} ${product.unit} of ${product.name}. Stock updated to ${newStock} ${product.unit}.`);
  };

  const updateFinancialConfig = (config: Partial<FinancialImpactConfig>) => {
    setFinancialConfig((prev) => ({ ...prev, ...config }));
  };

  const simulateWeekendEggStockout = () => {
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
    setAlerts((prev) => [newAlert, ...prev]);
    setActiveTab('alerts');
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.STOCKOUTS);
    localStorage.removeItem(STORAGE_KEYS.POS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.FINANCIAL);
    localStorage.removeItem(STORAGE_KEYS.RECIPES);
    localStorage.removeItem(STORAGE_KEYS.WASTE_LOGS);

    setProducts(INITIAL_PRODUCTS);
    setSales(generateSeedSales());
    setAlerts(INITIAL_ALERTS);
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
  };

  return (
    <AppContext.Provider
      value={{
        products,
        sales,
        suppliers,
        alerts,
        stockouts,
        purchaseOrders,
        recipes,
        wasteLogs,
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
        setSurgeModifiers,
        resolveAlert,
        createPurchaseOrder,
        updateFinancialConfig,
        simulateWeekendEggStockout,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
