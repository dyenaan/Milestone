import {
    AptosAccount,
    AptosClient,
    TxnBuilderTypes,
    BCS,
    MaybeHexString,
    HexString
} from 'aptos';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const NODE_URL = process.env.APTOS_NODE_URL || 'https://fullnode.devnet.aptoslabs.com';
const FAUCET_URL = process.env.APTOS_FAUCET_URL || 'https://faucet.devnet.aptoslabs.com';

// Initialize the client
const client = new AptosClient(NODE_URL);

// Create or load account
async function getAccount(): Promise<AptosAccount> {
    const privateKeyHex = process.env.PRIVATE_KEY;

    if (privateKeyHex) {
        // Use existing account
        return new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());
    } else {
        // Create new account
        const account = new AptosAccount();
        console.log("Created new account:", account.address().hex());
        console.log("Private key:", Buffer.from(account.signingKey.secretKey).toString('hex').slice(0, 64));

        // Save credentials to .env.local
        const envPath = path.join(__dirname, '../.env.local');
        fs.writeFileSync(
            envPath,
            `PRIVATE_KEY=${Buffer.from(account.signingKey.secretKey).toString('hex').slice(0, 64)}\n` +
            `ACCOUNT_ADDRESS=${account.address().hex()}\n`
        );
        console.log(`Account credentials saved to ${envPath}`);

        return account;
    }
}

// Deploy the module
async function deployModule(account: AptosAccount) {
    try {
        // Read the compiled Move module
        const modulePath = path.join(__dirname, '../build/MQ3K/bytecode_modules');
        const modules = fs.readdirSync(modulePath).filter(file => file.endsWith('.mv'));

        if (modules.length === 0) {
            throw new Error('No compiled modules found. Run "aptos move compile" first.');
        }

        // Deploy each module
        for (const moduleFile of modules) {
            const moduleHex = fs.readFileSync(path.join(modulePath, moduleFile)).toString('hex');
            console.log(`Deploying module: ${moduleFile}`);

            const payload = {
                type: 'module_bundle_payload',
                modules: [
                    { bytecode: `0x${moduleHex}` }
                ]
            };

            // Submit transaction
            const rawTxn = await client.generateTransaction(account.address(), payload);
            const signedTxn = await client.signTransaction(account, rawTxn);
            const txnResult = await client.submitTransaction(signedTxn);

            // Wait for transaction to complete
            await client.waitForTransaction(txnResult.hash);
            console.log(`Module deployed successfully: ${txnResult.hash}`);
        }

        // Update config
        updateConfig(account.address().hex());

        console.log("All modules deployed successfully!");
    } catch (error) {
        console.error("Deployment failed:", error);
    }
}

// Initialize the token
async function initializeToken(account: AptosAccount) {
    try {
        console.log("Initializing MQ3K token...");

        // Create payload to call initialize function
        const initialSupply = "10000000000000000"; // 100M tokens with 8 decimals

        const payload = {
            type: "entry_function_payload",
            function: `${account.address().hex()}::token::initialize`,
            type_arguments: [],
            arguments: [initialSupply]
        };

        // Submit transaction
        const rawTxn = await client.generateTransaction(account.address(), payload);
        const signedTxn = await client.signTransaction(account, rawTxn);
        const txnResult = await client.submitTransaction(signedTxn);

        // Wait for transaction to complete
        await client.waitForTransaction(txnResult.hash);
        console.log(`Token initialized successfully: ${txnResult.hash}`);
    } catch (error) {
        console.error("Token initialization failed:", error);
    }
}

// Initialize the escrow
async function initializeEscrow(account: AptosAccount) {
    try {
        console.log("Initializing MQ3K escrow...");

        const payload = {
            type: "entry_function_payload",
            function: `${account.address().hex()}::escrow::initialize`,
            type_arguments: [`${account.address().hex()}::token::MQ3KToken`],
            arguments: []
        };

        // Submit transaction
        const rawTxn = await client.generateTransaction(account.address(), payload);
        const signedTxn = await client.signTransaction(account, rawTxn);
        const txnResult = await client.submitTransaction(signedTxn);

        // Wait for transaction to complete
        await client.waitForTransaction(txnResult.hash);
        console.log(`Escrow initialized successfully: ${txnResult.hash}`);
    } catch (error) {
        console.error("Escrow initialization failed:", error);
    }
}

// Update config file
function updateConfig(accountAddress: string) {
    try {
        // Update Move.toml
        const moveTomlPath = path.join(__dirname, '../Move.toml');
        let moveToml = fs.readFileSync(moveTomlPath, 'utf8');
        moveToml = moveToml.replace(/mq3k = "0x1"/, `mq3k = "${accountAddress}"`);
        fs.writeFileSync(moveTomlPath, moveToml);
        console.log(`Updated Move.toml with account address: ${accountAddress}`);

        // Create deployments directory
        const deploymentsDir = path.join(__dirname, '../../deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir);
        }

        // Write deployment info
        const deploymentInfo = {
            network: NODE_URL.includes('devnet') ? 'devnet' :
                NODE_URL.includes('testnet') ? 'testnet' : 'mainnet',
            moduleAddress: accountAddress,
            tokenModule: `${accountAddress}::token`,
            escrowModule: `${accountAddress}::escrow`,
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync(
            path.join(deploymentsDir, `${deploymentInfo.network}.json`),
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log(`Deployment info saved to deployments/${deploymentInfo.network}.json`);

        // Update config.env
        updateBackendConfig(accountAddress);
    } catch (error) {
        console.error("Failed to update config:", error);
    }
}

// Update backend config.env
function updateBackendConfig(accountAddress: string) {
    try {
        const configPath = path.join(__dirname, '../../../config.env');
        if (fs.existsSync(configPath)) {
            let config = fs.readFileSync(configPath, 'utf8');

            // Update blockchain provider
            config = config.replace(
                /BLOCKCHAIN_PROVIDER_URL=.*/,
                `BLOCKCHAIN_PROVIDER_URL=${NODE_URL}`
            );

            // Update contract addresses
            config = config.replace(
                /MQ3K_ESCROW_ADDRESS=.*/,
                `MQ3K_ESCROW_ADDRESS=${accountAddress}`
            );

            config = config.replace(
                /MQ3K_TOKEN_ADDRESS=.*/,
                `MQ3K_TOKEN_ADDRESS=${accountAddress}`
            );

            fs.writeFileSync(configPath, config);
            console.log(`Updated config.env with Aptos configuration`);
        }
    } catch (error) {
        console.error("Failed to update backend config:", error);
    }
}

// Main function
async function main() {
    console.log("Deploying MQ3K contracts to Aptos...");

    // Get account
    const account = await getAccount();
    console.log(`Using account: ${account.address().hex()}`);

    // Deploy module
    await deployModule(account);

    // Initialize token
    await initializeToken(account);

    // Initialize escrow
    await initializeEscrow(account);

    console.log("Deployment complete!");
}

// Run the script
main().catch(console.error); 