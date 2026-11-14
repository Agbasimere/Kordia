# Kordia — Private Peer Escrow & Cross-Border Settlement

> **Private agreements. Protected payments. Borderless work.**

Kordia is a privacy-focused, milestone-based peer escrow platform designed for cross-border hirers and talents to collaborate with mutual confidence without blind trust. It combines shielded **Zcash Orchard** privacy primitives with **Pollar Banking Rails** for instant off-ramp settlement into local bank accounts (e.g., Nigerian GTBank).

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Agbasimere/Kordia.git
cd Kordia

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
cp .env.example .env
# Set your Supabase project credentials in .env

# 4. Start the development server
npm run dev

# Open http://localhost:5175
```

---

## 🚀 Key Features & Architecture

### 1. Peer-to-Peer Escrow (Hirer & Talent)
- **Direct 2-Party Consensus:** Mutual agreement between Client (Hirer) and Talent. Eliminates third-party overhead.
- **Milestone-Based Escrow:** Funds are securely locked in escrow and only released upon milestone completion and client acceptance.
- **Agreement Stepper:** Live lifecycle tracking (`Created` → `Accepted` → `Funded` → `Submitted` → `Approved` → `Settled`).

### 2. Verified User Tag System
- Unique user tags (`@davidvance`, `@amaraokafor`, `@admin`) for seamless agreement tagging.
- Email verification gating ensuring both parties are authenticated before engaging in high-value escrow contracts.
- 1-click user verification manager in the administration console.

### 3. Dual Blockchain & Settlement Rails
- **Zcash Orchard Shielded Pool (Testnet):**
  - Shielded memo and private transaction commitment.
  - Halo 2 zero-knowledge proofs and viewing keys for selective regulatory disclosure.
  - Testnet explorer references and faucet integration.
- **Pollar Liquidity & Off-Ramp Rails:**
  - Real-time USD/NGN FX feeds (`₦1,500 = $1.00 USD`).
  - Direct off-ramp clearing to Nigerian commercial banks (e.g., Guaranty Trust Bank) with sub-120s settlement SLA.

### 4. Supabase Backend Integration
- Relational schema with Row Level Security (RLS) for `profiles`, `agreements`, `milestones`, `escrow_vaults`, `settlement_payouts`, and `activity_logs`.
- Real-time client synchronization with local fallback persistence.
- Complete migration SQL located in [`supabase/schema.sql`](supabase/schema.sql).

### 5. Dedicated Global Node Admin Console (`/admin`)
- Accessible via `/#/admin` or discrete navigation with master key password gate (`AdminSecure2026!`).
- **Balanced corporate sidebar navigation**:
  - **Overview:** Gross volume metrics, 30-day analytics, sparkline chart, and Supabase database connection monitor.
  - **Orders:** Global milestone contracts oversight with search, status filters (`All`, `Active`, `Settled`), and modal order inspector.
  - **Users:** Directory of registered user tags with verification manager.
  - **Payouts:** Pollar liquidity rails, FX indicators, and banking settlement ledger.
  - **Audit:** Cryptographic activity log stream with actor filters.

---

## 🔑 Seed Test Accounts

| Role | User Tag | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Hirer (Client)** | `@davidvance` | `david@apexdesign.co.uk` | `Password123!` | Apex Design Studio Ltd, London, UK |
| **Talent (Freelancer)**| `@amaraokafor` | `amara.okafor@devhub.ng` | `Password123!` | Senior Engineer, Lagos, Nigeria (GTBank: `0149928371`) |
| **Node Admin** | `@admin` | `admin@kordia.work` | `AdminSecure2026!` | Global Escrow Node Console (`/admin`) |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Styling & Layout:** Corporate HTML styling (`#FAF8FF`, `#0055FF`, `#101828`)
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security)
- **Icons:** Lucide React
- **Blockchain Rails:** Zcash NU5 Testnet (Orchard Pool) + Pollar Settlement API Simulation

---

## 📜 License

MIT License. Designed and engineered for borderless work and private cross-border settlement.
