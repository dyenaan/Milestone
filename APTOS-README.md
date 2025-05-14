# MQ3K Platform - Aptos Integration

This document provides an overview of the MQ3K Platform's Aptos blockchain integration. MQ3K is a decentralized escrow system for remote work with milestone verification.

## Architecture Overview

The MQ3K Platform uses Aptos blockchain for its core functionality:

1. **Move Smart Contracts**: Written in the Move language to ensure high security and performance
   - `escrow.move`: Handles project creation, milestone tracking, and payment distribution
   - `token.move`: Implements the MQ3K token for platform payments

2. **Backend API**: NestJS server that interacts with Aptos blockchain
   - `AptosService`: Core service for blockchain interaction
   - `BlockchainController`: REST API endpoints for client applications

3. **Frontend**: React application interacting with the backend API (to be implemented)

## Features

- **Milestone-based Escrow System**: Funds are released only after milestone completion
- **Reviewer Verification**: Third-party reviewers verify work completion
- **Secure Payments**: Using Aptos blockchain for trustless transactions
- **User-friendly API**: Simple REST API for frontend integration

## Aptos Components

### Move Modules

The platform uses two main Move modules:

1. **escrow module**: 
   - Project creation and management
   - Milestone tracking
   - Review system
   - Payment distribution

2. **token module**:
   - MQ3K token implementation
   - Token minting/burning
   - Token transfers

### Key Benefits of Aptos

- **Higher Transaction Throughput**: Aptos can handle more transactions per second
- **Lower Transaction Costs**: Reduced gas fees compared to Ethereum
- **Move Language Security**: Enhanced security through Move's resource model
- **Formal Verification**: Move language supports formal verification

## Testing and Verification

Two test scripts are provided to ensure proper operation:

1. **backend/test-aptos-integration.js**: Tests the backend API with Aptos
2. **contracts/move/test-contracts.js**: Tests the Move contracts directly

### Running Backend Tests

```bash
cd backend
npm install
node test-aptos-integration.js
```

### Running Contract Tests

```bash
cd contracts/move
npm install
node test-contracts.js
```

## Deployment

The Smart Contract deployment process is automated with:

1. **Compile Move modules**:
   ```bash
   cd contracts/move
   aptos move compile
   ```

2. **Deploy to Aptos network**:
   ```bash
   # Deploy to devnet
   npm run deploy:devnet
   
   # Deploy to testnet
   npm run deploy:testnet
   
   # Deploy to mainnet
   npm run deploy:mainnet
   ```

3. **Backend deployment**:
   ```bash
   cd backend
   npm install
   npm run build
   npm run start:prod
   ```

## Configuration

Key configuration files:

1. **config.env**: Main configuration file
   - Blockchain connection settings
   - Module addresses
   - API settings

2. **contracts/move/Move.toml**: Move package configuration
   - Package metadata
   - Dependencies
   - Address mappings

## Troubleshooting

Common issues and solutions:

1. **Connection Issues**:
   - Verify Aptos node URL is correct
   - Check network connectivity

2. **Transaction Failures**:
   - Ensure account has sufficient APT for gas
   - Verify account has proper permissions

3. **Module Not Found**:
   - Check module address in configuration
   - Verify modules were deployed correctly

## Additional Resources

- [Aptos Documentation](https://aptos.dev/docs/guides/move-guides/move-on-aptos)
- [Move Language Documentation](https://move-language.github.io/move/introduction.html)
- [Aptos Explorer](https://explorer.aptoslabs.com/)

## License

MIT License 