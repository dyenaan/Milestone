# MQ3K Platform

A decentralized platform for remote work and project management with blockchain-based escrow and verification for the Consensus Hackathon.

## System Architecture

The MQ3K platform consists of three main components:

1. **Smart Contracts** - Blockchain-based contracts for secure transactions
2. **Backend API** - NestJS-based RESTful API for business logic
3. **Frontend** - React-based user interface (to be implemented)

### Smart Contracts

The platform utilizes two main smart contracts:

- **MQ3KEscrow**: Handles secure payments, project lifecycle management, milestones, reviewer verification, and dispute resolution
- **MQ3KToken**: ERC20 token implementation for the platform ecosystem and incentives

### Key Features

#### Milestone-Based Escrow
- Clients can create projects with multiple milestones
- Each milestone has a description, amount, and deadline
- Funds are locked in escrow and released only upon successful completion
- Multi-party verification through trusted reviewers

#### Decentralized Review System
- Community members can apply to become reviewers
- Reviewers build reputation through successful verifications
- Multiple reviewers vote on milestone completion
- Reviewers earn rewards for their contributions

#### Fair Dispute Resolution
- Transparent voting system for milestone approvals
- Dispute mechanism for both clients and freelancers
- Admin intervention for complex disputes
- Reputation and incentives aligned with honest behavior

### Backend API

The backend is built with NestJS and provides the following modules:

- **Authentication**: User signup, login, and JWT-based authorization
- **Blockchain**: Integration with smart contracts
- **Users**: User profile management
- **Jobs**: Project/job creation and management
- **Reviewers**: Reviewer application, approval, and statistics
- **Payments**: Payment processing and transaction history
- **Reviews**: User ratings and reviews

### Frontend (To Be Implemented)

The frontend will be a responsive web application built with React, providing:

- User authentication and profile management
- Project creation, discovery, and management
- Milestone tracking and submission
- Reviewer application and voting interface
- Real-time messaging and notifications
- Wallet integration and transaction history
- Rating and review system

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Ethereum development environment (Hardhat, Ganache, etc.)

### Installation

1. Clone the repository
2. Install dependencies for backend:
   ```bash
   cd backend
   npm install
   ```
3. Set up environment variables (copy from `src/config/env.example`)
4. Set up and deploy smart contracts (see `contracts/README.md`)
5. Run the backend server:
   ```bash
   npm run start:dev
   ```

## User Flows

### Client Flow
1. Sign up/login to the platform
2. Create a new project
3. Add milestones with descriptions and amounts
4. Fund the project (funds go to escrow)
5. Monitor progress and approve completed work

### Freelancer Flow
1. Sign up/login with social or wallet
2. Browse and apply for projects
3. Begin work once hired and funded
4. Submit deliverables for each milestone
5. Receive automatic payment upon approval

### Reviewer Flow
1. Apply to become a reviewer
2. Get approved by platform administrators
3. Review submitted milestone deliverables
4. Vote approve/reject with supporting evidence
5. Earn rewards and build reputation

## Blockchain Integration

- **Ethereum**: Primary blockchain for smart contracts
- **Stellar**: Integration for fast, low-cost payments (to be implemented)
- **Web3**: Wallet integration for transaction signing

## Project Status

This project is currently under development for the Consensus Hackathon. The smart contracts and backend API are functional, and the frontend UI is in progress.

## License

[MIT](LICENSE)
