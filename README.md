# 🥐 SmartStock: Commercial Bakery Inventory & Production Intelligence Platform

<div align="center">

![SmartStock Banner](https://img.shields.io/badge/SmartStock-v1.0.0-amber?style=for-the-badge&logo=cookie&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Predictive replenishment, real-time Bill of Materials (BOM) production deduction, FIFO batch expiry tracking, dockside barcode intake, and role-based operational controls tailored for artisanal and commercial bakeries.**

[Key Features](#-core-capabilities--feature-matrix) • [Mathematical Formulations](#-inventory-mathematics--theoretical-formulations) • [RBAC Matrix](#-role-based-access-control-rbac-matrix) • [Architecture](#-system-architecture--directory-map) • [Quickstart](#-getting-started--local-development) • [Demo Credentials](#-live-demonstration-credentials)

</div>

---

## 📖 Table of Contents

1. [Executive Overview](#-executive-overview)
2. [Why Commercial Bakeries Fail at Inventory](#-why-commercial-bakeries-fail-at-inventory)
3. [Core Capabilities & Feature Matrix](#-core-capabilities--feature-matrix)
4. [Inventory Mathematics & Theoretical Formulations](#-inventory-mathematics--theoretical-formulations)
5. [Role-Based Access Control (RBAC) Matrix](#-role-based-access-control-rbac-matrix)
6. [System Architecture & Directory Map](#-system-architecture--directory-map)
7. [Seeded Bakery Operations Dataset](#-seeded-bakery-operations-dataset)
8. [Dual-Theme Visual Design System](#-dual-theme-visual-design-system)
9. [Zero-Dependency Web Audio Tactile Engine](#-zero-dependency-web-audio-tactile-engine)
10. [Live Demonstration Credentials](#-live-demonstration-credentials)
11. [Getting Started & Local Development](#-getting-started--local-development)
12. [Verification & Quality Assurance](#-verification--quality-assurance)
13. [License & Acknowledgments](#-license--acknowledgments)

---

## 🎯 Executive Overview

**SmartStock** is an enterprise-grade inventory intelligence and production management platform designed specifically for commercial and artisanal bakeries. Unlike generic retail inventory systems, SmartStock accounts for the complex physical realities of food manufacturing:

- **Perishable ingredients with short use-by dates** (fresh milk in 5 days, unsalted butter in 21 days, eggs in 14 days).
- **Compound recipe dependencies** where missing a single 500g butter block halts a ₹15,000 croissant and brioche bake schedule.
- **Volatile weekend and seasonal demand surges** that skew static reorder thresholds.
- **Physical dockside intake** requiring immediate lot generation, expiry verification, and matching against open purchase orders.
- **Margin leakage** caused by untracked shrinkage, expiration spoilage, and emergency procurement premiums.

SmartStock unites rigorous operational research formulas (Safety Stock, Reorder Point, Economic Order Quantity, and Linear Regression Forecasting) with a tactile, human-centered interface designed for kitchen floors and executive desks alike.

---

## ⚠️ Why Commercial Bakeries Fail at Inventory

Standard ERPs fail bakery managers because food production violates typical retail assumptions:

| Retail Assumption | Bakery Reality | How SmartStock Solves It |
| :--- | :--- | :--- |
| **Independent Items:** Selling 1 shirt doesn't affect jeans. | **Bill of Materials (BOM):** Baking 24 croissants consumes 5 distinct raw materials simultaneously. | **Automated Multi-Tier BOM Deduction:** Recipe execution atomically checks feasibility and deducts raw materials from inventory in real time. |
| **Indefinite Shelf Life:** Hardware sits in warehouse for months. | **Strict Perishability:** Dairy, yeast, and eggs spoil rapidly. | **FIFO & Batch Expiry Tracking:** Tracks individual stock lots with use-by dates; automatically consumes oldest active lots first. |
| **Uniform Consumption:** Demand fluctuates smoothly. | **Sharp Demand Spikes:** Weekend rushes, festive holidays, and corporate catering create 2x–3x consumption spikes. | **Demand Surge Simulator:** Recalibrates safety buffers and daily consumption multipliers without corrupting baseline historical data. |
| **Manual Stocktaking:** Weekly physical counts in spreadsheets. | **Fast Kitchen Tempo:** Bakers cannot leave flour-covered tables to key data into desktop software. | **Dockside Barcode Terminal & Audio Feedback:** 1-click optical scanner terminal with realistic Web Audio beeps and instant PO resolution. |

---

## 🚀 Core Capabilities & Feature Matrix

### 1. 📦 Batch Expiry & FIFO Inventory Tracking Engine
- **Lot-Level Granularity:** Every delivery creates an explicit `StockLot` with lot number, received date, expiry date, initial quantity, and remaining balance.
- **First-In, First-Out (FIFO) Auto-Depletion:** When a recipe is baked, ingredients are consumed strictly from the earliest expiring active lots first. Depleted lots automatically transition to `depleted` status.
- **Perishable Shelf-Life Watch Banner:** Real-time dashboard monitor alerting kitchen staff of lots expiring within 7 days (urgent ≤ 2d in rose, near-term ≤ 7d in amber) with a 1-click *"Prioritize in Bake"* action.
- **Interactive Lot Inspector Modal:** Expandable lot inspection dialog for any product, showing days remaining, fill percentage gauges, batch numbers, and on-demand manual lot intake.
- **Expiring Soon Filter Chip:** Filter the entire inventory catalog down to products with lots expiring within 7 days with one click.

### 2. 🍳 Bill of Materials (BOM) Production & Bake Scheduler
- **Live Feasibility Checks:** Evaluates required ingredient quantities against on-hand buffer before baking.
- **Dynamic Yield Multiplier:** Step production from 1x to 10x batch sizes with instantaneous ingredient requirement calculations.
- **Production Blocking on Deficit:** Visually identifies deficient ingredients with precise deficit quantities and blocks execution until resolved.
- **1-Click Shortage PO Creation:** Sub-modal allows floor staff or purchasing managers to generate an expedited Purchase Order for the exact missing quantity directly from the recipe dialog.
- **Live FIFO Allocation Preview:** Previews the exact lot IDs, deducted quantities, and days left for every ingredient before the oven timer starts.

### 3. 📉 Predictive Replenishment & Reorder Engine
- **Statistical Safety Stock:** Calculates dynamic safety buffers using standard deviation of historical daily consumption and supplier lead times.
- **Reorder Point (ROP):** Triggers proactive alerts before inventory hits danger zones, ensuring transit buffer continuity.
- **Economic Order Quantity (EOQ):** Minimizes total annual holding and ordering costs using classic Wilson lot-sizing mathematics.
- **30-Day Ordinary Least Squares (OLS) Linear Regression:** Projects 30-day demand curves to forecast stockout dates and generate intelligent purchase recommendations with clear reasoning.

### 4. ⚡ Simulated Demand Surge Engine
- **Scenario Stress Testing:** Simulate Weekend Bakery Rushes (1.5x), Festive Diwali/Christmas Spikes (2.2x), or Viral Social/Flash Spikes (3.0x).
- **Temporary Buffer Recalibration:** Daily consumption rates and safety stock requirements dynamically scale across the UI without permanently overwriting historical sales data.
- **Instant Deactivation:** Reset back to baseline standard operations at any time with a single tap.

### 5. 🏷️ Dockside Barcode Scanner Terminal
- **Simulated Hardware Scanner:** Full viewport scanner modal with ambient optical laser sweep and responsive Web Audio feedback.
- **Optical Laser Audio:** Synthesizes realistic 1.8 kHz handheld scanner beeps and major triad success chimes directly via the Web Audio API (zero audio file downloads).
- **Open PO Reconciliation:** Scanned barcodes automatically match against open supplier Purchase Orders (`Sent` status), offering a 1-click *"Receive PO Quantity into Lot"* intake flow.
- **Lot Intake Form:** Auto-suggests structured bakery batch codes (e.g., `LOT-BTR-2601`) and use-by dates calculated from product shelf life.

### 6. 🛡️ Role-Based Access Control (RBAC) & Session Security
- **Three Operational Personas:**
  - **Owner / Head Baker:** Complete administrative authority, settings configuration, CSV exports, recipe creation, and financial audits.
  - **Purchasing Staff:** Vendor management, Purchase Order issuance in Analytics & Alerts, stock receiving, and inventory monitoring.
  - **Floor Staff / Line Baker:** Production baking, barcode scanning, POS sale recording, and perishable waste logging. Administrative surfaces and settings are strictly hidden.
- **8-Hour Shift Session Persistence:** User authentication persists in `localStorage` with automatic expiry checks and graceful timeout toast notifications.
- **Demo Switcher:** Instant role switching menu for frictionless demonstration and evaluation.

### 7. 🎨 Dual-Theme Design System (Parchment & Espresso)
- **Zero-Flicker Semantic Token Swapping:** Built on CSS custom variables (`--bg-base`, `--bg-surface`, `--text-primary`, `--accent`, etc.) rather than redundant per-component Tailwind overrides.
- **Light Theme (Warm Artisan Parchment):** `#F8F6F0` canvas, cream glass cards, slate typography, and warm amber accents.
- **Dark Theme (Deep Espresso & Warm Amber):** `#1C1712` canvas, `#26201A` elevated cards, `#F1EAD9` parchment ink, and glowing amber highlights.
- **Synchronized Recharts SVG Palettes:** Area gradients, bar charts, axis ticks, and donut slices adapt to active theme tokens in real time.
- **Non-Overlapping Floating Toggle:** Circular 44px toggle fixed at `bottom-6 right-6` with accessible focus rings and rotating crossfade transition. Toasts are relocated to `top-4 right-4` to prevent layout collision.

### 8. 💰 Financial Impact & Spoilage Prevention ROI Analyzer
- **Interactive ROI Simulator:** Real-time business case model demonstrating annual rupee savings across three tangible bakery failure points:
  - **Stockout Reduction:** Lost pastry revenue recaptured through buffer stock integrity.
  - **Spoilage & Shrinkage Prevention:** Perishable waste avoided through FIFO lot allocation.
  - **Emergency Freight Savings:** Eliminating high-cost local emergency runs through automated lead-time ROP ordering.
- **Interactive Range Sliders:** Customize historical incidents, average cost per incident, and target reduction rates to compute custom net annual financial benefit.

---

## 📐 Inventory Mathematics & Theoretical Formulations

SmartStock implements formal supply chain and inventory control mathematics in `src/services/reorderEngine.ts`. All formulas run client-side with zero external latency.

```
                      INVENTORY REPLENISHMENT CYCLE
   Quantity
      ▲
      │    ┌─────────────────────────┐  Order Received (Current Stock = Base + EOQ)
      │   /                           \
      │  /                             \
ROP ──┼─/───────.                       \ ◄─── Reorder Point Triggered!
      │/         \                       \     (Purchase Order dispatched to vendor)
      │           \                       \
      │            \                       \
 SS ──┼─────────────\───────────────────────\─ Safety Stock Buffer
      │              \                       \ (Protects against lead time variance)
    0 └───────────────┴───────────────────────┴────────────────► Time
                       ◄─── Lead Time (L) ────►
```

### 1. Safety Stock ($SS$)
Protects production against supplier transit delays and daily demand variance during replenishment:

$$SS = Z \times \sigma_d \times \sqrt{L}$$

Where:
- $Z$: Service factor corresponding to desired fill rate (defaults to $Z = 1.65$ for 95% service level).
- $\sigma_d$: Standard deviation of daily consumption computed over the past 30 days of sales records:
  $$\sigma_d = \sqrt{\frac{1}{N - 1} \sum_{i=1}^{N} (d_i - \bar{d})^2}$$
- $L$: Supplier lead time in days (`supplier.lead_time_days`).

### 2. Reorder Point ($ROP$)
The inventory threshold that triggers an automated replenishment recommendation:

$$ROP = (\bar{d} \times L) + SS$$

Where:
- $\bar{d}$: Average daily consumption over the active window.
- $L$: Vendor transit lead time in days.
- $SS$: Safety stock buffer.

### 3. Economic Order Quantity ($EOQ$)
Optimizes order size to balance inventory holding costs against fixed purchase ordering expenses (Wilson Lot-Size Formula):

$$EOQ = \sqrt{\frac{2 \times D \times S}{H}}$$

Where:
- $D$: Annualized ingredient demand ($D = \bar{d} \times 365$).
- $S$: Fixed administrative ordering cost per purchase order (standardized at ₹150 for commercial bakery procurement).
- $H$: Annual holding cost per unit ($H = 20\% \times \text{cost\_price}$).

### 4. Demand Forecasting via Ordinary Least Squares (OLS) Linear Regression
Projects future 30-day consumption trends by fitting historical sales to a linear trajectory $y = mx + b$:

$$\text{Slope } m = \frac{N \sum (x_i y_i) - \sum x_i \sum y_i}{N \sum x_i^2 - (\sum x_i)^2}$$

$$\text{Intercept } b = \frac{\sum y_i - m \sum x_i}{N}$$

Where $x_i$ represents the day index ($1 \dots 30$) and $y_i$ represents daily unit consumption. Days until stockout is derived as:

$$\text{Days Until Stockout} = \max\left(0, \left\lfloor \frac{\text{current\_stock}}{\bar{d}} \right\rfloor\right)$$

### 5. 4-State Inventory Health Matrix
Inventory status is evaluated against dynamic thresholds:

| Status | Mathematical Condition | Visual Indication | Operational Action |
| :--- | :--- | :--- | :--- |
| **Healthy** | $\text{current\_stock} \ge \text{minimum\_required}$ | 🟢 Emerald Badge | Stock adequate; continue standard FIFO rotation. |
| **Low Stock** | $0.5 \times \text{minimum\_required} \le \text{current\_stock} < \text{minimum\_required}$ | 🟡 Amber Badge | Approaching safety buffer; trigger supplier PO. |
| **Critical** | $0 < \text{current\_stock} < 0.5 \times \text{minimum\_required}$ | 🔴 Rose Badge | Danger zone; stockout imminent within 24–48 hours. |
| **Out of Stock** | $\text{current\_stock} = 0$ | ⚫ Slate Badge | Production halted for recipes requiring this item. |

---

## 👥 Role-Based Access Control (RBAC) Matrix

SmartStock enforces role boundaries across all pages, dialogs, and actions:

| Capability / Surface | Owner / Head Baker | Purchasing Staff | Floor Staff / Baker | Security Enforcement Mechanism |
| :--- | :---: | :---: | :---: | :--- |
| **View Dashboard & KPI Analytics** | ✅ | ✅ | ✅ | Universal access across all authenticated users |
| **Execute Recipe Batch Production (BOM)** | ✅ | ❌ | ✅ | Restricted in `ProductionPage` / `BakeBatchModal` |
| **Inspect Stock Lots & FIFO Expiry Dates** | ✅ | ✅ | ✅ | Universal access via Inventory and Expiry Watch |
| **Scan Barcodes Dockside** | ✅ | ✅ | ✅ | Universal intake via `BarcodeScannerModal` |
| **Generate Purchase Orders (POs)** | ✅ | ✅ | ❌ | Hidden/disabled in Alerts, Analytics, and Bake Dialog |
| **Adjust / Audit Physical Stock Counts** | ✅ | ❌ | ❌ | Restricted to Owner in `InventoryPage` |
| **Record Perishable Waste & Shrinkage** | ✅ | ❌ | ✅ | Accessible to floor staff to log kitchen drops |
| **Export Inventory to CSV** | ✅ | ✅ | ❌ | Action button hidden for Floor Staff |
| **Simulate Demand Surges** | ✅ | ✅ | ❌ | Restricted in header actions |
| **Manage System Settings & Thresholds** | ✅ | ❌ | ❌ | Hidden in user menu; direct access blocked |

---

## 🏗️ System Architecture & Directory Map

SmartStock is built with clean separation of concerns, strict TypeScript typings, and modular component hierarchy:

```
SmartStock/
├── index.html                   # HTML5 entrypoint with Google Fonts (Outfit & Inter)
├── package.json                 # Dependencies and npm scripts
├── tsconfig.json                # TypeScript strict configuration
├── vite.config.ts               # Vite bundler configuration with React plugin
├── tailwind.config.js           # Tailwind theme tokens and custom animations
├── src/
│   ├── main.tsx                 # React DOM mount point
│   ├── App.tsx                  # Root app layout, providers, tab routing
│   ├── index.css                # CSS custom properties, glassmorphism, animations
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript definitions (Product, StockLot, Recipe, PO, User, etc.)
│   │
│   ├── services/
│   │   └── reorderEngine.ts     # Core inventory math (SS, ROP, EOQ, OLS Regression, Status)
│   │
│   ├── context/
│   │   ├── AppContext.tsx       # Master state (inventory, lots, recipes, POs, alerts, FIFO engine)
│   │   ├── AuthContext.tsx      # RBAC authentication, 8-hour sessions, seeded user database
│   │   ├── ThemeContext.tsx     # Dual-theme engine (parchment/espresso) and Recharts token bridge
│   │   └── ToastContext.tsx     # Global notification queue (repositioned to top-right)
│   │
│   ├── data/
│   │   └── seedData.ts          # Seed dataset (8 products, lots, recipes, suppliers, 30-day sales)
│   │
│   ├── utils/
│   │   └── audio.ts             # Web Audio API sound synthesizer (scan beep, chime, clicks)
│   │
│   └── components/
│       ├── layout/
│       │   ├── Header.tsx       # Brand masthead, role indicator, surge toggle, quick actions
│       │   └── Navigation.tsx   # Responsive tab bar (Dashboard, Inventory, Production, etc.)
│       │
│       ├── common/
│       │   └── ThemeToggle.tsx  # Floating circular theme button with sun/moon transition
│       │
│       ├── auth/
│       │   ├── LoginModal.tsx   # PIN/password login dialog with quick user switcher
│       │   └── UserMenu.tsx     # User avatar, active role badge, logout, and profile controls
│       │
│       ├── dashboard/
│       │   ├── DashboardPage.tsx       # Executive overview with metrics and shift summary
│       │   ├── ExpiryWatchBanner.tsx   # Perishable shelf-life monitor with 1-click bake routing
│       │   ├── StatCard.tsx            # KPI stat widgets with trend indicators
│       │   ├── StockHealthDonut.tsx    # Recharts 4-state inventory health breakdown
│       │   ├── KpiProgress.tsx         # Safety buffer and turnover target gauges
│       │   └── RecentActivityFeed.tsx  # Chronological audit log of bakes, sales, and intake
│       │
│       ├── inventory/
│       │   ├── InventoryPage.tsx       # Filterable catalog with table & card grid views
│       │   ├── ProductLotsModal.tsx    # FIFO lot inspector, countdowns, and manual intake
│       │   ├── StatusBadge.tsx         # 4-state health pill with color-coded dot
│       │   ├── AddProductModal.tsx     # New SKU registration dialog
│       │   ├── AdjustStockModal.tsx    # Stocktaking audit count adjustment modal
│       │   └── RecordSaleModal.tsx     # POS retail sale counter
│       │
│       ├── production/
│       │   ├── ProductionPage.tsx      # Commercial recipe book with live BOM availability
│       │   ├── BakeBatchModal.tsx      # Batch scheduler with FIFO lot preview & shortage blocker
│       │   └── LogWasteModal.tsx       # Kitchen shrinkage and spoilage log
│       │
│       ├── scanner/
│       │   └── BarcodeScannerModal.tsx # Dockside barcode intake terminal with laser animation
│       │
│       ├── analytics/
│       │   ├── AnalyticsPage.tsx       # Replenishment recommendations and trends
│       │   ├── MonthlyDemandTrend.tsx  # 30-day historical consumption & regression area chart
│       │   ├── TopSellersChart.tsx     # High-velocity ingredient bar chart
│       │   └── StockValuationCard.tsx  # Financial working capital breakdown
│       │
│       ├── alerts/
│       │   ├── AlertsPage.tsx          # Real-time alert center (Critical, Warning, Info)
│       │   ├── AlertCard.tsx           # Actionable alert item with 1-click PO generator
│       │   └── CreatePOModal.tsx       # Purchase order draft and issue modal
│       │
│       ├── impact/
│       │   └── ImpactPage.tsx          # Interactive financial ROI and shrinkage calculator
│       │
│       ├── simulator/
│       │   └── DemandSurgeModal.tsx    # Weekend and holiday demand surge simulator
│       │
│       └── settings/
│           └── SettingsModal.tsx       # Lead time, buffer thresholds, and system preferences
```

---

## 🌾 Seeded Bakery Operations Dataset

SmartStock comes pre-configured with a realistic bakery operational environment:

### 1. Raw Ingredients Catalog
| Product Name | Category | Current Stock | Minimum Required | Cost Price | Selling Price | Shelf Life | Active Lots | Primary Vendor |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Farm Fresh Brown Eggs** | Poultry & Dairy | 24 pcs | 60 pcs | ₹6.50 | ₹9.00 | 14 days | 2 lots (4d, 12d) | Sunbeam Farm Supplies |
| **All-Purpose Maida Flour** | Dry Staples | 65 kg | 80 kg | ₹42.00 | ₹65.00 | 90 days | 2 lots (45d, 75d) | Golden Grains Millers |
| **Unsalted Pure Butter** | Dairy | 18 kg | 25 kg | ₹420.00 | ₹580.00 | 21 days | 2 lots (2d urgent, 18d) | Creamy Valley Dairies |
| **Dark Couverture Choco Chips 70%** | Baking Essentials | 22 kg | 15 kg | ₹550.00 | ₹820.00 | 90 days | 2 lots (6d alert, 75d) | Cocoa Craft Imports |
| **Fine Granulated Sugar** | Dry Staples | 145 kg | 50 kg | ₹45.00 | ₹60.00 | 365 days | 2 lots (180d, 300d) | Golden Grains Millers |
| **Whole Milk Pasteurized** | Dairy | 15 L | 30 L | ₹54.00 | ₹74.00 | 5 days | 2 lots (2d urgent, 5d) | Creamy Valley Dairies |
| **Madagascar Bourbon Vanilla** | Flavors & Extracts | 9 btl | 4 btl | ₹950.00 | ₹1,450.00 | 365 days | 1 lot (300d) | Cocoa Craft Imports |
| **Double-Acting Baking Powder** | Baking Essentials | 28 tins | 10 tins | ₹180.00 | ₹260.00 | 180 days | 1 lot (150d) | Golden Grains Millers |

### 2. Commercial Production Recipes (BOM)
1. **French Butter Croissants:** Yields 24 pcs. Requires 1.5 kg Flour, 0.8 kg Butter, 0.25 kg Sugar, 0.5 L Milk, 4 Eggs. Prep time: 180 mins.
2. **Artisan Country Sourdough:** Yields 20 loaves. Requires 9.0 kg Flour, 0.2 kg Sugar. Prep time: 720 mins (36-hr cold retard).
3. **Dark Chocolate Brioche Buns:** Yields 16 buns. Requires 1.2 kg Flour, 0.4 kg Butter, 0.5 kg Chocolate Chips, 6 Eggs, 0.3 kg Sugar, 0.3 L Milk. Prep time: 120 mins.
4. **Madagascar Celebration Sponge:** Yields 2 cakes. Requires 0.8 kg Flour, 0.6 kg Sugar, 8 Eggs, 0.4 kg Butter, 0.1 btl Vanilla, 1 tin Baking Powder. Prep time: 90 mins.

---

## 🎨 Dual-Theme Visual Design System

SmartStock embraces an artisanal bakery aesthetic rendered through modern glassmorphic web design:

```
LIGHT THEME (Warm Artisan Parchment)          DARK THEME (Deep Espresso & Amber)
┌────────────────────────────────────────┐   ┌────────────────────────────────────────┐
│  --bg-base:      #F8F6F0 (Parchment)   │   │  --bg-base:      #1C1712 (Espresso)    │
│  --bg-surface:   #FFFFFF (Clean Cream) │   │  --bg-surface:   #26201A (Roast Bean)  │
│  --text-primary: #1E293B (Slate Ink)   │   │  --text-primary: #F1EAD9 (Warm Cream)  │
│  --accent:       #D97706 (Warm Amber)  │   │  --accent:       #E0954A (Golden Crust)│
│  --border:       rgba(226,232,240,0.8) │   │  --border:       #3A3128 (Charcoal)    │
└────────────────────────────────────────┘   └────────────────────────────────────────┘
```

- **CSS Semantic Variables:** Defined in `src/index.css` under `:root` and `[data-theme="dark"]`. Switching themes mutates zero inline style tags, resulting in smooth 60fps transitions.
- **Dynamic Recharts Synchronization:** Charts consume color tokens from `ThemeContext`, instantly repainting gradients, axes, and legends upon toggling without page reload.
- **Accessibility (a11y):** Floating theme toggle features explicit `aria-label`, visible focus indicators, and 44x44px minimum tap targets matching WCAG 2.1 AA specifications.

---

## 🔊 Zero-Dependency Web Audio Tactile Engine

To give the application the responsive, tactile feel of physical bakery equipment, SmartStock includes a synthesized Web Audio manager (`src/utils/audio.ts`):

- **No Asset Downloads:** 100% synthesized through native browser oscillators; requires zero external `.mp3` or `.wav` files.
- **Scanner Beep (`playScanBeep`):** Emulates a standard handheld optical scanner using a 1,760 Hz (A6) sine wave with exponential decay over 80 milliseconds.
- **Success Chime (`playSuccessChime`):** Warm C5–E5–G5 major triad (523.25 Hz, 659.25 Hz, 783.99 Hz) played sequentially with triangular wave harmonics for bake completions and stock receipts.
- **Tactile Click (`playClick`):** Soft 800 Hz micro-click for theme swaps and button taps.

---

## 🔑 Live Demonstration Credentials

SmartStock includes pre-seeded accounts representing each tier of the bakery team. Use the quick-switcher in the login dialog or enter credentials manually:

| Persona | Email | Demo Password | Role | Permissions Profile |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Nair** | `owner@sweetcrustbakery.com` | `demo1234` | **Owner / Head Baker** | Full access: Settings, Audits, CSV Export, Baking, POs, Financial ROI |
| **Amit Verma** | `purchasing@sweetcrustbakery.com` | `demo1234` | **Purchasing Staff** | Procurement focus: PO Generation, Intake, Vendor Analytics, CSV Export |
| **Priya Sharma** | `staff@sweetcrustbakery.com` | `demo1234` | **Floor Staff / Baker** | Kitchen focus: Recipe Baking, Waste Logging, Barcode Intake (No PO/Settings) |

---

## 💻 Getting Started & Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/Bhoomikaxoxo/SmartStock.git
cd SmartStock
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:5173`. Open your browser to explore the platform.

### 4. Build for Production
```bash
npm run build
```
Executes TypeScript type-checking (`tsc -b`) followed by Vite's production bundle optimization into the `/dist` directory.

### 5. Run Linter
```bash
npm run lint
```
Executes `oxlint` for rapid, high-performance static analysis.

---

## 🧪 Verification & Quality Assurance

SmartStock includes automated validation scripts to guarantee mathematical integrity:

```bash
# Verify FIFO lot consumption, status transitions, and seed balance reconciliation
npx tsx verify_fifo_engine.ts
```

**Verification Guarantees:**
- Seed data lot balance invariant: $\sum \text{StockLot.quantity} \equiv \text{Product.current\_stock}$ for all 8 products.
- Strict FIFO ordering: earliest expiring lots are depleted first down to 0 quantity before subsequent lots are touched.
- Non-negative balance constraint: prevents double deduction or negative stock balances across all bakes.
- TypeScript compiler passes with 0 type errors across all components, hooks, and contexts.

---

## 📄 License & Acknowledgments

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for bakers, pastry chefs, and food manufacturing operators striving for zero waste and maximum operational craft.
