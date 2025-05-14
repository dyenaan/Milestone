const axios = require('axios');
const { AptosClient, AptosAccount, HexString } = require('aptos');
require('dotenv').config();

const API_URL = 'http://localhost:3000';
const APTOS_NODE_URL = process.env.BLOCKCHAIN_PROVIDER_URL || 'https://fullnode.devnet.aptoslabs.com';

// Test user credentials
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
    walletAddress: ''
};

// Initialize Aptos client
const client = new AptosClient(APTOS_NODE_URL);

// Create test account
async function createAptosAccount() {
    const account = new AptosAccount();
    console.log('Created test account:', account.address().hex());
    TEST_USER.walletAddress = account.address().hex();
    return account;
}

// Register test user
async function registerUser() {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, TEST_USER);
        console.log('User registered successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error.response?.data || error.message);
        throw error;
    }
}

// Login test user
async function loginUser() {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        console.log('User logged in successfully');
        return response.data.accessToken;
    } catch (error) {
        console.error('Error logging in:', error.response?.data || error.message);
        throw error;
    }
}

// Create a test project
async function createProject(token) {
    try {
        const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now
        const response = await axios.post(
            `${API_URL}/blockchain/project`,
            {
                clientAddress: TEST_USER.walletAddress,
                workerAddress: TEST_USER.walletAddress, // Using same address for simplicity
                deadline
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        console.log('Project created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating project:', error.response?.data || error.message);
        throw error;
    }
}

// Get project status
async function getProjectStatus(projectId) {
    try {
        const response = await axios.get(`${API_URL}/blockchain/project/${projectId}/status`);
        console.log(`Project ${projectId} status:`, response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting project status:', error.response?.data || error.message);
        throw error;
    }
}

// Add milestone to project
async function addMilestone(token, projectId) {
    try {
        const deadline = Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60; // 15 days from now
        const response = await axios.post(
            `${API_URL}/blockchain/project/${projectId}/milestone`,
            {
                clientAddress: TEST_USER.walletAddress,
                description: 'Test milestone',
                amount: '1000000000', // 10 tokens with 8 decimals
                deadline
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        console.log('Milestone added successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding milestone:', error.response?.data || error.message);
        throw error;
    }
}

// Register as reviewer
async function registerAsReviewer(token) {
    try {
        const response = await axios.post(
            `${API_URL}/blockchain/reviewer/register`,
            {
                reviewerAddress: TEST_USER.walletAddress
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        console.log('Registered as reviewer successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error registering as reviewer:', error.response?.data || error.message);
        throw error;
    }
}

// Check if address is a reviewer
async function checkIsReviewer() {
    try {
        const response = await axios.get(`${API_URL}/blockchain/reviewer/${TEST_USER.walletAddress}`);
        console.log('Is reviewer check:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error checking reviewer status:', error.response?.data || error.message);
        throw error;
    }
}

// Run the test sequence
async function runTests() {
    try {
        console.log('Starting Aptos backend integration tests...');

        // Create Aptos account
        await createAptosAccount();

        // Register and login
        await registerUser();
        const token = await loginUser();

        // Test blockchain operations
        const project = await createProject(token);
        const projectId = 0; // First project ID should be 0

        // Get project status
        await getProjectStatus(projectId);

        // Add milestone
        await addMilestone(token, projectId);

        // Register as reviewer
        await registerAsReviewer(token);

        // Check reviewer status
        await checkIsReviewer();

        console.log('All tests completed successfully!');
        console.log('The backend is correctly configured to work with Aptos.');
    } catch (error) {
        console.error('Test failed:', error);
        console.log('Please check your backend configuration and Aptos connectivity.');
    }
}

// Run tests
runTests(); 