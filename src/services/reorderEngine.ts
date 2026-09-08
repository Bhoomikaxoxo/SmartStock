import { Product, SalesRecord, Supplier, ReorderRecommendation, Alert } from '../types';

export const BUFFER_DAYS_DEFAULT = 2;

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Calculates average daily consumption over the last N days (defaults to 30)
 */
export function getAvgDailyConsumption(
  productId: string,
  sales: SalesRecord[],
  days: number = 30
): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const recentSales = sales.filter(
    (s) => s.product_id === productId && s.date >= cutoffStr
  );

  const totalSold = recentSales.reduce((acc, curr) => acc + curr.units_sold, 0);
  const avg = totalSold / days;
  return Math.max(0.01, parseFloat(avg.toFixed(2))); // Prevent division by zero
}

/**
 * Calculates stock status
 */
export function getStockStatus(currentStock: number, minimumRequired: number): {
  status: 'Healthy' | 'Low Stock' | 'Critical' | 'Out of Stock';
  color: 'emerald' | 'amber' | 'rose' | 'slate';
  hex: string;
} {
  if (currentStock <= 0) {
    return { status: 'Out of Stock', color: 'slate', hex: '#475569' };
  }
  if (currentStock <= minimumRequired * 0.5) {
    return { status: 'Critical', color: 'rose', hex: '#e11d48' };
  }
  if (currentStock < minimumRequired) {
    return { status: 'Low Stock', color: 'amber', hex: '#d97706' };
  }
  return { status: 'Healthy', color: 'emerald', hex: '#059669' };
}

/**
 * Computes reorder recommendation for a single product according to spec:
 * avg_daily_consumption = total_units_sold_last_30_days / 30
 * days_until_stockout = current_stock / avg_daily_consumption
 * reorder_trigger_point = avg_daily_consumption * supplier_lead_time_days
 * recommended_order_quantity = (avg_daily_consumption * (lead_time_days + buffer_days)) - current_stock
 */
export function computeReorderRecommendation(
  product: Product,
  sales: SalesRecord[],
  supplier?: Supplier,
  bufferDays: number = BUFFER_DAYS_DEFAULT
): ReorderRecommendation {
  const leadTimeDays = supplier ? supplier.lead_time_days : 3;
  const avgDaily = getAvgDailyConsumption(product.id, sales, 30);
  const daysUntilStockout = parseFloat((product.current_stock / avgDaily).toFixed(1));
  const reorderTriggerPoint = parseFloat((avgDaily * leadTimeDays).toFixed(1));

  // Target stock coverage = leadTimeDays + bufferDays (e.g., 3 + 2 = 5 days of consumption)
  // or at minimum replenish up to minimum_required
  const formulaRecommended = (avgDaily * (leadTimeDays + bufferDays)) - product.current_stock;
  const minRequiredReplenish = product.minimum_required * 1.5 - product.current_stock;
  const recommendedRaw = Math.max(0, Math.max(formulaRecommended, minRequiredReplenish));
  
  let recommendedQuantity: number;
  if (product.unit === 'pieces' || product.unit === 'bottles' || product.unit === 'tins') {
    recommendedQuantity = Math.ceil(recommendedRaw);
  } else {
    recommendedQuantity = parseFloat(recommendedRaw.toFixed(1));
  }

  // Days within which order must be placed
  const daysToOrder = Math.max(1, Math.floor(daysUntilStockout - leadTimeDays));
  const orderTargetDate = new Date();
  orderTargetDate.setDate(orderTargetDate.getDate() + daysToOrder);
  const recommendedByDate = orderTargetDate.toISOString().split('T')[0];

  let reasoning: string;
  if (product.current_stock <= 0) {
    reasoning = `OUT OF STOCK! Daily burn rate is ${avgDaily} ${product.unit}/day. Supplier lead time is ${leadTimeDays} days. Emergency restock needed immediately.`;
  } else if (daysUntilStockout <= leadTimeDays) {
    reasoning = `Stockout in ${daysUntilStockout} days, while supplier takes ${leadTimeDays} days to deliver. Order within ${daysToOrder} day(s) with ${bufferDays} days safety buffer.`;
  } else {
    reasoning = `Based on avg daily usage of ${avgDaily} ${product.unit}/day × (${leadTimeDays}d lead time + ${bufferDays}d buffer) minus current stock.`;
  }

  const estimatedCost = Math.round(recommendedQuantity * product.cost_price);

  return {
    id: `rec-${product.id}`,
    product_id: product.id,
    product_name: product.name,
    current_stock: product.current_stock,
    unit: product.unit,
    avg_daily_consumption: avgDaily,
    days_until_stockout: daysUntilStockout,
    reorder_trigger_point: reorderTriggerPoint,
    recommended_quantity: recommendedQuantity,
    recommended_by_date: recommendedByDate,
    reasoning,
    lead_time_days: leadTimeDays,
    estimated_cost: estimatedCost,
    status: 'pending',
  };
}

/**
 * Calculates top selling products ranked by units sold in the last 30, 60, or 90 days
 */
export function getTopSellingProducts(
  products: Product[],
  sales: SalesRecord[],
  timeframeDays: 30 | 60 | 90
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const salesMap = new Map<string, { units: number; revenue: number }>();

  sales
    .filter((s) => s.date >= cutoffStr)
    .forEach((s) => {
      const existing = salesMap.get(s.product_id) || { units: 0, revenue: 0 };
      salesMap.set(s.product_id, {
        units: existing.units + s.units_sold,
        revenue: existing.revenue + s.revenue,
      });
    });

  return products
    .map((p) => {
      const data = salesMap.get(p.id) || { units: 0, revenue: 0 };
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        unitsSold: parseFloat(data.units.toFixed(1)),
        revenue: data.revenue,
        costPrice: p.cost_price,
        profit: Math.round(data.revenue - (data.units * p.cost_price)),
      };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold);
}

/**
 * Calculates slow-moving products (bottom items by turnover rate)
 * turnover rate = total units sold in 90 days / average inventory
 */
export function getSlowMovingProducts(products: Product[], sales: SalesRecord[]) {
  return products
    .map((p) => {
      const totalSold = sales
        .filter((s) => s.product_id === p.id)
        .reduce((sum, s) => sum + s.units_sold, 0);

      // Turnover velocity: units sold per unit held in stock
      const turnoverRate = p.current_stock > 0 ? parseFloat((totalSold / (p.current_stock || 1)).toFixed(2)) : 0;
      const capitalTiedUp = Math.round(p.current_stock * p.cost_price);

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        currentStock: p.current_stock,
        totalSold90Days: parseFloat(totalSold.toFixed(1)),
        turnoverRate,
        capitalTiedUp,
      };
    })
    .sort((a, b) => a.turnoverRate - b.turnoverRate);
}

/**
 * Computes monthly demand trends per product over past 3 months
 * plus linear trend projection for next month
 */
export function getMonthlyDemandTrend(productId: string, sales: SalesRecord[]) {
  const productSales = sales.filter((s) => s.product_id === productId);
  
  // Group into 3 rolling 30-day buckets: Month -3, Month -2, Month -1
  const today = new Date();
  
  const getBucketTotal = (startDaysAgo: number, endDaysAgo: number) => {
    const start = new Date(today);
    start.setDate(today.getDate() - startDaysAgo);
    const end = new Date(today);
    end.setDate(today.getDate() - endDaysAgo);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    return productSales
      .filter((s) => s.date >= startStr && s.date < endStr)
      .reduce((sum, s) => sum + s.units_sold, 0);
  };

  const m1Total = parseFloat(getBucketTotal(90, 60).toFixed(1)); // 3 months ago
  const m2Total = parseFloat(getBucketTotal(60, 30).toFixed(1)); // 2 months ago
  const m3Total = parseFloat(getBucketTotal(30, 0).toFixed(1));  // past 30 days

  // Month labels
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curMonthIdx = today.getMonth();
  const getMonthLabel = (offset: number) => {
    const idx = (curMonthIdx + offset + 12) % 12;
    return monthNames[idx];
  };

  const m1Label = getMonthLabel(-2);
  const m2Label = getMonthLabel(-1);
  const m3Label = `${getMonthLabel(0)} (Actual)`;
  const m4Label = `${getMonthLabel(1)} (Forecast)`;

  // Simple Linear Regression over x=[1, 2, 3] to project x=4
  // slope m = sum((x - x_bar)(y - y_bar)) / sum((x - x_bar)^2)
  const xVals = [1, 2, 3];
  const yVals = [m1Total, m2Total, m3Total];
  const xBar = 2;
  const yBar = (m1Total + m2Total + m3Total) / 3;

  const numerator = (1 - xBar) * (m1Total - yBar) + (2 - xBar) * (m2Total - yBar) + (3 - xBar) * (m3Total - yBar);
  const denominator = (1 - xBar) ** 2 + (2 - xBar) ** 2 + (3 - xBar) ** 2; // 1 + 0 + 1 = 2
  const slope = numerator / denominator;
  const intercept = yBar - (slope * xBar);

  // Projected value for month 4
  const projectedM4 = Math.max(0, parseFloat((slope * 4 + intercept).toFixed(1)));

  // Growth rates
  const growthM1toM2 = m1Total > 0 ? (m2Total - m1Total) / m1Total : 0;
  const growthM2toM3 = m2Total > 0 ? (m3Total - m2Total) / m2Total : 0;
  const avgGrowth = (growthM1toM2 + growthM2toM3) / 2;

  let trendBadge: { text: string; color: 'emerald' | 'amber' | 'rose' };
  if (growthM1toM2 >= 0.1 && growthM2toM3 >= 0.1) {
    trendBadge = { text: 'Increasing Demand (+15-20%)', color: 'emerald' };
  } else if (avgGrowth > 0.03) {
    trendBadge = { text: 'Steady Growth', color: 'emerald' };
  } else if (avgGrowth < -0.05) {
    trendBadge = { text: 'Declining Demand', color: 'rose' };
  } else {
    trendBadge = { text: 'Stable Demand', color: 'amber' };
  }

  const chartData = [
    { month: m1Label, demand: m1Total, projected: null },
    { month: m2Label, demand: m2Total, projected: null },
    { month: m3Label, demand: m3Total, projected: m3Total },
    { month: m4Label, demand: null, projected: projectedM4 },
  ];

  return {
    chartData,
    m1Total,
    m2Total,
    m3Total,
    projectedM4,
    slope: parseFloat(slope.toFixed(2)),
    avgGrowthPct: Math.round(avgGrowth * 100),
    trendBadge,
  };
}

/**
 * Dynamic alert evaluator: Inspects all products and automatically constructs
 * prioritized alerts based on thresholds, lead times, and expiry.
 */
export function evaluateDynamicAlerts(
  products: Product[],
  sales: SalesRecord[],
  suppliers: Supplier[]
): Alert[] {
  const alerts: Alert[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  products.forEach((product) => {
    const supplier = suppliers.find((s) => s.id === product.supplier_id);
    const leadTime = supplier?.lead_time_days || 3;
    const avgDaily = getAvgDailyConsumption(product.id, sales, 30);
    const daysUntilStockout = parseFloat((product.current_stock / avgDaily).toFixed(1));

    // 1. Critical Low Stock (below 50% minimum or zero)
    if (product.current_stock <= 0) {
      alerts.push({
        id: `alert-${product.id}-stockout`,
        product_id: product.id,
        product_name: product.name,
        type: 'low_stock',
        severity: 'critical',
        message: `CRITICAL: ${product.name} is completely OUT OF STOCK! Immediate restock required.`,
        created_at: todayStr,
        resolved: false,
      });
    } else if (product.current_stock <= product.minimum_required * 0.5) {
      alerts.push({
        id: `alert-${product.id}-critical`,
        product_id: product.id,
        product_name: product.name,
        type: 'low_stock',
        severity: 'critical',
        message: `${product.name} severely depleted (${product.current_stock}/${product.minimum_required} ${product.unit}). Stockout likely within ${daysUntilStockout} days!`,
        created_at: todayStr,
        resolved: false,
      });
    }

    // 2. Reorder Trigger (days until stockout <= lead time)
    if (daysUntilStockout <= leadTime && product.current_stock > product.minimum_required * 0.5) {
      alerts.push({
        id: `alert-${product.id}-reorder`,
        product_id: product.id,
        product_name: product.name,
        type: 'reorder_due',
        severity: 'warning',
        message: `${product.name} will run out in ${daysUntilStockout} days at current rate. Supplier lead time is ${leadTime} days.`,
        created_at: todayStr,
        resolved: false,
      });
    } else if (product.current_stock < product.minimum_required && product.current_stock > product.minimum_required * 0.5) {
      alerts.push({
        id: `alert-${product.id}-info-reorder`,
        product_id: product.id,
        product_name: product.name,
        type: 'reorder_due',
        severity: 'info',
        message: `Reorder suggested: ${product.name} is below buffer (${product.current_stock}/${product.minimum_required} ${product.unit}).`,
        created_at: todayStr,
        resolved: false,
      });
    }

    // 3. Expiry Alert (within 7 days)
    if (product.expiry_date) {
      const expDate = new Date(product.expiry_date);
      const now = new Date();
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7) {
        alerts.push({
          id: `alert-${product.id}-expiry`,
          product_id: product.id,
          product_name: product.name,
          type: 'expiring_soon',
          severity: diffDays <= 3 ? 'critical' : 'warning',
          message: `Batch expiring in ${diffDays} day(s) (${product.expiry_date}) — ${product.current_stock} ${product.unit} unsold. Consider discount promo or immediate production.`,
          created_at: todayStr,
          resolved: false,
        });
      }
    }
  });

  return alerts;
}
