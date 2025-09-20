# 🚀 Milestone – The On-Chain Freelance Platform

**Milestone** is an open-source, decentralized freelance platform built on the **Aptos blockchain**. It enables milestone-based contracts, escrow-secured payments, instant crypto payouts, and decentralized dispute resolution — all designed to empower global freelancers and clients, especially in underserved regions.

---

## 🌍 Why Milestone?

Freelancers today face delayed payouts, high platform fees, and opaque dispute systems. Milestone fixes this by putting **trust, speed, and fairness** on-chain:

- ✅ Smart contract escrow for milestone-based trust
- ⚡ Instant payouts on approval
- 🏛️ Community-powered dispute resolution
- 🌐 Wallet-based access — no bank, no middlemen
- 🌍 Built for the global workforce, especially emerging markets

---

## 🔧 Tech Stack

| Layer      | Technology Used                     |
|------------|-------------------------------------|
| Frontend   | React, Tailwind CSS, Aptos Connect  |
| Backend    | Supabase (PostgreSQL, Auth, Realtime) |
| Blockchain | Aptos (Move smart contracts)        |
| Infra      | Aptos CLI/SDK, Testnet, Webhooks    |

---

## 🏗️ Features

### 💼 Job & Milestone Management
- Clients can create jobs and break them down into milestones
- Freelancers can view, accept, and submit work by milestone

### 🔐 Smart Contract Escrow
- Funds are locked per milestone and only released upon approval

### ⏱️ Instant Payouts
- Freelancers receive funds instantly upon milestone approval
- No waiting periods or intermediaries

### ⚖️ Dispute Resolution
- Community reviewers vote on disputes via on-chain logic
- Fair, transparent, and reputation-based governance

### 🔁 On/Off-Ramps (coming soon)
- Integration with fiat-to-crypto providers for local cashouts

---

## 🧱 Powered by Aptos

Milestone leverages the Aptos blockchain’s cutting-edge features:

- **Move language** for secure and expressive contract logic
- **Parallel execution (Block-STM)** for fast, scalable performance
- **Low fees** perfect for microtransactions
- **Keyless wallet onboarding** with Aptos Connect

---

## 📊 Presentation & Demo

📋 **Project Presentation**: [View Slides on Canva](https://www.canva.com/design/DAGnl_5XSFE/wnr_lorqBmP2vxADFAIsUw/edit?utm_content=DAGnl_5XSFE&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

The presentation covers:
- 🎯 Project vision and problem statement
- 🏗️ Technical architecture and design
- 💡 Key features and innovations
- 🚀 Demo walkthrough
- 🌟 Future roadmap

---

## 📦 Repo Structure

```bash
milestone/
├── frontend/        # React frontend (job UI, wallet connect)
├── contracts/       # Move smart contracts (escrow, disputes)
├── backend/         # Supabase config + webhook handlers
└── docs/            # Architecture diagrams, specs
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Aptos CLI (for smart contract deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/dyenaan/Milestone.git
cd Milestone
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm start
```
The frontend will be available at `http://localhost:3000`

### 3. Setup Backend
```bash
cd backend
npm install
# Configure .env file with Supabase credentials
npm run dev
```
The backend API will be available at `http://localhost:3001`

### 4. Smart Contracts
```bash
cd contracts
npm install
npx hardhat compile
# Deploy to testnet using Hardhat
```

For detailed setup instructions, check the README files in each component directory:
- [Frontend Setup](./frontend/README.md)
- [Backend Setup](./backend/README.md)
- [Smart Contracts Setup](./contracts/README.md)

---

## 🖼️ Screenshots & Demo

### Login Page
![Milestone Login Page](https://github.com/user-attachments/assets/a8467e23-ccb5-4286-a571-cd9d120f37b8)

The Milestone platform features a clean, modern interface with:
- 🔐 Secure email and Google authentication
- 🌐 Aptos wallet integration
- 🎨 Professional UI with Tailwind CSS
- 📱 Responsive design for all devices

*Additional screenshots and demo videos will be added as features are completed.*

---

## 🤝 Contributing

We welcome contributions! Please check our individual component READMEs for development setup:

1. **Frontend Development**: See [frontend/README.md](./frontend/README.md)
2. **Backend Development**: See [backend/README.md](./backend/README.md)
3. **Smart Contract Development**: Check the contracts directory

---

## 📧 Contact & Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/dyenaan/Milestone/issues)
- 💬 **Discussion**: [GitHub Discussions](https://github.com/dyenaan/Milestone/discussions)
- 📋 **Project Board**: Track development progress
