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

    showToast('success', 'Inventory catalog exported as CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Boxes className="w-6 h-6 text-amber-600" />
            <span>Master Inventory Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Stock counts, minimum replenishment buffers, and unit valuation.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-center">
          {/* CSV Export Button (Owner & Purchasing Staff only) */}
          {canExportCsv && (
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
              title="Download inventory CSV spreadsheet"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product, category, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 bg-white"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Healthy">Healthy (≥ Buffer)</option>
              <option value="Low Stock">Low Stock (&lt; Buffer)</option>
              <option value="Critical">Critical (≤ 50% Buffer)</option>
              <option value="Out of Stock">Out of Stock (0)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 bg-white"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.lead_time_days}d)
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedSupplier !== 'all') && (
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedSupplier('all');
              }}
              className="text-amber-700 hover:text-amber-800 font-semibold underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Minimum Buffer</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4">Cost / Selling</th>
                <th className="py-3 px-4">Valuation</th>
                <th className="py-3 px-4">Supplier & Lead</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No products match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const supplier = supplierMap.get(product.supplier_id);
                  const stockValue = product.current_stock * product.cost_price;
                  const { status } = getStockStatus(product.current_stock, product.minimum_required);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>
                          <span>{product.name}</span>
                          {product.expiry_date && (
                            <span className="text-[10px] text-amber-800 font-medium flex items-center space-x-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-amber-700" />
                              <span>Exp: {product.expiry_date}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          {product.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="text-sm font-extrabold text-slate-900">
                          {product.current_stock}
                        </span>{' '}
                        <span className="text-slate-400 text-xs">{product.unit}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                        {product.minimum_required} {product.unit}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge
                          currentStock={product.current_stock}
                          minimumRequired={product.minimum_required}
                        />
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-700">₹{product.cost_price}</div>
                        <div className="text-slate-400 text-[11px]">Sell: ₹{product.selling_price}</div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        {formatCurrencyINR(stockValue)}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800 block truncate max-w-[140px]">
                          {supplier?.name || 'Local Supplier'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {supplier?.lead_time_days || 2}d delivery
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => setSellingProduct(product)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                            title="Record sale / deduction"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setAdjustingProduct(product)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                            title="Audit / adjust on-hand count"
                          >
                            <Sliders className="w-3.5 h-3.5" />
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
