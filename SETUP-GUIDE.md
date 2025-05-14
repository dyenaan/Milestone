# MQ3K Platform Setup Guide

This guide will help you set up and run the MQ3K platform with all its components working together on the Aptos blockchain.

## Prerequisites

- Node.js (v16+)
- MongoDB
- Aptos CLI (for blockchain interactions)
- Aptos wallet

## Step 1: Set Up Configuration

1. Copy `config.env` to `backend/.env`:
   ```bash
   cp config.env backend/.env
   ```

2. Update the following values in `backend/.env`:
   - `JWT_SECRET` and `JWT_REFRESH_SECRET`: Generate strong random strings
   - `MONGODB_URI`: Update if your MongoDB is not running locally
   - `BLOCKCHAIN_PROVIDER_URL`: Use the appropriate Aptos network URL
   - `BLOCKCHAIN_PRIVATE_KEY`: Your Aptos wallet private key for transactions

## Step 2: Install Aptos CLI

Follow the official Aptos documentation to install the Aptos CLI:

```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

Verify the installation:

```bash
aptos --version
```

## Step 3: Deploy Move Smart Contracts

1. Navigate to the Move contracts directory and compile the Move modules:
   ```bash
   cd contracts/move
   aptos move compile
   ```

2. Deploy the modules:
   ```bash
   npm install
   npm run deploy:devnet  # For devnet
   # or
   npm run deploy:testnet  # For testnet
   ```

3. The deployment script will automatically:
   - Deploy the Move modules
   - Initialize the token and escrow systems
   - Update the addresses in config files

## Step 4: Set Up Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start MongoDB if not already running:
   ```bash
   mongod --dbpath /path/to/data/db
   ```

4. Start the backend server:
   ```bash
   npm run start:dev
   ```

## Step 5: Testing the API

Once the server is running, you can test the API endpoints:

1. Create a user:
   ```bash
   curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"username":"testuser","email":"test@example.com","password":"password123","walletAddress":"0x123..."}'
   ```

2. Login:
   ```bash
   curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'
   ```

3. Use the returned JWT token for authenticated requests:
   ```bash
   curl -X GET http://localhost:3000/projects -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Step 6: Using the Escrow System on Aptos

The escrow system on Aptos involves these key steps:

1. Client creates a project:
   ```bash
   curl -X POST http://localhost:3000/blockchain/project -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"clientAddress":"0xYOUR_ADDRESS","workerAddress":"0xWORKER_ADDRESS","deadline":1672531200}'
   ```

2. Client adds milestones:
   ```bash
   curl -X POST http://localhost:3000/blockchain/project/0/milestone -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"clientAddress":"0xYOUR_ADDRESS","description":"Build MVP","amount":"1000000000","deadline":1672531200}'
   ```

3. Client funds the project:
   ```bash
   curl -X POST http://localhost:3000/blockchain/project/0/fund -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"clientAddress":"0xYOUR_ADDRESS","amount":"1000000000"}'
   ```

4. Worker starts work:
   ```bash
   curl -X POST http://localhost:3000/blockchain/project/0/start -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"workerAddress":"0xWORKER_ADDRESS"}'
   ```

5. Worker submits milestone:
   ```bash
   curl -X POST http://localhost:3000/blockchain/project/0/milestone/0/submit -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"workerAddress":"0xWORKER_ADDRESS","evidence":"https://github.com/repo/commit/123"}'
   ```

6. Reviewers vote on milestone:
   ```bash
   curl -X POST http://localhost:3000/blockchain/project/0/milestone/0/review -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"reviewerAddress":"0xREVIEWER_ADDRESS","approved":true}'
   ```

7. Complete milestone (when enough approvals):
   ```bash
   curl -X POST http://localhost:3000/blockchain/project/0/milestone/0/complete -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Step 7: Reviewer System

To set up reviewers:

1. Users apply to become reviewers:
   ```bash
   curl -X POST http://localhost:3000/blockchain/reviewer/register -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"reviewerAddress":"0xREVIEWER_ADDRESS"}'
   ```

2. Check if an address is a reviewer:
   ```bash
   curl -X GET http://localhost:3000/blockchain/reviewer/0xREVIEWER_ADDRESS -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Aptos Interaction

### Checking Transactions

You can check transaction status on the Aptos explorer:

- Devnet: https://explorer.aptoslabs.com/?network=devnet
- Testnet: https://explorer.aptoslabs.com/?network=testnet

### Using Aptos CLI

You can also interact with the Move modules directly using the Aptos CLI:

```bash
# View account resources
aptos account list --account 0xYOUR_ADDRESS --url https://fullnode.devnet.aptoslabs.com

# Run a Move function
aptos move run --function-id 0xMODULE_ADDRESS::escrow::create_project --args address:0xWORKER_ADDRESS u64:1672531200 address:0xMODULE_ADDRESS
```

## Troubleshooting

### Blockchain Connection Issues

If you encounter blockchain connection issues:

1. Verify your Aptos network is accessible
2. Check that your wallet has sufficient funds (use the faucet for testnet/devnet)
3. Ensure your private key is correct

### Database Issues

If you encounter MongoDB issues:

1. Verify MongoDB is running: `mongo --eval "db.version()"`
2. Check the connection string in `.env`
3. Ensure your IP is allowed if using MongoDB Atlas

### Smart Contract Deployment Issues

If contract deployment fails:

1. Ensure your wallet has sufficient APT for transaction fees
2. Verify your private key is correct
3. Check that you have the correct Aptos CLI version

## Security Notes

- Never share your private keys or `.env` files
- Use strong JWT secrets in production
- Set proper CORS settings in production
- Enable HTTPS in production

## Next Steps

- Implement the frontend UI
- Set up CI/CD for automated deployments
- Add monitoring and logging 