const { AptosClient, AptosAccount, HexString, FaucetClient } = require('aptos');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Configuration
const NODE_URL = process.env.APTOS_NODE_URL || 'https://fullnode.devnet.aptoslabs.com';
const FAUCET_URL = process.env.APTOS_FAUCET_URL || 'https://faucet.devnet.aptoslabs.com';
const MODULE_ADDRESS = process.env.ACCOUNT_ADDRESS;

// Initialize clients
const client = new AptosClient(NODE_URL);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

// Create test accounts
async function createTestAccounts() {
    // Load or create module owner account
    let moduleOwner;
    if (process.env.PRIVATE_KEY) {
        moduleOwner = new AptosAccount(
            HexString.ensure(process.env.PRIVATE_KEY).toUint8Array()
        );
        console.log('Using existing module owner account:', moduleOwner.address().hex());
    } else {
        throw new Error('Module owner private key not found in .env.local');
    }

    // Create client and worker accounts
    const client = new AptosAccount();
    const worker = new AptosAccount();
    const reviewer = new AptosAccount();

    console.log('Created test accounts:');
    console.log('- Client:', client.address().hex());
    console.log('- Worker:', worker.address().hex());
    console.log('- Reviewer:', reviewer.address().hex());

    // Fund accounts with test tokens
    await fundAccount(client.address());
    await fundAccount(worker.address());
    await fundAccount(reviewer.address());

    return { moduleOwner, client, worker, reviewer };
}

// Fund account with test tokens
async function fundAccount(address) {
    console.log(`Funding account ${address.hex()}...`);
    await faucetClient.fundAccount(address, 100_000_000);
    console.log(`Account funded successfully.`);
}

// Mint MQ3K tokens to client
async function mintTokens(moduleOwner, clientAddress, amount) {
    console.log(`Minting ${amount} tokens to ${clientAddress.hex()}...`);

    const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::token::mint`,
        type_arguments: [],
        arguments: [clientAddress.hex(), amount.toString()]
    };

    const txnHash = await executeTransaction(moduleOwner, payload);
    console.log(`Tokens minted successfully. Transaction: ${txnHash}`);
}

// Create a project
async function createProject(clientAccount, workerAddress, deadline) {
    console.log(`Creating project with worker ${workerAddress.hex()}...`);

    const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::escrow::create_project`,
        type_arguments: [],
        arguments: [workerAddress.hex(), deadline.toString(), MODULE_ADDRESS]
    };

    const txnHash = await executeTransaction(clientAccount, payload);
    console.log(`Project created successfully. Transaction: ${txnHash}`);
    return 0; // First project ID is 0
}

// Add a milestone
async function addMilestone(clientAccount, projectId, description, amount, deadline) {
    console.log(`Adding milestone to project ${projectId}...`);

    const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::escrow::add_milestone`,
        type_arguments: [],
        arguments: [
            projectId.toString(),
            Buffer.from(description).toString('hex'),
            amount.toString(),
            deadline.toString(),
            MODULE_ADDRESS
        ]
    };

    const txnHash = await executeTransaction(clientAccount, payload);
    console.log(`Milestone added successfully. Transaction: ${txnHash}`);
}

// Fund a project
async function fundProject(clientAccount, projectId, amount) {
    console.log(`Funding project ${projectId} with ${amount} tokens...`);

    const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::escrow::fund_project`,
        type_arguments: [`${MODULE_ADDRESS}::token::MQ3KToken`],
        arguments: [
            projectId.toString(),
            amount.toString(),
            MODULE_ADDRESS
        ]
    };

    const txnHash = await executeTransaction(clientAccount, payload);
    console.log(`Project funded successfully. Transaction: ${txnHash}`);
}

// Start work
async function startWork(workerAccount, projectId) {
    console.log(`Starting work on project ${projectId}...`);

    const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::escrow::start_work`,
        type_arguments: [],
        arguments: [
            projectId.toString(),
            MODULE_ADDRESS
        ]
    };

    const txnHash = await executeTransaction(workerAccount, payload);
    console.log(`Work started successfully. Transaction: ${txnHash}`);
}

// Submit milestone
async function submitMilestone(workerAccount, projectId, milestoneId, evidence) {
    console.log(`Submitting milestone ${milestoneId} for project ${projectId}...`);

    const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::escrow::submit_milestone`,
        type_arguments: [],
        arguments: [
            projectId.toString(),
            milestoneId.toString(),
            Buffer.from(evidence).toString('hex'),
            MODULE_ADDRESS
        ]
    };

    const txnHash = await executeTransaction(workerAccount, payload);
    console.log(`Milestone submitted successfully. Transaction: ${txnHash}`);
}

// Register as reviewer
async function registerAsReviewer(reviewerAccount) {
    console.log(`Registering as reviewer...`);

    const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::escrow::register_as_reviewer`,
        type_arguments: [],
        arguments: [MODULE_ADDRESS]
    };

    const txnHash = await executeTransaction(reviewerAccount, payload);
    console.log(`Registered as reviewer successfully. Transaction: ${txnHash}`);
}

// Review milestone
async function reviewMilestone(reviewerAccount, projectId, milestoneId, approved) {
    console.log(`Reviewing milestone ${milestoneId} for project ${projectId}...`);

    const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::escrow::review_milestone`,
        type_arguments: [],
        arguments: [
            projectId.toString(),
            milestoneId.toString(),
            approved,
            MODULE_ADDRESS
        ]
    };

    const txnHash = await executeTransaction(reviewerAccount, payload);
    console.log(`Milestone reviewed successfully. Transaction: ${txnHash}`);
}

// Complete milestone
async function completeMilestone(moduleOwner, projectId, milestoneId) {
    console.log(`Completing milestone ${milestoneId} for project ${projectId}...`);

    const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::escrow::complete_milestone`,
        type_arguments: [`${MODULE_ADDRESS}::token::MQ3KToken`],
        arguments: [
            projectId.toString(),
            milestoneId.toString(),
            MODULE_ADDRESS
        ]
    };

    const txnHash = await executeTransaction(moduleOwner, payload);
    console.log(`Milestone completed successfully. Transaction: ${txnHash}`);
}

// Check project status
async function getProjectStatus(projectId) {
    console.log(`Checking status for project ${projectId}...`);

    const resource = await client.view({
        function: `${MODULE_ADDRESS}::escrow::get_project_status`,
        type_arguments: [],
        arguments: [projectId.toString(), MODULE_ADDRESS],
    });

    const status = parseInt(resource[0]);
    console.log(`Project status: ${status}`);
    return status;
}

// Check milestone status
async function getMilestoneStatus(projectId, milestoneId) {
    console.log(`Checking status for milestone ${milestoneId} in project ${projectId}...`);

    const resource = await client.view({
        function: `${MODULE_ADDRESS}::escrow::get_milestone_status`,
        type_arguments: [],
        arguments: [projectId.toString(), milestoneId.toString(), MODULE_ADDRESS],
    });

    const status = parseInt(resource[0]);
    console.log(`Milestone status: ${status}`);
    return status;
}

// Check if an address is a reviewer
async function isReviewer(address) {
    console.log(`Checking if ${address.hex()} is a reviewer...`);

    const resource = await client.view({
        function: `${MODULE_ADDRESS}::escrow::is_reviewer`,
        type_arguments: [],
        arguments: [address.hex(), MODULE_ADDRESS],
    });

    const isReviewerResult = resource[0];
    console.log(`Is reviewer: ${isReviewerResult}`);
    return isReviewerResult;
}

// Execute transaction
async function executeTransaction(account, payload) {
    try {
        const txnRequest = await client.generateTransaction(account.address(), payload);
        const signedTxn = await client.signTransaction(account, txnRequest);
        const transactionRes = await client.submitTransaction(signedTxn);
        await client.waitForTransaction(transactionRes.hash);
        return transactionRes.hash;
    } catch (error) {
        console.error('Error executing transaction:', error);
        throw error;
    }
}

// Run test sequence
async function runTests() {
    console.log('Starting Aptos contract tests...');
    console.log(`Using module address: ${MODULE_ADDRESS}`);

    try {
        // Create test accounts
        const { moduleOwner, client: clientAccount, worker: workerAccount, reviewer: reviewerAccount } = await createTestAccounts();

        // Test MQ3K token
        const tokenAmount = 100_000_000_000; // 1000 tokens with 8 decimals
        await mintTokens(moduleOwner, clientAccount.address(), tokenAmount);

        // Test escrow workflow
        const now = Math.floor(Date.now() / 1000);
        const projectDeadline = now + 30 * 24 * 60 * 60; // 30 days from now
        const milestoneDeadline = now + 15 * 24 * 60 * 60; // 15 days from now

        // Create project
        const projectId = await createProject(clientAccount, workerAccount.address(), projectDeadline);

        // Add milestone
        const milestoneAmount = 10_000_000_000; // 100 tokens with 8 decimals
        await addMilestone(clientAccount, projectId, 'Test milestone', milestoneAmount, milestoneDeadline);

        // Fund project
        await fundProject(clientAccount, projectId, milestoneAmount);

        // Verify project status after funding
        const projectStatusAfterFunding = await getProjectStatus(projectId);
        if (projectStatusAfterFunding !== 1) { // PROJECT_STATUS_FUNDED
            throw new Error(`Expected project status to be 1 (FUNDED), got ${projectStatusAfterFunding}`);
        }

        // Start work
        await startWork(workerAccount, projectId);

        // Verify project status after starting work
        const projectStatusAfterStarting = await getProjectStatus(projectId);
        if (projectStatusAfterStarting !== 2) { // PROJECT_STATUS_IN_PROGRESS
            throw new Error(`Expected project status to be 2 (IN_PROGRESS), got ${projectStatusAfterStarting}`);
        }

        // Register reviewer
        await registerAsReviewer(reviewerAccount);

        // Verify reviewer status
        const reviewerStatusAfterRegistration = await isReviewer(reviewerAccount.address());
        if (!reviewerStatusAfterRegistration) {
            throw new Error('Expected address to be registered as reviewer');
        }

        // Submit milestone
        const milestoneId = 0;
        await submitMilestone(workerAccount, projectId, milestoneId, 'https://github.com/repo/commit/123');

        // Verify milestone status after submission
        const milestoneStatusAfterSubmission = await getMilestoneStatus(projectId, milestoneId);
        if (milestoneStatusAfterSubmission !== 3) { // MILESTONE_STATUS_UNDER_REVIEW
            throw new Error(`Expected milestone status to be 3 (UNDER_REVIEW), got ${milestoneStatusAfterSubmission}`);
        }

        // Review milestone
        await reviewMilestone(reviewerAccount, projectId, milestoneId, true);

        // Complete milestone
        await completeMilestone(moduleOwner, projectId, milestoneId);

        // Verify milestone status after completion
        const milestoneStatusAfterCompletion = await getMilestoneStatus(projectId, milestoneId);
        if (milestoneStatusAfterCompletion !== 7) { // MILESTONE_STATUS_COMPLETED
            throw new Error(`Expected milestone status to be 7 (COMPLETED), got ${milestoneStatusAfterCompletion}`);
        }

        console.log('All contract tests completed successfully!');
        console.log('The Aptos smart contracts are working correctly.');

    } catch (error) {
        console.error('Test failed:', error);
        console.log('Please check your contract deployment and Aptos configuration.');
    }
}

// Run the tests
runTests(); 