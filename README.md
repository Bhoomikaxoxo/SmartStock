# SmartStock — Inventory Forecasting & Reorder Management System

> **Turning guesswork into data-backed replenishment.** An algorithmic inventory management, demand forecasting, and stockout prevention platform tailored for retail and small businesses (demonstrated via *Sweet Crust Artisan Bakery*).

---

## 📌 Problem & Value Proposition

Small businesses traditionally manage inventory with manual spreadsheets and memory. This leads to:
- **Painful Stockouts**: Running out of critical staples right before peak weekend demand when suppliers are closed.
- **Tied-up Capital**: Overstocking expensive, slow-moving items.
- **Wasted Time & Revenue**: Cancelled customer orders, idle production staff, and missed sales.

**SmartStock** addresses this by calculating dynamic daily consumption rates, factoring in supplier lead times and safety buffers, and predicting demand trends to issue automated purchase order recommendations before emergency thresholds are breached.

---

## 🚀 Key Features

### 1. Master Inventory Catalog & Real-Time Tracking
- Real-time tracking of on-hand inventory, minimum safety buffers, cost prices, and current valuations.
- **Unified 4-Status Health Palette**:
  - `Healthy`: Current stock $\ge$ Minimum buffer
  - `Low Stock`: Current stock $<$ Minimum buffer
  - `Critical`: Current stock $\le$ 50% Minimum buffer
  - `Out of Stock`: Current stock $= 0$
- **Hardened Inventory Operations**: Fast stock auditing, sales recording with over-selling guards, and CSV export (restricted to authorized roles).

### 2. Algorithmic Reorder Suggestion Engine
Calculates replenishment dynamically from 90 days of daily sales data:
- **Average Daily Consumption**: $\text{avg\_daily} = \frac{\sum \text{units sold last 30 days}}{30}$
- **Days Until Stockout**: $\text{days\_to\_stockout} = \frac{\text{current\_stock}}{\text{avg\_daily}}$
- **Reorder Trigger Point**: $\text{trigger\_point} = \text{avg\_daily} \times \text{lead\_time\_days}$
- **Recommended Order Quantity**: $\text{qty} = (\text{avg\_daily} \times (\text{lead\_time\_days} + \text{buffer\_days})) - \text{current\_stock}$ *(default $\text{buffer} = 2$ days)*
- Produces automated natural language actions: *"Order 120 pieces of Farm Fresh Eggs within 1 day(s) to maintain safety buffer."*

### 3. Demand Forecasting & Linear Regression Projections
- Mathematical linear regression over rolling 30-day buckets to project Month +1 consumption.
- Visual breakdown of actual vs projected demand with growth rate indicators.
- Top-selling items ranking (30d / 60d / 90d filters) and slow-moving inventory analysis to highlight capital locked in stagnant stock.

### 4. Priority Alerts Feed
- Categorized by severity (Critical, Warning, Expiring Soon, Planning Info).
- Direct 2-step purchase order generation with order summary confirmation and vendor lead time calculation.

### 5. Financial Impact & ROI Calculator
- Interactive parameter sliders for monthly stockouts and average revenue loss per incident.
- Before vs. After revenue loss visualization and savings comparison table.
- Demonstrates **8x+ ROI** and a payback period of $< 4$ days against commercial SaaS pricing.

---

## 🔐 Role-Based Access Control (RBAC)

SmartStock includes built-in demo authentication and least-privilege role gating:

| Role | Demo User | Email | Password | Accessible Modules | PO Authority |
|---|---|---|---|---|---|
| **Owner** | Rahul Nair | `owner@sweetcrustbakery.com` | `demo1234` | Full access (All 6 tabs + Settings) | Full Authorization |
| **Purchasing Staff** | Amit Verma | `purchasing@sweetcrustbakery.com` | `demo1234` | Dashboard, Inventory, Forecast, Alerts | Direct PO Creation (Analytics & Alerts) |
| **Floor Staff** | Priya Sharma | `staff@sweetcrustbakery.com` | `demo1234` | Dashboard, Inventory, Alerts | View & Resolve Alerts Only |

*Note: Client-side session management with 8-hour expiry for prototype demonstration.*

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Iconography**: Lucide React
- **Data Visualization**: Recharts
- **Build Tool**: Vite
- **Data Layer**: LocalStorage persistence with seeded 90-day daily sales history

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/Bhoomikaxoxo/SmartStock.git
cd SmartStock

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser. Use any of the 1-click demo persona quick-fill buttons on the login screen to explore different permission levels.

---

## 📄 License
MIT
