import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';
import { StatusBadge } from './StatusBadge';
import { AddProductModal } from './AddProductModal';
import { AdjustStockModal } from './AdjustStockModal';
import { RecordSaleModal } from './RecordSaleModal';
import {
  Search,
  Plus,
  Sliders,
  TrendingUp,
  Download,
  Calendar,
  Boxes,
  LayoutGrid,
  List,
  AlertTriangle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { formatCurrencyINR, getStockStatus } from '../../services/reorderEngine';

export const InventoryPage: React.FC = () => {
  const { products, suppliers } = useApp();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const supplierMap = useMemo(() => {
    return new Map(suppliers.map((s) => [s.id, s]));
  }, [suppliers]);

  // Counts by status
  const statusCounts = useMemo(() => {
    const counts = { all: products.length, Healthy: 0, 'Low Stock': 0, Critical: 0, 'Out of Stock': 0 };
    products.forEach((p) => {
      const { status } = getStockStatus(p.current_stock, p.minimum_required);
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const { status } = getStockStatus(p.current_stock, p.minimum_required);
      const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
      const matchesSupplier = selectedSupplier === 'all' || p.supplier_id === selectedSupplier;

      return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedSupplier]);

  // CSV Export (Restricted to Owner & Purchasing Staff)
  const canExportCsv = currentUser?.role === 'owner' || currentUser?.role === 'purchasing';

  const handleExportCsv = () => {
    const headers = [
      'Product Name',
      'Category',
      'Current Stock',
      'Unit',
      'Minimum Buffer',
      'Health Status',
      'Cost Price (INR)',
      'Selling Price (INR)',
      'Stock Valuation (INR)',
      'Supplier',
      'Lead Time (Days)',
    ];

    const rows = products.map((p) => {
      const sup = supplierMap.get(p.supplier_id);
      const { status } = getStockStatus(p.current_stock, p.minimum_required);
      const val = p.current_stock * p.cost_price;

      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.current_stock,
        p.unit,
        p.minimum_required,
        status,
        p.cost_price,
        p.selling_price,
        val,
        `"${sup?.name || 'Local Supplier'}"`,
        sup?.lead_time_days || 2,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `smartstock-inventory-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Master inventory catalog exported to CSV.');
  };

  const getStockFillPercentage = (current: number, minRequired: number) => {
    // Normalizing against a generous upper limit (2.5x buffer)
    const upper = minRequired * 2.5;
    return Math.min(100, Math.round((current / (upper || 1)) * 100));
  };

  const getStockBarColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-500';
      case 'Low Stock':
        return 'bg-amber-500';
      case 'Critical':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Action Cluster */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Boxes className="w-6 h-6 text-amber-600 stroke-[2.2]" />
            <span>Master Inventory Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Stock counts, replenishment buffers, and wholesale unit valuation.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-center">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* CSV Export Button (Owner & Purchasing Staff only) */}
          {canExportCsv && (
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar with Category Chips & Status Badges */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card space-y-4">
        {/* Top Filter Controls: Search & Category Chips */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product, category, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 text-xs font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Supplier Dropdown Filter */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Supplier:</span>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 bg-white text-xs font-medium"
            >
              <option value="all">All Vendors</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.lead_time_days}d)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills & Status Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Category Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Status Quick Filter Chips */}
          <div className="flex items-center space-x-1.5 shrink-0 self-start lg:self-center">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('Healthy')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 cursor-pointer ${
                selectedStatus === 'Healthy'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Healthy ({statusCounts['Healthy']})</span>
            </button>
            <button
              onClick={() => setSelectedStatus('Low Stock')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 cursor-pointer ${
                selectedStatus === 'Low Stock'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Low ({statusCounts['Low Stock']})</span>
            </button>
            <button
              onClick={() => setSelectedStatus('Critical')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 cursor-pointer ${
                selectedStatus === 'Critical'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Critical ({statusCounts['Critical']})</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Mode 1: Dense Modern Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">On-Hand vs Buffer</th>
                  <th className="py-3.5 px-4">Health Status</th>
                  <th className="py-3.5 px-4">Wholesale / Retail</th>
                  <th className="py-3.5 px-4">Valuation</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 font-medium">
                      No products match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const supplier = supplierMap.get(product.supplier_id);
                    const stockValue = product.current_stock * product.cost_price;
                    const { status } = getStockStatus(product.current_stock, product.minimum_required);
                    const fillPct = getStockFillPercentage(product.current_stock, product.minimum_required);
                    const marginPct = product.cost_price > 0 
                      ? Math.round(((product.selling_price - product.cost_price) / product.cost_price) * 100) 
                      : 0;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>
                            <span className="text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                              {product.name}
                            </span>
                            {product.expiry_date && (
                              <span className="text-[10px] text-amber-800 font-semibold flex items-center space-x-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-amber-700" />
                                <span>Exp: {product.expiry_date}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200/50">
                            {product.category}
                          </span>
                        </td>

                        {/* Stock count with inline visual progress gauge */}
                        <td className="py-3 px-4 font-mono min-w-[170px]">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-extrabold text-slate-900 tabular-nums text-sm">
                              {product.current_stock} {product.unit}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              Buffer: {product.minimum_required} {product.unit}
                            </span>
                          </div>
                          {/* Mini progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${getStockBarColor(status)} transition-all duration-300`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <StatusBadge
                            currentStock={product.current_stock}
                            minimumRequired={product.minimum_required}
                          />
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="text-slate-800 font-bold tabular-nums">
                            ₹{product.cost_price}{' '}
                            <span className="text-[11px] text-emerald-700 font-bold ml-1">
                              (+{marginPct}%)
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] tabular-nums">
                            Sell: ₹{product.selling_price} /{product.unit}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-black text-slate-900 font-mono tabular-nums">
                          {formatCurrencyINR(stockValue)}
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          <span className="font-bold text-slate-800 block truncate max-w-[130px]">
                            {supplier?.name || 'Local Supplier'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {supplier?.lead_time_days || 2}d transit
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              onClick={() => setSellingProduct(product)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700 transition cursor-pointer flex items-center space-x-1 font-bold text-xs shadow-2xs"
                              title="Record POS Sale / Usage"
                            >
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sale</span>
                            </button>
                            <button
                              onClick={() => setAdjustingProduct(product)}
                              className="p-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer shadow-2xs"
                              title="Audit / Adjust On-Hand Count"
                            >
                              <Sliders className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode 2: Visual Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const supplier = supplierMap.get(product.supplier_id);
            const stockValue = product.current_stock * product.cost_price;
            const { status } = getStockStatus(product.current_stock, product.minimum_required);
            const fillPct = getStockFillPercentage(product.current_stock, product.minimum_required);
            const marginPct = product.cost_price > 0 
              ? Math.round(((product.selling_price - product.cost_price) / product.cost_price) * 100) 
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/50">
                      {product.category}
                    </span>
                    <StatusBadge
                      currentStock={product.current_stock}
                      minimumRequired={product.minimum_required}
                    />
                  </div>

                  <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {product.description}
                    </p>
                  )}

                  {/* Stock Gauge Meter */}
                  <div className="my-4 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 font-mono">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 font-semibold">On-Hand:</span>
                      <span className="font-extrabold text-slate-900 text-sm tabular-nums">
                        {product.current_stock} {product.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden my-1.5">
                      <div
                        className={`h-2 rounded-full ${getStockBarColor(status)} transition-all duration-300`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Min: {product.minimum_required} {product.unit}</span>
                      <span>Val: {formatCurrencyINR(stockValue)}</span>
                    </div>
                  </div>

                  {/* Pricing and Vendor */}
                  <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100 text-slate-600 font-medium">
                    <span>₹{product.cost_price} / ₹{product.selling_price}</span>
                    <span className="text-emerald-700 font-bold font-mono">+{marginPct}% margin</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                    {supplier?.name}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setSellingProduct(product)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                    >
                      + Sale
                    </button>
                    <button
                      onClick={() => setAdjustingProduct(product)}
                      className="p-1 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition cursor-pointer"
                      title="Adjust Stock"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}
      {adjustingProduct && (
        <AdjustStockModal
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
        />
      )}
      {sellingProduct && (
        <RecordSaleModal
          product={sellingProduct}
          onClose={() => setSellingProduct(null)}
        />
      )}
    </div>
  );
};
