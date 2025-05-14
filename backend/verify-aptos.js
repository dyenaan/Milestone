const { AptosClient, AptosAccount, HexString } = require('aptos');
require('dotenv').config();

// Configuration from environment variables
const APTOS_NODE_URL = process.env.BLOCKCHAIN_PROVIDER_URL || 'https://fullnode.devnet.aptoslabs.com';
const MODULE_ADDRESS = process.env.MQ3K_ESCROW_ADDRESS;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;

// Initialize Aptos client
const client = new AptosClient(APTOS_NODE_URL);

// Create Aptos account from private key
function createAccount() {
    if (!PRIVATE_KEY) {
        console.error('ERROR: BLOCKCHAIN_PRIVATE_KEY not found in .env file');
        return null;
    }

    try {
        const account = new AptosAccount(HexString.ensure(PRIVATE_KEY).toUint8Array());
        return account;
    } catch (error) {
        console.error('ERROR: Failed to create account from private key:', error.message);
        return null;
    }
}

// Check account resources
async function checkAccount(account) {
    try {
        console.log('Checking account resources...');
        const resources = await client.getAccountResources(account.address());
        console.log(`Found ${resources.length} resources for account`);
        return resources;
    } catch (error) {
        console.error('ERROR: Failed to get account resources:', error.message);
        return [];
    }
}

// Check connection to Aptos node
async function checkConnection() {
    try {
        console.log(`Connecting to Aptos node at ${APTOS_NODE_URL}...`);
        const ledgerInfo = await client.getLedgerInfo();
        console.log('✅ Successfully connected to Aptos node');
        console.log(`Chain ID: ${ledgerInfo.chain_id}`);
        console.log(`Ledger version: ${ledgerInfo.ledger_version}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to connect to Aptos node:', error.message);
        return false;
    }
}

// Verify configuration
function verifyConfig() {
    console.log('Verifying configuration...');

    if (!APTOS_NODE_URL) {
        console.error('❌ BLOCKCHAIN_PROVIDER_URL not found in .env file');
        return false;
    }

    if (!MODULE_ADDRESS) {
        console.error('❌ MQ3K_ESCROW_ADDRESS not found in .env file');
        return false;
    }

    if (!PRIVATE_KEY) {
        console.error('❌ BLOCKCHAIN_PRIVATE_KEY not found in .env file');
        return false;
    }

    console.log('✅ Configuration verified');
    console.log(`Node URL: ${APTOS_NODE_URL}`);
    console.log(`Module Address: ${MODULE_ADDRESS}`);
    console.log(`Private Key: ${PRIVATE_KEY.substring(0, 4)}...${PRIVATE_KEY.substring(PRIVATE_KEY.length - 4)}`);

    return true;
}

// Main verification function
async function verifyAptos() {
    console.log('==== APTOS VERIFICATION ====');

    // Step 1: Verify configuration
    if (!verifyConfig()) {
        console.error('❌ Configuration verification failed');
        return false;
    }

    // Step 2: Check connection to Aptos node
    if (!await checkConnection()) {
        console.error('❌ Connection to Aptos node failed');
        return false;
    }

    // Step 3: Create account from private key
    const account = createAccount();
    if (!account) {
        console.error('❌ Failed to create account from private key');
        return false;
    }

    console.log(`✅ Successfully created account: ${account.address().hex()}`);

    // Step 4: Check account resources
    const resources = await checkAccount(account);

    console.log('\n==== VERIFICATION SUMMARY ====');
    console.log('✅ Configuration: OK');
    console.log('✅ Aptos Connection: OK');
    console.log('✅ Account Creation: OK');
    console.log(`✅ Account Resources: ${resources.length > 0 ? 'OK' : 'None found (may need funding)'}`);
    console.log('\nThe backend is correctly configured to work with Aptos.');
    console.log('==== END OF VERIFICATION ====');

    return true;
}

// Run verification
verifyAptos().catch(console.error); 