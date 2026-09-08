# 🥐 SmartStock: Inside-Out Architecture & Feature Walkthrough

> A comprehensive, plain-English reference guide detailing how every system, formula, user interaction, and data structure works inside **SmartStock**.

---

## 📑 Table of Contents

1. [The Bakery Mental Model (Why Generic ERPs Fail)](#1-the-bakery-mental-model-why-generic-erps-fail)
2. [Feature 1: Batch Expiry & FIFO Tracking Engine](#2-feature-1-batch-expiry--fifo-tracking-engine)
3. [Feature 2: Bill of Materials (BOM) Production Scheduler](#3-feature-2-bill-of-materials-bom-production-scheduler)
4. [Feature 3: The Predictive Replenishment Engine (The Mathematics)](#4-feature-3-the-predictive-replenishment-engine-the-mathematics)
5. [Feature 4: Dockside Barcode Scanner Terminal](#5-feature-4-dockside-barcode-scanner-terminal)
6. [Feature 5: Simulated Demand Surge Engine](#6-feature-5-simulated-demand-surge-engine)
7. [Feature 6: Role-Based Access Control (RBAC) & Shift Security](#7-feature-6-role-based-access-control-rbac--shift-security)
8. [Feature 7: Dual-Theme Engine (Parchment & Espresso)](#8-feature-7-dual-theme-engine-parchment--espresso)
9. [Feature 8: Zero-Dependency Web Audio Synthesizer](#9-feature-8-zero-dependency-web-audio-synthesizer)
10. [Feature 9: Financial ROI & Shrinkage Impact Analyzer](#10-feature-9-financial-roi--shrinkage-impact-analyzer)
11. [State Management & Local Storage Persistence](#11-state-management--local-storage-persistence)
12. [Hands-On UI Exploration Checklist](#12-hands-on-ui-exploration-checklist)

---

## 1. The Bakery Mental Model (Why Generic ERPs Fail)

In typical retail inventory (e.g. apparel or electronics), inventory management is flat:
- You purchase 10 shirts.
- You sell 1 shirt.
- You have 9 shirts left.
- Shirts never expire, and selling a shirt doesn't consume trousers.

In a **commercial artisanal bakery**, this flat model fails completely:
1. **Strict Perishability:** Fresh milk turns sour in 5 days. European butter degrades in 21 days. Farm eggs spoil in 14 days. If your staff uses the newly delivered butter crate and leaves last week's crate at the back of the walk-in cooler, you throw thousands of rupees into the compost.
2. **Bill of Materials (BOM) Interdependence:** You don't sell raw butter or flour over the retail counter; you sell **French Butter Croissants**. A single batch of 24 croissants consumes 5 distinct raw materials simultaneously:
   - 1.5 kg Maida Flour
   - 0.8 kg Pure Butter
   - 0.25 kg Sugar
   - 0.5 Liters Whole Milk
   - 4 Brown Eggs
   If you have 100 kg of flour but you run out of eggs, **your entire croissant oven line halts**.
3. **Compound Reordering Lead Times:** You cannot wait until butter reaches 0 kg to reorder, because the local dairy takes **3 full transit days** to fulfill an order.

SmartStock is built around these physical constraints.

---

## 2. Feature 1: Batch Expiry & FIFO Tracking Engine

### What is a "Stock Lot"?
Rather than tracking stock as a single aggregate number (e.g., *"We have 18 kg of butter"*), SmartStock breaks inventory down into **individual delivery batches (lots)**:
- **Lot 1 (`LOT-BTR-2601`):** 6 kg, received 10 days ago, **expires in 2 days**.
- **Lot 2 (`LOT-BTR-2602`):** 12 kg, received 2 days ago, **expires in 18 days**.
- **Total On-Hand:** $6 + 12 = 18\text{ kg}$.

The system maintains this invariant across every transaction:
$$\sum \text{Active StockLot.quantity} \equiv \text{Product.current\_stock}$$

### What is FIFO (First-In, First-Out)?
FIFO mandates that **the stock that arrived earliest or expires soonest must be consumed first**.

### What Happens When You Bake a Batch (Under the Hood)?
When a baker clicks **"Execute Bake"** in the Recipe Book (for instance, baking croissants requiring 3.5 kg of butter):

```
[Bake Triggered: Need 3.5 kg Butter]
                │
                ▼
1. Query active lots for 'prod-butter'
                │
                ▼
2. Sort lots: expiry_date ASCENDING (Earliest expiry first)
   - Lot 1: LOT-BTR-2601 (6.0 kg available, Exp: 2 days)
   - Lot 2: LOT-BTR-2602 (12.0 kg available, Exp: 18 days)
                │
                ▼
3. Deduct 3.5 kg from Lot 1:
   - Lot 1 quantity becomes: 6.0 - 3.5 = 2.5 kg (status: 'expiring_soon')
   - Lot 2 remains untouched at 12.0 kg (status: 'active')
   - Product.current_stock drops from 18.0 kg to 14.5 kg
```

If another bake requires 3.0 kg:
```
- Lot 1 only has 2.5 kg remaining!
- System consumes all 2.5 kg from Lot 1 -> Lot 1 drops to 0 kg -> status flips to 'depleted'
- Remaining 0.5 kg needed is deducted from Lot 2 -> Lot 2 drops from 12.0 kg to 11.5 kg
- Product.current_stock drops to 11.5 kg
```
**The system automatically exhausts the expiring stock first with zero manual intervention.**

### UI Surfaces:
- **Perishable Shelf-Life Watch Banner (Top of Dashboard):** Scans all lots expiring within 7 days. Highlights urgent items (≤ 2 days) in red badges and includes a 1-click **"Prioritize in Bake"** action routing directly to recipes utilizing that ingredient.
- **Lot Traceability Modal (Inventory Page):** Accessible via the **"Lots"** button on each row/card. Shows batch IDs, receipt dates, remaining percentages, and countdown badges, plus an **"Add New Lot"** form.
- **"Expiring Soon (≤ 7d)" Filter Chip:** Instantly filters the catalog down to items with expiring lots.

---

## 3. Feature 2: Bill of Materials (BOM) Production Scheduler

The **Production Page** serves as the kitchen's digital prep board:

```
┌──────────────────────────────────────────────────────────────────┐
│                   FRENCH BUTTER CROISSANTS                       │
│  Yield: 24 pieces | Prep: 180 mins | Selling: ₹110 / piece      │
├──────────────────────────────────────────────────────────────────┤
│  Bill of Materials (BOM) per 1x Batch:                          │
│  • Flour:  1.5 kg    (In Stock: 65 kg)   ✅ In Stock             │
│  • Butter: 0.8 kg    (In Stock: 18 kg)   ✅ In Stock             │
│  • Sugar:  0.25 kg   (In Stock: 145 kg)  ✅ In Stock             │
│  • Milk:   0.5 L     (In Stock: 15 L)    ✅ In Stock             │
│  • Eggs:   4 pcs     (In Stock: 24 pcs)  ✅ In Stock             │
│                                                                  │
│  [ - ]   Batch Multiplier: [ 2x ]   [ + ]  -> Total Yield: 48 pcs│
└──────────────────────────────────────────────────────────────────┘
```

1. **Dynamic Scaling (1x to 10x):** Tapping `+` multiplies all ingredient requirements on the fly.
2. **Shortfall & Deficit Blocker:** If you step a recipe beyond on-hand inventory (e.g., 7x batches requires 28 eggs, but you only have 24 eggs):
   - The modal flags **"Short 4 pieces"** in bold red.
   - The **"Execute Bake" button disables** to prevent phantom inventory deductions.
   - A **"PO"** button appears next to Eggs, allowing staff to generate an emergency Purchase Order pre-filled with the needed quantity.
3. **Live FIFO Deduction Preview:** Under each ingredient, tags preview the exact lots to be depleted (e.g. `LOT-BTR-2601 (-1.6 kg) [2d left]`).
4. **On Execution:**
   - All 5 ingredients are atomically deducted from `products` and `stockLots`.
   - Web Audio plays a harmonic chime.
   - Confetti bursts on screen.
   - A record is added to the Dashboard's **Recent Activity Feed**.

---

## 4. Feature 3: The Predictive Replenishment Engine (The Mathematics)

All replenishment intelligence lives in `src/services/reorderEngine.ts`:

### A. Safety Stock ($SS$) — Buffer Cushion
Protects against late deliveries and sudden customer demand spikes:
$$SS = Z \times \sigma_d \times \sqrt{L}$$
- **$Z$ (Service Factor):** Set to `1.65` for a 95% statistical guarantee against stockouts.
- **$\sigma_d$ (Std Dev of Daily Consumption):** Measures how volatile sales have been over the last 30 days. Smooth daily usage yields a low $\sigma_d$; erratic spikes yield a higher $\sigma_d$.
- **$L$ (Lead Time):** Number of days the supplier requires for delivery (`supplier.lead_time_days`).
- **$\sqrt{L}$:** Accounts for lead-time uncertainty.

### B. Reorder Point ($ROP$) — Order Trigger
The inventory watermark that triggers a restock alert:
$$ROP = (\text{Average Daily Consumption} \times \text{Lead Time}) + \text{Safety Stock}$$
*Example:* You consume 4.5 kg of butter daily. The supplier takes 3 days ($4.5 \times 3 = 13.5\text{ kg}$). Safety stock is 8 kg.
$$ROP = 13.5 + 8 = 21.5\text{ kg}$$
The instant butter drops below 21.5 kg, SmartStock fires a warning alert.

### C. Economic Order Quantity ($EOQ$) — Order Sizing
Balances fixed ordering fees against inventory holding costs:
$$EOQ = \sqrt{\frac{2 \times D \times S}{H}}$$
- **$D$ (Annual Demand):** Daily usage $\times 365$.
- **$S$ (Order Cost):** Fixed administrative ordering fee (standardized at ₹150).
- **$H$ (Holding Cost):** Storage and refrigeration cost (20% of ingredient cost per year).

### D. 30-Day Ordinary Least Squares (OLS) Linear Regression
SmartStock fits a regression line $y = mx + b$ through historical sales records to calculate the exact projected stockout date:
$$\text{Slope } m = \frac{N \sum (x_i y_i) - \sum x_i \sum y_i}{N \sum x_i^2 - (\sum x_i)^2}$$

---

## 5. Feature 4: Dockside Barcode Scanner Terminal

Located in the top header, the **Scan Goods** terminal handles delivery truck receiving:

```
┌────────────────────────────────────────────────────────┐
│             BARCODE RECEIVING TERMINAL                 │
│         [ Optical Laser Sweep Animation ]              │
│       ((( SCANNING HARDWARE ACTIVE: 1.8 kHz )))        │
├────────────────────────────────────────────────────────┤
│ Tap to simulate dock scan:                             │
│ [ Unsalted Pure Butter ] -> Barcode: BAR-BUTTER-303    │
│                                                        │
│ PRODUCT RECOGNIZED: Unsalted Pure Butter               │
│ Matching Open Order Found: PO-2026-089 (Ordered: 10kg) │
│ Vendor: Creamy Valley Dairies                          │
│                                                        │
│ Stock Lot & Expiry Assignment (FIFO):                  │
│ • Lot #:       [ LOT-BTR-8491       ] (Auto-generated) │
│ • Expiry Date: [ 2026-09-29         ] (21 days shelf)  │
│                                                        │
│ [ Receive PO Quantity (10 kg) into Lot ]               │
└────────────────────────────────────────────────────────┘
```

1. **Hardware Simulation:** Features an optical green laser sweep and synthesized 1.8 kHz scanner beep.
2. **PO Matching:** Detects open Purchase Orders for the scanned item (`Sent` status) and displays the expected quantity and vendor.
3. **Lot Assignment:** Generates a structured lot code (`LOT-BTR-XXXX`) and calculates the expiry date from `product.shelf_life_days`.
4. **Intake:** Increases `current_stock`, creates a new `StockLot` in the FIFO queue, marks the PO as `Delivered`, and plays a confirmation chime.

---

## 6. Feature 5: Simulated Demand Surge Engine

Accessible via the header, this simulator models bakery demand volatility:
- **Weekend Rush:** 1.5x consumption multiplier.
- **Festive / Holiday Spike:** 2.2x consumption multiplier.
- **Viral Social Surge:** 3.0x consumption multiplier.

**How it operates:**
- Multiplies daily consumption rates without overwriting historical sales data.
- Recalibrates Safety Stock and ROP across all screens in real time.
- Displays an active amber banner on the Dashboard.
- Cleanly deactivates with a single click, restoring standard baseline operations.

---

## 7. Feature 6: Role-Based Access Control (RBAC) & Shift Security

SmartStock supports three distinct bakery operational roles:

| Role | Demo User | Capabilities & Restrictions |
| :--- | :--- | :--- |
| **Owner / Head Baker** | Rahul Nair (`owner@sweetcrustbakery.com`) | Unrestricted authority: Settings, Audits, CSV Exports, Baking, POs, ROI reports. |
| **Purchasing Staff** | Amit Verma (`purchasing@sweetcrustbakery.com`) | Procurement authority: Generates POs in Alerts/Analytics, receives deliveries, exports CSV. Baking and Settings are disabled. |
| **Floor Staff / Baker** | Priya Sharma (`staff@sweetcrustbakery.com`) | Kitchen execution: Bakes batches, scans deliveries, logs POS sales and waste. PO creation and Settings are hidden. |

- **Session Lifespan:** Sessions persist in `localStorage` for 8 hours with automatic expiration warnings.
- **Role Switcher:** Test any role instantly using the profile dropdown in the top-right corner (Demo Password: `demo1234`).

---

## 8. Feature 7: Dual-Theme Engine (Parchment & Espresso)

SmartStock provides two visual themes:
- **Light Theme (Warm Artisan Parchment):** `#F8F6F0` canvas, cream cards, warm amber accents.
- **Dark Theme (Deep Espresso & Amber):** `#1C1712` canvas, `#26201A` cards, `#F1EAD9` parchment ink text, glowing amber buttons.

**Engineering Highlights:**
- **CSS Semantic Variables:** Defined in `src/index.css`. Toggling changes only the `data-theme` attribute on the `<html>` element, delivering 60fps transitions with zero component re-renders.
- **SVG Recharts Integration:** Area gradients, axes, and donut slices adapt to active theme variables dynamically.
- **Non-Overlapping Layout:** Floating circular toggle at `bottom-6 right-6` with toasts anchored at `top-4 right-4` to prevent visual collisions.

---

## 9. Feature 8: Zero-Dependency Web Audio Synthesizer

SmartStock synthesizes tactile sound effects natively via the Web Audio API (`src/utils/audio.ts`):
- **Scanner Beep:** 1,760 Hz (A6) sine wave for 80 milliseconds.
- **Bake Success Chime:** Sequential major triad (C5 $\rightarrow$ E5 $\rightarrow$ G5: 523 Hz, 659 Hz, 783 Hz) with warm triangular harmonics.
- **Tactile Click:** 800 Hz micro-sine wave for button interactions.
- **Zero Asset Overhead:** No external `.mp3` or `.wav` files to download.

---

## 10. Feature 9: Financial ROI & Shrinkage Impact Analyzer

The **Impact Page** quantifies annual rupee savings across three areas:
1. **Stockout Prevention:** Recaptures lost sales from canceled cake and pastry orders by maintaining safety stock buffers.
2. **Spoilage & Shrinkage Prevention:** Reduces waste by ensuring perishable ingredients are consumed before expiration via FIFO scheduling.
3. **Emergency Freight Savings:** Eliminates premium courier costs through proactive lead-time reordering.

Interactive sliders allow bakery managers to model custom incident rates and costs.

---

## 11. State Management & Local Storage Persistence

All application state is managed in `AppContext.tsx` and persisted to browser `localStorage`:

```
 Browser LocalStorage Keys
 ├── 'smartstock_products_v4'     # 8 raw ingredients, stock counts, costs
 ├── 'smartstock_lots_v4'         # Active, expiring, and depleted stock lots
 ├── 'smartstock_recipes_v4'      # 4 bakery recipes with BOM definitions
 ├── 'smartstock_pos_v4'          # Open and delivered Purchase Orders
 ├── 'smartstock_alerts_v4'       # Low-stock and expiry alert feed
 ├── 'smartstock_wastelog_v4'     # Kitchen waste log
 ├── 'smartstock_session_v1'      # Active user role and expiry timestamp
 └── 'smartstock_theme_v1'        # Visual theme ('light' | 'dark')
```

- Refreshing or closing the browser preserves all changes.
- Use **"Reset Demo Data"** in Settings at any time to restore the initial seed state.

---

## 12. Hands-On UI Exploration Checklist

Follow these steps to experience the complete feature set:

- [ ] **1. Dashboard Expiry Banner:** View the 2-day shelf-life warning on Butter and Milk.
- [ ] **2. Prioritize in Bake:** Click the button on the banner to navigate directly to French Butter Croissants.
- [ ] **3. Recipe BOM Stepper:** Step the batch to 2x, observe ingredient scaling, and note the live FIFO lot deduction preview (`LOT-BTR-2601`).
- [ ] **4. Execute Bake:** Click the button to hear the audio chime, see confetti, and verify Butter stock decreases from 18 kg to 16.4 kg.
- [ ] **5. Lot Inspector Modal:** Go to Inventory, click **"Expiring Soon (≤ 7d)"**, and open the **"2 Lots"** modal on Butter to see the updated lot balances.
- [ ] **6. Barcode Scanner Terminal:** Click **"Scan Goods"** in the header, select Butter, verify auto-generated lot and expiry values, and accept stock.
- [ ] **7. Demand Surge Simulator:** Select **"Festive Rush (2.2x)"** from the header and watch safety stock buffers expand across the application.
- [ ] **8. Theme Toggle:** Click the circular sun/moon toggle at `bottom-6 right-6` to switch between Parchment and Espresso modes.
- [ ] **9. Role Switcher:** Switch to **Priya Sharma (Floor Staff)** in the user menu and observe that administrative settings and PO controls are hidden.
