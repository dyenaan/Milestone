# MQ3K Smart Contracts

This directory contains the smart contracts for the MQ3K platform.

## Contracts

- **MQ3KEscrow.sol**: A secure escrow contract that manages work agreements between clients and freelancers, handling fund deposits, work verification, and dispute resolution.
- **MQ3KToken.sol**: An ERC20 token implementation for the MQ3K platform ecosystem.

## Development

### Requirements

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Hardhat](https://hardhat.org/) for Ethereum development environment
- [MetaMask](https://metamask.io/) or another Ethereum wallet

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile contracts:
   ```bash
   npx hardhat compile
   ```

3. Run tests:
   ```bash
   npx hardhat test
   ```

4. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network <network-name>
   ```

## Contract Addresses

Once deployed, update the `.env` file in the backend directory with the deployed contract addresses:

```
MQ3K_ESCROW_ADDRESS=0x...
MQ3K_TOKEN_ADDRESS=0x...
```

## License

[MIT](LICENSE) 