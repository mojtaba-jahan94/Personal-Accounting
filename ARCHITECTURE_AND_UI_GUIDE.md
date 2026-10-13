# Personal Accounting — Comprehensive Architecture, Logic & UI/UX Redesign Specification
> **Target AI Agent:** Antigravity (Model: Gemini 3.8 Flash)
> **Project Stack:** React + TypeScript + Vite + Tailwind CSS + Lucide Icons + Turso (LibSQL) + PWA
> **Primary Language & Direction:** Persian (Farsi) — Strict RTL (`dir="rtl"`)

---

## 1. Executive Summary & Mission for Antigravity
You are tasked with **auditing, fixing logical/accounting bugs, and completely rebuilding the UI/UX** of the Personal Accounting web application.
- **CRITICAL RULE 1 (Zero Build Errors):** Before completing any phase, ensure all TypeScript types in `src/types/index.ts` match component props strictly. Never leave unused imports, untyped parameters, or broken references that would fail `tsc && vite build` on Vercel.
- **CRITICAL RULE 2 (Preserve Features):** Keep all existing capabilities (Accounts, Transactions, SMS Parser, Live Assets & Telegram Parser, Debts & Cheques, Budgets, Goals, Reports, Turso Cloud Sync, Crypto Auth), but refactor their UI and fix their underlying state logic.
- **CRITICAL RULE 3 (Performance-First Liquid Glass):** Replace heavy, unoptimized nested glass filters with a clean, high-FPS **Modern Spatial Glass (visionOS / iOS 26 FinTech)** design system.

---

## 2. Complete Project Directory Map

```text
Personal-Accounting-main/
├── .agents/skills/liquidglass/SKILL.md      # Liquid glass reference skill
├── public/
│   ├── manifest.webmanifest                 # PWA manifest
│   ├── sw.js                                # Service worker
│   └── icon-192.png, icon-512.png
├── src/
│   ├── main.tsx                             # App bootstrap
│   ├── App.tsx                              # Root layout, routing/tab state, global modals
│   ├── index.css                            # Tailwind directives, font-face, glass & scrollbar tokens
│   ├── types/
│   │   └── index.ts                         # Central TypeScript interfaces (Account, Transaction, Asset, Debt, Cheque, Budget, Goal, etc.)
│   ├── context/
│   │   ├── AuthContext.tsx                  # Local/Cloud user authentication & lock screen state
│   │   └── FinanceContext.tsx               # Core state engine, CRUD actions, ledger reconciliation, Turso sync trigger
│   ├── services/
│   │   ├── cryptoAuth.ts                    # Web Crypto API hashing/encryption for PIN/Password
│   │   ├── marketPriceService.ts            # Live price fetcher (Gold, Coin, USD, Crypto)
│   │   └── tursoClient.ts                   # LibSQL/Turso HTTP client for cloud backup & sync
│   ├── utils/
│   │   ├── categoryIcons.tsx                # Icon mapping for expense/income categories
│   │   ├── formatters.ts                    # Currency, Persian digits, Rial/Toman converter, card formatting
│   │   ├── jalali.ts                        # Shamsi calendar math, zero-padded formatting (YYYY/MM/DD), month boundaries
│   │   ├── liquidGlassPresets.ts            # Standardized glass surface tokens
│   │   ├── sampleData.ts                    # Seed data for demo mode
│   │   └── smsParser.ts                     # Iranian bank SMS regex parser (amount, type, card/account, balance)
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.tsx                  # Desktop right-aligned navigation rail
│       │   ├── BottomNav.tsx                # Mobile 5-tab bottom dock + "More" drawer
│       │   ├── Header.tsx                   # Sticky top bar (Page title, Sync badge, Privacy toggle, Quick Add)
│       │   └── InstallPrompt.tsx            # PWA installation banner
│       ├── common/
│       │   ├── LiquidGlassContainer.tsx     # Optimized glass surface wrapper
│       │   ├── MinimalBackground.tsx        # High-performance ambient mesh background
│       │   ├── SilkWaveBackground.tsx       # GPU-throttled canvas/SVG wave background
│       │   ├── JalaliDatePicker.tsx         # Portal-based Persian date picker
│       │   ├── DateFilterBar.tsx            # Period selector (Current month, Custom range, Quick presets)
│       │   └── CollapsibleSection.tsx       # Smooth accordion wrapper
│       ├── dashboard/
│       │   ├── DashboardView.tsx            # Main overview grid (Bento layout)
│       │   ├── DashboardCustomizeModal.tsx  # Toggle/reorder dashboard widgets
│       │   ├── StatCard.tsx                 # KPI metric card with trend badge
│       │   └── ExpenseChart.tsx             # Donut/Bar visual analytics
│       ├── accounts/
│       │   ├── AccountsView.tsx             # Bank cards grid & balance summary
│       │   ├── AccountModal.tsx             # Create/Edit bank account
│       │   └── TransferModal.tsx            # Account-to-account transfer with fee handling
│       ├── transactions/
│       │   ├── TransactionList.tsx          # Searchable, filterable, grouped ledger list
│       │   ├── TransactionModal.tsx         # Unified Income/Expense entry modal
│       │   └── SMSAssistantModal.tsx        # Bank SMS paste & auto-extract modal
│       ├── assets/
│       │   ├── AssetsView.tsx               # Portfolio summary, PnL, Gold/Currency/Crypto holdings
│       │   ├── AssetModal.tsx               # Add/Edit asset item
│       │   ├── AssetTradeModal.tsx          # Buy/Sell asset with optional bank account deduction
│       │   ├── EditMarketPriceModal.tsx     # Manual market price override
│       │   ├── PriceSourceSettingsModal.tsx # Configure price API endpoints
│       │   └── TelegramPasteModal.tsx       # Parse market prices from Telegram text
│       ├── debts/
│       │   ├── DebtsAndChequesView.tsx      # Unified Payable/Receivable & Cheques manager
│       │   ├── DebtModal.tsx                # Create/Edit debt or loan
│       │   ├── PayDebtModal.tsx             # Partial or full debt settlement linked to bank account
│       │   └── ChequeModal.tsx              # Issue/Receive cheque with Jalali due date & status
│       ├── budget/
│       │   ├── BudgetView.tsx               # Monthly category budgets & progress bars
│       │   └── BudgetModal.tsx              # Set/Edit category budget cap
│       ├── goals/
│       │   ├── GoalsView.tsx                # Financial goals & savings milestones
│       │   └── GoalModal.tsx                # Create/Edit savings goal & allocate funds
│       ├── reports/
│       │   └── ReportsView.tsx              # Cashflow trends, category breakdown, net worth history
│       ├── categories/
│       │   └── CategoryManagerModal.tsx     # Custom category CRUD
│       ├── contacts/
│       │   └── PersonManagerModal.tsx       # Counterparty/Contact CRUD
│       ├── auth/
│       │   ├── AuthView.tsx                 # Login / PIN lock screen
│       │   └── UserProfileModal.tsx         # User profile & security settings
│       └── settings/
│           ├── SettingsView.tsx             # Theme, background, backup/export, reset, categories, contacts
│           └── TursoConfigModal.tsx         # Turso database URL & Auth Token setup
```

---

## 3. Mandatory Logic & Accounting Bug Fixes (Phase 1)

Antigravity MUST inspect and fix these exact logical flaws before or during the UI overhaul:

### 3.1. Ledger Reconciliation & Single Source of Truth (`src/context/FinanceContext.tsx`)
1. **Initial Balance vs. Current Balance:**
   - Ensure every `Account` has an explicit `initialBalance: number` and `balance: number`.
   - Create a pure helper function `recalculateAllAccountBalances(accounts, transactions, transfers)` inside `FinanceContext.tsx`.
   - Whenever a transaction or transfer is **Added, Edited, or Deleted**, recompute the affected accounts' balances deterministically so editing an old transaction's amount or changing its `accountId` never corrupts account balances.
2. **Transfer Logic (`TransferModal.tsx` & `FinanceContext.tsx`):**
   - Prevent `fromAccountId === toAccountId`.
   - When a transfer of `amount` with `fee` is executed:
     - Deduct `amount + (fee || 0)` from `fromAccount`.
     - Add `amount` to `toAccount`.
     - Store `transferId` or linked transaction records so deleting a transfer reverses both sides cleanly.
3. **Asset Trade Accounting (`AssetTradeModal.tsx`):**
   - **Buy Operation:** Calculate new average buy price using Weighted Average Cost:
     `newBuyPrice = ((oldQty * oldBuyPrice) + (buyQty * tradeUnitPrice)) / (oldQty + buyQty)`.
     If linked to a bank account (`accountId`), automatically create an expense/investment transaction deducting `buyQty * tradeUnitPrice`.
   - **Sell Operation:** Validate `sellQty <= currentQty`. Reduce `quantity` by `sellQty` without altering `buyPrice` (average cost basis remains unchanged). If linked to a bank account, create an income/deposit transaction adding `sellQty * tradeUnitPrice`.
4. **Debt Settlement & Cheque Clearing (`PayDebtModal.tsx` & `ChequeModal.tsx`):**
   - In `PayDebtModal.tsx`: Clamp payment amount to `0 < payAmount <= debt.remainingAmount`. When `remainingAmount` reaches `0`, automatically transition status to `'paid'` / `'settled'`.
   - In `ChequeModal.tsx`: Only deduct/deposit the cheque amount from/to the linked bank account when the cheque status changes to `'cleared'` (پاس شده). If reverted from `'cleared'` to `'pending'` or `'bounced'`, reverse the balance impact.
5. **Turso Sync Race Condition (`tursoClient.ts` & `FinanceContext.tsx`):**
   - Add an `isHydrated` / `isInitialSyncComplete` ref guard in `FinanceContext.tsx`. Never push local state to Turso until initial hydration has completed.
   - Debounce automatic cloud sync calls by `1500ms` and expose a clear `syncStatus: 'idle' | 'syncing' | 'synced' | 'error'` state for `Header.tsx`.
6. **Jalali Date Normalization (`src/utils/jalali.ts`) & SMS Parser (`src/utils/smsParser.ts`):**
   - Standardize all stored Jalali dates to zero-padded `YYYY/MM/DD` (e.g., `1405/07/05`, never `1405/7/5`) so lexicographical string comparisons (`date >= startDate && date <= endDate`) in `DateFilterBar.tsx` and `BudgetView.tsx` work with 100% accuracy.
   - In `smsParser.ts` and `TelegramPasteModal.tsx`: Always run a `normalizeDigits(str)` utility first (converting `۰-۹` and `٠-٩` to `0-9` and stripping `,` / `٬` / `،`). Automatically convert Rial amounts from bank SMS to Toman (`Math.floor(rialAmount / 10)`) with a visible toggle in `SMSAssistantModal.tsx` ("مبلغ پیامک به ریال است / تبدیل خودکار به تومان").

---

## 4. Complete UI/UX Redesign Specification (Phase 2 & 3)

### 4.1. Design Philosophy: "Nordic Warm Wood" Spatial Glass (Clean, Fast, RTL-Native)
The application strictly enforces the **Nordic Warm Wood Design System**, combining Scandinavian organic minimalism (warm wood and stone neutrals) with Apple visionOS spatial glass depth:

1. **Strict Core Palette Tokens:**
   - `nordic-charcoal`: `#1F2933` (Deep fjord anchor — Primary dark mode base background, deep glass backdrop surfaces, primary crisp text in light mode).
   - `fjord-gray`: `#6B7280` (Cool slate midtone — Secondary/muted descriptions, inactive icons, subtle card borders).
   - `cloud-gray`: `#D1D5DB` (Soft overcast tone — Specular glass borders, clean dividers, secondary surface accents, body text in dark mode).
   - `snow-cream`: `#F7F7F2` (Warm snowy surface — Primary light mode canvas/surface, crisp headings & prominent numeric totals in dark mode).
   - `warm-wood`: `#A68A64` (Natural cedar accent — Primary Brand Accent, CTA buttons, active navigation pills, focus rings, wealth highlights).
   - `warm-wood-light`: `#C2A882` (Hover/highlight state for Warm Wood interactive elements).
   - `warm-wood-dark`: `#8A704C` (Active/pressed state for Warm Wood interactive elements).

2. **Harmonized Nordic Semantic Colors (for Financial Status):**
   - **Income / Profit / Receivable:** Nordic Sage Emerald (`#2E7D5B` light / `#4ADE80` muted in dark mode with `#4ADE80`/10% background badge).
   - **Expense / Loss / Payable:** Nordic Terracotta Rose (`#C0564B` light / `#F87171` muted in dark mode with `#F87171`/10% background badge).
   - **Transfer / Cheque Pending:** Nordic Fjord Blue (`#4A6FA5` light / `#60A5FA` muted in dark mode with `#60A5FA`/10% background badge).
   - **Warning / Gold & Assets:** Warm Wood (`#A68A64` / `#C2A882`).

3. **Three-Tier Surface Hierarchy (Performance Rule):**
   - **Tier 1 (App Canvas):** Base background (`#1F2933` dark mode, `#F7F7F2` light mode). Supported by `MinimalBackground.tsx` and `SilkWaveBackground.tsx` with cedar/nordic ambient gradients.
   - **Tier 2 (Structural Panels & Navigation):** `LiquidGlassContainer.tsx` on `Sidebar.tsx`, `BottomNav.tsx`, `Header.tsx`, hero net worth card, and active modal dialogs.
   - **Tier 3 (Ledger Rows & Nested Cards):** Lightweight translucent surfaces (`bg-nordic-charcoal/40 dark:bg-nordic-charcoal/70 border border-nordic-cloud/10 dark:border-white/10 rounded-2xl transition-colors`) without recursive GPU backdrop-filters to guarantee constant 60fps scrolling.

4. **Typography & Tabular Numerics:**
   - Vazirmatn / IRANYekan font stack with `font-variant-numeric: tabular-nums` strictly enforced globally on all numeric elements, prices, dates, percentages, and inputs.

3. **Number, Currency & RTL Input UX (`formatters.ts`):**
   - All currency inputs across all 18 modals must use a shared `CurrencyInput` pattern:
     - Display live thousand-separated numbers while typing without jumping the cursor.
     - Show live **Persian Words Preview** below every amount input (e.g., `۱۲,۵۰۰,۰۰۰` -> `دوازده میلیون و پانصد هزار تومان`) so users never make a zero-count mistake!
     - Enforce `dir="ltr"` on numeric inputs, card numbers (`XXXX-XXXX-XXXX-XXXX`), and negative percentages (`-4.2%`), while keeping labels and units (`تومان`, `گرم`) right-aligned.

### 4.2. Layout & Navigation Overhaul (`App.tsx`, `Sidebar.tsx`, `BottomNav.tsx`, `Header.tsx`)
1. **Desktop Layout (`lg:grid-cols-[280px_1fr]`):**
   - Fixed right-hand `Sidebar.tsx` (`w-[280px]`) with grouped navigation:
     - *میز کار:* داشبورد، گزارش‌ها و تحلیل
     - *عملیات مالی:* تراکنش‌ها، حساب‌های بانکی، بودجه‌بندی
     - *سرمایه و تعهدات:* دارایی‌ها و بازار، بدهی و چک‌ها، اهداف مالی
     - *سیستم:* تنظیمات و همگام‌سازی ابری
2. **Mobile Navigation (`BottomNav.tsx`):**
   - Never cram 8+ items into the bottom bar!
   - Show **4 Primary Tabs + 1 Central Floating Action Button (FAB) + 1 "More (بیشتر)" Sheet**:
     1. `داشبورد` (Dashboard)
     2. `تراکنش‌ها` (Transactions)
     3. **`+ ثبت سریع` (Center Prominent Button -> opens Quick Action Sheet: تراکنش جدید / خواندن پیامک / انتقال وجه)**
     4. `دارایی‌ها` (Assets)
     5. `بیشتر` (Bottom Drawer opening Accounts, Debts & Cheques, Budget, Goals, Reports, Settings)
   - Add `pb-28 lg:pb-8` to the main scrollable container in `App.tsx` so `BottomNav.tsx` never covers the bottom of any view.
3. **Header (`Header.tsx`):**
   - Sticky top bar containing:
     - Current View Title & Jalali Date (`سه‌شنبه ۲۱ مهر ۱۴۰۵`)
     - **Privacy Mode Toggle (چشم مخفی‌سازی مبالغ):** Blurs or masks all balances (`•••••••`) with one click.
     - **Turso Cloud Sync Pill:** Shows live sync status (`همگام‌سازی شده` / `در حال سینک...` / `آفلاین`) and opens `TursoConfigModal.tsx` on click.
     - Quick SMS Paste button (`دستیار پیامک`) & User Profile avatar.

### 4.3. Standardized Modal & DatePicker Architecture (Fixing the 18 Modals)
1. **Unified Modal Shell:**
   - All 18 modals (`AccountModal`, `TransactionModal`, `AssetModal`, etc.) must follow a unified responsive Bottom-Sheet-on-Mobile / Centered-Dialog-on-Desktop structure:
     - Backdrop: `fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4`
     - Container: `w-full sm:max-w-lg max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-white/15 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden`
     - Sticky Header (`px-6 py-4 border-b border-white/10 flex items-center justify-between`)
     - Scrollable Body (`p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain`)
     - Sticky Footer (`px-6 py-4 border-t border-white/10 bg-slate-950/50 flex items-center gap-3`) so action buttons are ALWAYS visible even when the mobile keyboard is open!
2. **Portal-Based `JalaliDatePicker.tsx`:**
   - Render the calendar popover via `createPortal(..., document.body)` with `z-[100]` or as an inline expandable/modal picker so it is NEVER clipped by `overflow-hidden` or `LiquidGlassContainer` stacking contexts inside modals.

### 4.4. View-by-View Redesign Checklist

1. **`DashboardView.tsx` (Bento Grid FinTech Dashboard):**
   - **Hero Net Worth Banner:** Total Net Worth (موجودی حساب‌ها + ارزش روز دارایی‌ها + طلب‌ها - بدهی‌ها) with breakdown pills.
   - **4 KPI StatCards (`StatCard.tsx`):** نقدینگی حساب‌ها، درآمد ماه جاری، هزینه ماه جاری، ارزش روز سرمایه‌گذاری‌ها.
   - **Quick Actions Strip:** تراکنش جدید، ثبت با پیامک، انتقال وجه، بروزرسانی قیمت بازار.
   - **2-Column Middle Section:** `ExpenseChart.tsx` (interactive category donut with center total) + Upcoming Cheques/Debts Alert list (چک‌ها و بدهی‌های نزدیک به سررسید).
   - **Recent Transactions Widget:** Last 5 transactions with quick "مشاهده همه" link.

2. **`AccountsView.tsx`:**
   - Render bank accounts as realistic, sleek **Iranian Bank Cards** (auto-detecting bank color/logo from the 6-digit BIN prefix of the 16-digit card number if provided, e.g., Mellat, Melli, Saman, Pasargad, BluBank, Tejarat).
   - One-click copy for Card Number and Sheba (IBAN) with toast feedback.
   - Prominent "انتقال بین حساب‌ها" (`TransferModal.tsx`) button in the view header.

3. **`TransactionList.tsx` & `TransactionModal.tsx`:**
   - Sticky filter bar combining `DateFilterBar.tsx`, Search input, Type filter (`همه | درآمد | هزینه | انتقال`), Account filter, and Category filter.
   - Group transactions by **Day** (e.g., `امروز - ۲۱ مهر` with daily net sum badge on the left).
   - Segmented Tab in `TransactionModal.tsx` for switching between `هزینه (Expense)`, `درآمد (Income)`, and `انتقال (Transfer)` smoothly.

4. **`AssetsView.tsx`:**
   - Top Portfolio Summary card showing: Total Current Value, Total Invested Cost, and Total Profit/Loss (سود/زیان کل به تومان و درصد) with color-coded badge.
   - Action bar: `+ افزودن دارایی`, `ثبت خرید/فروش`, `بروزرسانی آنلاین قیمت‌ها`, `خواندن قیمت از تلگرام` (`TelegramPasteModal.tsx`).
   - Group holdings by type (`طلا و سکه`, `ارزها`, `رمزارز`, `سایر`) with live unit price, quantity, average buy price, and individual PnL percentage bar.

5. **`DebtsAndChequesView.tsx`:**
   - Clean 3-Tab Segmented Control: `بدهی‌های من (Payables)` | `طلب‌های من (Receivables)` | `مدیریت چک‌ها (Cheques)`.
   - Visual progress bar on each debt item showing paid vs. remaining amount, plus a quick `تسویه / پرداخت قسط` (`PayDebtModal.tsx`) button.
   - Cheque cards showing Due Date countdown badge (`۳ روز مانده`, `سررسید امروز`, `گذشته`), Sayyad ID (شناسه صیادی ۱۶ رقمی), counterparty name, and 1-click status change (`پاس شد` / `برگشت خورد`).

6. **`BudgetView.tsx` & `GoalsView.tsx`:**
   - In `BudgetView.tsx`: Highlight categories exceeding 80% of monthly budget in Amber and >100% in Rose with "مازاد بودجه" alert.
   - In `GoalsView.tsx`: Circular or sleek linear progress bar, target date, and "چقدر ماهانه پس‌انداز کنم تا به هدف برسم؟" smart calculation.

---

## 5. Step-by-Step Execution Plan for Antigravity

Execute the refactoring in **4 sequential phases** and verify TypeScript compilation after each phase:

- **Phase 1 (Core Logic & Utilities Fix):**
  1. Audit and update `src/types/index.ts`.
  2. Fix `src/utils/jalali.ts` (zero-padded dates) and `src/utils/formatters.ts` (add `numberToPersianWords` and `normalizeDigits`).
  3. Upgrade `src/utils/smsParser.ts` (Rial-to-Toman handling + digit normalization).
  4. Refactor `src/context/FinanceContext.tsx` and `src/services/tursoClient.ts` (deterministic balance reconciliation, atomic transfers, weighted average asset cost, debounced cloud sync).
- **Phase 2 (Design System, Layout & Common Components):**
  1. Update `src/index.css` and `src/utils/liquidGlassPresets.ts` for high-FPS spatial glass tokens.
  2. Refactor `LiquidGlassContainer.tsx`, `JalaliDatePicker.tsx` (fix clipping/z-index), and `DateFilterBar.tsx`.
  3. Rebuild `App.tsx`, `Sidebar.tsx`, `BottomNav.tsx` (4 tabs + Center Quick Add + More Drawer), and `Header.tsx` (Privacy toggle + Sync badge).
- **Phase 3 (Main Views Overhaul):**
  1. Rebuild `DashboardView.tsx`, `StatCard.tsx`, and `ExpenseChart.tsx`.
  2. Rebuild `AccountsView.tsx` and `TransactionList.tsx`.
  3. Rebuild `AssetsView.tsx`, `DebtsAndChequesView.tsx`, `BudgetView.tsx`, `GoalsView.tsx`, `ReportsView.tsx`, and `SettingsView.tsx`.
- **Phase 4 (Modal Standardization & Build Verification — 100% COMPLETE):**
  1. Applied the unified responsive Nordic Bottom-Sheet/Dialog layout, mobile drag handle, sticky header/footer, and Persian amount-in-words helper (`numberToPersianWords`) to all 19 modals (`TransactionModal`, `SMSAssistantModal`, `AccountModal`, `TransferModal`, `AssetModal`, `AssetTradeModal`, `EditMarketPriceModal`, `PriceSourceSettingsModal`, `TelegramPasteModal`, `DebtModal`, `PayDebtModal`, `ChequeModal`, `BudgetModal`, `GoalModal`, `CategoryManagerModal`, `PersonManagerModal`, `DashboardCustomizeModal`, `UserProfileModal`, `TursoConfigModal`).
  2. Verified Persian digit support (`normalizeDigits`) and zero clipping with portal-based `JalaliDatePicker`.
  3. Audited and eliminated all legacy neon/indigo/purple classes across the entire codebase.
  4. Executed `npm run build` (`tsc && vite build`) and achieved **0 TypeScript errors and 0 build warnings**. All 4 phases are fully complete!